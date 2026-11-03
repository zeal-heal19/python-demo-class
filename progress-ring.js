// Rounding down means 100% only ever appears when everything is complete.
function percentOf(done, total) {
  return total ? Math.floor((done / total) * 100) : 0;
}

function createProgressRing(percent) {
  const ring = Object.assign(document.createElement("span"), { className: "ring" });
  ring.style.setProperty("--percent", percent);
  ring.append(Object.assign(document.createElement("span"), { textContent: `${percent}%` }));
  return ring;
}
