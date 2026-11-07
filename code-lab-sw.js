// Lets input() in the Code Lab wait while the user types in the terminal.
// Python runs in a worker that can't pause for a message, so for each line it makes a
// request to /__code-lab-stdin. This script holds that request open until the page
// sends the typed line. It only serves the Code Lab, and only that one address.

const HOLD_MS = 25000;
const waiting = new Map();
// A line can arrive just before its request does.
const early = new Map();

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("message", (event) => {
  const { type, id, text } = event.data || {};
  if (typeof id !== "string") return;
  if (type === "cancel") {
    early.delete(id);
    waiting.get(id)?.(null);
    waiting.delete(id);
    return;
  }
  if (type !== "stdin" || typeof text !== "string") return;
  const answer = waiting.get(id);
  if (answer) {
    waiting.delete(id);
    answer(text);
  } else {
    early.set(id, text);
  }
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.endsWith("/__code-lab-stdin")) return;
  const id = url.searchParams.get("id") || "";
  const line = new Promise((resolve) => {
    if (early.has(id)) {
      resolve(early.get(id));
      early.delete(id);
      return;
    }
    waiting.set(id, resolve);
    // Answers "nothing yet" after a while, and the worker asks again. A browser may stop a
    // request that is held open for minutes.
    setTimeout(() => {
      if (waiting.get(id) !== resolve) return;
      waiting.delete(id);
      resolve(null);
    }, HOLD_MS);
  });
  event.respondWith(line.then((text) => (text === null
    ? new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } })
    : new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } }))));
});
