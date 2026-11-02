// Runs Python in a worker so that an endless loop can be stopped without freezing the page.
const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
const RUN_LIMIT_MS = 15000;
const WORKER_SOURCE = `
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
      await py.runPythonAsync(data, { globals: namespace });
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
  function run(code, onStarted) {
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
      worker.postMessage(code);
    });
  }

  return { run };
}
