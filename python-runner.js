// Runs Python in a worker so that an endless loop can be stopped without freezing the page.
const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
const RUN_LIMIT_MS = 15000;
// Runs before every program. input() hands back the test's typed lines without printing the prompt,
// so a learner's prompt wording never affects whether their output matches.
const FRESH_START = `
import builtins, os, sys, tempfile
os.chdir(tempfile.mkdtemp())
if "logging" in sys.modules:
    import logging
    logging.root.handlers.clear()
    logging.root.setLevel(logging.WARNING)
lines = list(typed)
def typed_input(prompt=""):
    if not lines:
        raise OSError("I/O error: there's no more typed input")
    return lines.pop(0)
builtins.input = typed_input
`;
const WORKER_SOURCE = `
  const FRESH_START = ${JSON.stringify(FRESH_START)};
  importScripts("${PYODIDE_URL}pyodide.js");
  const ready = loadPyodide({ indexURL: "${PYODIDE_URL}" }).then((py) => {
    py.setStdout({ batched: (text) => postMessage({ out: text }) });
    py.setStderr({ batched: (text) => postMessage({ out: text }) });
    py.setStdin({ error: true });
    return py;
  });
  onmessage = async ({ data }) => {
    try {
      const py = await ready;
      postMessage({ started: true });
      // A fresh namespace stops variables from an earlier run leaking into this one.
      const namespace = py.toPy({ __name__: "__main__" });
      // Each run also gets an empty folder, fresh logging, and the lines a test "types" for input().
      await py.runPythonAsync(FRESH_START, { globals: py.toPy({ typed: data.inputs || [] }) });
      // Setup runs separately so that line numbers in errors still match the learner's code.
      if (data.setup) await py.runPythonAsync(data.setup, { globals: namespace });
      await py.runPythonAsync(data.code, { globals: namespace });
      postMessage({ done: true });
    } catch (error) {
      postMessage({ done: true, error: String(error.message || error) });
    }
  };
`;

// Beginners only need the part of a traceback that points at their own code.
function friendlyError(message) {
  const start = message.indexOf('File "<exec>"');
  const text = start === -1 ? message : `Traceback:\n  ${message.slice(start)}`;
  return message.includes("I/O error")
    ? `${text}\ninput() isn't available in this lab, so set the value in your code instead.`
    : text;
}

function createPythonRunner() {
  let worker = null;

  function stopWorker() {
    if (worker) worker.terminate();
    worker = null;
  }

  // Resolves to { status, output }, where status is "ok", "error", "timeout" or "load-failed".
  function run(code, onStarted, setup, inputs) {
    return new Promise((resolve) => {
      if (!worker) {
        worker = new Worker(URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" })));
      }
      let output = "";
      let timer = null;
      const finish = (status, text = output) => {
        clearTimeout(timer);
        resolve({ status, output: text });
      };
      worker.onerror = () => {
        stopWorker();
        finish("load-failed", "Python couldn't load. Please check your connection and try again.");
      };
      worker.onmessage = ({ data }) => {
        if (data.started) {
          if (onStarted) onStarted();
          timer = setTimeout(() => {
            stopWorker();
            finish("timeout", `${output}\nStopped after 15 seconds. Check your code for an endless loop.`.trim());
          }, RUN_LIMIT_MS);
        }
        if (data.out !== undefined) output += `${data.out}\n`;
        if (data.done) {
          if (data.error) finish("error", output + friendlyError(data.error));
          else finish("ok");
        }
      };
      worker.postMessage({ code, setup, inputs });
    });
  }

  return { run };
}

const CHECK_MARKER = "__CHECK_OUTPUT__";

function tidyOutput(text) {
  return text.split("\n").map((line) => line.trimEnd()).join("\n").trim();
}

// Runs a learner's code against a question. A question with a "test" runs that code
// afterwards and checks what it prints. Otherwise, the check uses what the learner's code prints.
async function runAndCheck(runner, question, code, onStarted) {
  const program = question.test ? `${code}\n\nprint("${CHECK_MARKER}")\n${question.test}` : code;
  const result = await runner.run(program, onStarted, question.setup, question.inputs);
  const [shown, tested = ""] = result.output.split(`${CHECK_MARKER}\n`);
  if (result.status !== "ok") {
    return { status: result.status, isRight: false, display: tidyOutput(result.output.replace(`${CHECK_MARKER}\n`, "")) };
  }
  const yours = tidyOutput(shown);
  const display = question.test
    ? `${yours ? `${yours}\n\n` : ""}Our test printed:\n${tidyOutput(tested)}`
    : yours || "Your code ran, but it didn't print anything.";
  const isRight = tidyOutput(question.test ? tested : shown) === question.expected;
  return { status: "ok", isRight, display };
}

function describeTestCase({ setup, test, inputs }) {
  const typed = inputs && inputs.length ? `The user types: ${inputs.join(", then ")}` : "";
  return [setup, test, typed].filter(Boolean).join("\n");
}

// Runs a learner's code against every test case of a question, each in a fresh Python session.
// The report lists every result and explains only the first problem, to keep it readable.
async function runTests(runner, question, code, onStarted) {
  const total = question.tests.length;
  const results = [];
  for (const testCase of question.tests) {
    const result = await runAndCheck(runner, testCase, code, onStarted);
    results.push(result);
    // After a timeout or a failed load, the remaining test cases would only fail the same way.
    if (result.status === "timeout" || result.status === "load-failed") break;
  }

  const lines = question.tests.map((_, index) => {
    const result = results[index];
    const state = !result ? "Not run" : result.isRight ? "Passed" : result.status === "ok" ? "Failed" : "Stopped with a problem";
    return `Test ${index + 1} of ${total}: ${state}`;
  });
  const firstProblem = results.findIndex((result) => !result.isRight);
  const passed = results.filter((result) => result.isRight).length;
  if (firstProblem === -1) {
    // Show what the program printed too, not only the pass lines, so learners see their output.
    const label = total === 1 ? "Your output:" : "Your output (test 1):";
    return { status: "ok", isRight: true, passed, total, display: `${label}\n${results[0].display}\n\n${lines.join("\n")}` };
  }

  const problem = results[firstProblem];
  const testCase = question.tests[firstProblem];
  const given = describeTestCase(testCase);
  const details = [
    `Test ${firstProblem + 1} details:`,
    ...(given ? [`Given:\n${given}`] : []),
    `Expected output:\n${testCase.expected}`,
    `Your result:\n${problem.display}`,
  ];
  return { status: problem.status, isRight: false, passed, total, display: `${lines.join("\n")}\n\n${details.join("\n\n")}` };
}
