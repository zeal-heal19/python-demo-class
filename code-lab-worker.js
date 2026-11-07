// Runs the Code Lab's Python. Each run gets a fresh namespace. Packages such as numpy and
// pandas load the first time they're imported. code-lab-sw.js answers the input() requests.

const decoder = new TextDecoder();
let ready = null;
let runId = "";
let asked = 0;

// Waits for the line typed in the terminal. Returns null, which Python reads as the end of
// input, if the page can't pass lines on.
function readLine() {
  const id = `${runId}-${asked++}`;
  postMessage({ waitingForInput: id });
  for (;;) {
    const request = new XMLHttpRequest();
    request.open("GET", `__code-lab-stdin?id=${encodeURIComponent(id)}`, false);
    try {
      request.send();
    } catch (error) {
      // The request was dropped while waiting, so it's made again.
      continue;
    }
    if (request.status === 200) return request.responseText;
    if (request.status === 204) continue;
    postMessage({ inputUnavailable: true });
    return null;
  }
}

onmessage = async ({ data }) => {
  if (data.pyodideUrl) {
    importScripts(`${data.pyodideUrl}pyodide.js`);
    ready = loadPyodide({ indexURL: data.pyodideUrl }).then((py) => {
      py.setStdout({ write: (bytes) => { postMessage({ out: decoder.decode(bytes) }); return bytes.length; } });
      py.setStderr({ write: (bytes) => { postMessage({ err: decoder.decode(bytes) }); return bytes.length; } });
      py.setStdin({ stdin: readLine });
      return py;
    });
    return;
  }
  try {
    const py = await ready;
    runId = data.runId;
    asked = 0;
    await py.loadPackagesFromImports(data.code, { messageCallback: (text) => postMessage({ info: text }) });
    postMessage({ started: true });
    const namespace = py.toPy({ __name__: "__main__" });
    await py.runPythonAsync(data.code, { globals: namespace });
    postMessage({ done: true });
  } catch (error) {
    postMessage({ done: true, error: String(error.message || error) });
  }
};
