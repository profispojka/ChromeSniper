(() => {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483647;
  `;
  document.documentElement.appendChild(overlay);

  let startX = 0;
  let startY = 0;
  let currentSquare = null;
  let activePointerId = null;

  const makeSquare = (x, y) => {
    const sq = document.createElement('div');
    sq.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 0px;
      height: 0px;
      border: 2px solid red;
      background: rgba(255, 0, 0, 0.15);
      box-sizing: border-box;
    `;
    overlay.appendChild(sq);
    return sq;
  };

  const updateSquare = (x, y) => {
    if (!currentSquare) return;
    const left = Math.min(startX, x);
    const top = Math.min(startY, y);
    const width = Math.abs(x - startX);
    const height = Math.abs(y - startY);
    currentSquare.style.left = `${left}px`;
    currentSquare.style.top = `${top}px`;
    currentSquare.style.width = `${width}px`;
    currentSquare.style.height = `${height}px`;
  };

  const finish = () => {
    currentSquare = null;
    activePointerId = null;
  };

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    currentSquare = makeSquare(startX, startY);
    activePointerId = e.pointerId;
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch {}
  }, true);

  document.addEventListener('pointermove', (e) => {
    if (currentSquare === null || e.pointerId !== activePointerId) return;
    updateSquare(e.clientX, e.clientY);
  }, true);

  document.addEventListener('pointerup', (e) => {
    if (e.pointerId !== activePointerId) return;
    finish();
  }, true);

  document.addEventListener('pointercancel', (e) => {
    if (e.pointerId !== activePointerId) return;
    finish();
  }, true);

  document.addEventListener('dragstart', (e) => {
    if (currentSquare) e.preventDefault();
  }, true);

  document.addEventListener('selectstart', (e) => {
    if (currentSquare) e.preventDefault();
  }, true);
})();
