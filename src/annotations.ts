(() => {
  type Tool = 'none' | 'pen' | 'arrow' | 'rect' | 'highlight';

  type Annotation =
    | { kind: 'pen'; points: [number, number][]; color: string; width: number }
    | { kind: 'arrow'; from: [number, number]; to: [number, number]; color: string; width: number }
    | { kind: 'rect'; x: number; y: number; w: number; h: number; color: string; width: number }
    | { kind: 'highlight'; x: number; y: number; w: number; h: number; color: string };

  type AnnotationLayer = {
    canvas: HTMLCanvasElement;
    setTool: (t: Tool) => void;
    getTool: () => Tool;
    setColor: (c: string) => void;
    getColor: () => string;
    cycleColor: () => string;
    undo: () => boolean;
    hasItems: () => boolean;
    getAnnotations: () => Annotation[];
    destroy: () => void;
    onChange: (cb: () => void) => () => void;
  };

  type AnnotationsAPI = {
    mount: (sq: HTMLDivElement, opts: { cssWidth: number; cssHeight: number }) => AnnotationLayer;
    render: (ctx: CanvasRenderingContext2D, list: Annotation[], scale: number) => void;
    COLORS: string[];
  };

  const COLORS = ['#FF3B30', '#FFCC00', '#34C759', '#0A84FF', '#FFFFFF'];
  const STROKE_WIDTH = 3;

  const drawOne = (ctx: CanvasRenderingContext2D, a: Annotation, scale: number): void => {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (a.kind === 'highlight') {
      ctx.fillStyle = a.color;
      ctx.globalAlpha = 0.32;
      ctx.fillRect(a.x * scale, a.y * scale, a.w * scale, a.h * scale);
      ctx.restore();
      return;
    }

    ctx.strokeStyle = a.color;
    ctx.fillStyle = a.color;
    ctx.lineWidth = Math.max(1, a.width * scale);

    if (a.kind === 'pen') {
      if (a.points.length === 1) {
        const [x, y] = a.points[0]!;
        ctx.beginPath();
        ctx.arc(x * scale, y * scale, (a.width * scale) / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        const [x0, y0] = a.points[0]!;
        ctx.moveTo(x0 * scale, y0 * scale);
        for (let i = 1; i < a.points.length; i++) {
          const [x, y] = a.points[i]!;
          ctx.lineTo(x * scale, y * scale);
        }
        ctx.stroke();
      }
    } else if (a.kind === 'rect') {
      ctx.strokeRect(a.x * scale, a.y * scale, a.w * scale, a.h * scale);
    } else if (a.kind === 'arrow') {
      const [fx, fy] = a.from;
      const [tx, ty] = a.to;
      const sx = fx * scale, sy = fy * scale, ex = tx * scale, ey = ty * scale;
      const dx = ex - sx, dy = ey - sy;
      const len = Math.hypot(dx, dy);
      if (len < 0.5) {
        ctx.restore();
        return;
      }
      const ah = Math.min(18 * scale, len * 0.4);
      const angle = Math.atan2(dy, dx);
      const baseX = ex - Math.cos(angle) * ah * 0.6;
      const baseY = ey - Math.sin(angle) * ah * 0.6;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(baseX, baseY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - Math.cos(angle - Math.PI / 6) * ah, ey - Math.sin(angle - Math.PI / 6) * ah);
      ctx.lineTo(ex - Math.cos(angle + Math.PI / 6) * ah, ey - Math.sin(angle + Math.PI / 6) * ah);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  };

  const render = (ctx: CanvasRenderingContext2D, list: Annotation[], scale: number): void => {
    for (const a of list) drawOne(ctx, a, scale);
  };

  const mount = (sq: HTMLDivElement, opts: { cssWidth: number; cssHeight: number }): AnnotationLayer => {
    const dpr = window.devicePixelRatio || 1;
    const canvas = document.createElement('canvas');
    canvas.dataset.role = 'annotation-canvas';
    canvas.width = Math.max(1, Math.round(opts.cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(opts.cssHeight * dpr));
    canvas.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
      border-radius: inherit;
    `;
    sq.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let tool: Tool = 'none';
    let color: string = COLORS[0]!;
    const annotations: Annotation[] = [];
    let inProgress: Annotation | null = null;
    let rectAnchor: [number, number] | null = null;
    let activePointerId: number | null = null;
    const callbacks: Set<() => void> = new Set();

    const fireChange = () => {
      callbacks.forEach((cb) => {
        try { cb(); } catch (err) { console.error('annotation onChange', err); }
      });
    };

    const redraw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const a of annotations) drawOne(ctx, a, dpr);
      if (inProgress) drawOne(ctx, inProgress, dpr);
    };

    const localCoords = (e: PointerEvent): [number, number] => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * opts.cssWidth;
      const y = ((e.clientY - rect.top) / rect.height) * opts.cssHeight;
      return [x, y];
    };

    const onPointerDown = (e: PointerEvent) => {
      if (tool === 'none') return;
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      const [x, y] = localCoords(e);
      activePointerId = e.pointerId;
      try { canvas.setPointerCapture(e.pointerId); } catch {}
      if (tool === 'pen') {
        inProgress = { kind: 'pen', points: [[x, y]], color, width: STROKE_WIDTH };
      } else if (tool === 'arrow') {
        inProgress = { kind: 'arrow', from: [x, y], to: [x, y], color, width: STROKE_WIDTH };
      } else if (tool === 'rect') {
        rectAnchor = [x, y];
        inProgress = { kind: 'rect', x, y, w: 0, h: 0, color, width: STROKE_WIDTH };
      } else if (tool === 'highlight') {
        rectAnchor = [x, y];
        inProgress = { kind: 'highlight', x, y, w: 0, h: 0, color };
      }
      redraw();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId || !inProgress) return;
      const [x, y] = localCoords(e);
      if (inProgress.kind === 'pen') {
        const last = inProgress.points[inProgress.points.length - 1]!;
        if (Math.hypot(x - last[0], y - last[1]) >= 1) {
          inProgress.points.push([x, y]);
        }
      } else if (inProgress.kind === 'arrow') {
        inProgress.to = [x, y];
      } else if ((inProgress.kind === 'rect' || inProgress.kind === 'highlight') && rectAnchor) {
        const [ax, ay] = rectAnchor;
        inProgress.x = Math.min(ax, x);
        inProgress.y = Math.min(ay, y);
        inProgress.w = Math.abs(x - ax);
        inProgress.h = Math.abs(y - ay);
      }
      redraw();
    };

    const finishStroke = (commit: boolean) => {
      if (!inProgress) return;
      if (commit) {
        let keep = true;
        if (inProgress.kind === 'rect' || inProgress.kind === 'highlight') {
          if (inProgress.w < 4 || inProgress.h < 4) keep = false;
        } else if (inProgress.kind === 'arrow') {
          const dx = inProgress.to[0] - inProgress.from[0];
          const dy = inProgress.to[1] - inProgress.from[1];
          if (Math.hypot(dx, dy) < 6) keep = false;
        }
        if (keep) {
          annotations.push(inProgress);
          fireChange();
        }
      }
      inProgress = null;
      rectAnchor = null;
      activePointerId = null;
      redraw();
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return;
      e.stopPropagation();
      finishStroke(true);
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return;
      finishStroke(false);
    };

    const onClick = (e: MouseEvent) => {
      if (tool !== 'none') e.stopPropagation();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerCancel);
    canvas.addEventListener('click', onClick, true);

    const setTool = (t: Tool) => {
      tool = t;
      canvas.style.pointerEvents = t === 'none' ? 'none' : 'auto';
      canvas.style.cursor = t === 'none' ? '' : 'crosshair';
    };

    const setColor = (c: string) => { color = c; };
    const cycleColor = (): string => {
      const i = COLORS.indexOf(color);
      color = COLORS[(i + 1) % COLORS.length]!;
      return color;
    };

    const undo = (): boolean => {
      if (annotations.length === 0) return false;
      annotations.pop();
      redraw();
      fireChange();
      return true;
    };

    const destroy = () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerCancel);
      canvas.removeEventListener('click', onClick, true);
      canvas.remove();
      callbacks.clear();
      annotations.length = 0;
      inProgress = null;
    };

    const onChange = (cb: () => void): (() => void) => {
      callbacks.add(cb);
      return () => callbacks.delete(cb);
    };

    return {
      canvas,
      setTool,
      getTool: () => tool,
      setColor,
      getColor: () => color,
      cycleColor,
      undo,
      hasItems: () => annotations.length > 0,
      getAnnotations: () => annotations.slice(),
      destroy,
      onChange,
    };
  };

  const api: AnnotationsAPI = { mount, render, COLORS };
  (window as unknown as { __dsdAnnotations?: AnnotationsAPI }).__dsdAnnotations = api;
})();
