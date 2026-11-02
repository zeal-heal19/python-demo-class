// Lets a draggable divider resize two panels. The panels sit side by side, or stack on phones.
const MIN_SPLIT = 25;
const MAX_SPLIT = 75;
const KEY_STEP = 2;

function initSplitPane(workspace, divider) {
  const stacked = window.matchMedia("(max-width: 800px)");

  function setSplit(percent) {
    const split = Math.min(MAX_SPLIT, Math.max(MIN_SPLIT, percent));
    workspace.style.setProperty("--split", `${split}%`);
    divider.setAttribute("aria-valuenow", Math.round(split));
  }

  function setOrientation() {
    divider.setAttribute("aria-orientation", stacked.matches ? "horizontal" : "vertical");
  }

  function drag(event) {
    const box = workspace.getBoundingClientRect();
    setSplit(stacked.matches
      ? ((event.clientY - box.top) / box.height) * 100
      : ((event.clientX - box.left) / box.width) * 100);
  }

  function endDrag() {
    divider.classList.remove("dragging");
    document.body.classList.remove("resizing");
    divider.removeEventListener("pointermove", drag);
  }

  divider.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    divider.focus({ preventScroll: true });
    divider.setPointerCapture(event.pointerId);
    divider.classList.add("dragging");
    document.body.classList.add("resizing");
    divider.addEventListener("pointermove", drag);
  });
  divider.addEventListener("pointerup", endDrag);
  divider.addEventListener("pointercancel", endDrag);
  divider.addEventListener("dblclick", () => setSplit(50));
  divider.addEventListener("keydown", (event) => {
    const decrease = stacked.matches ? "ArrowUp" : "ArrowLeft";
    const increase = stacked.matches ? "ArrowDown" : "ArrowRight";
    if (event.key !== decrease && event.key !== increase) return;
    event.preventDefault();
    const change = event.key === increase ? KEY_STEP : -KEY_STEP;
    setSplit(Number(divider.getAttribute("aria-valuenow")) + change);
  });
  stacked.addEventListener("change", setOrientation);
  setOrientation();
}
