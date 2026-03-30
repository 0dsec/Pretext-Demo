import { prepareWithSegments, layoutNextLine } from '@chenglou/pretext';

document.getElementById('loading').remove();

const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');

const FONT_SIZE = 13;
const LINE_H    = 19;
const PAD       = 44;
const RADIUS    = 100;
const MIN_W     = 10;
const FONT      = `${FONT_SIZE}px "Courier New", Courier, monospace`;
const COLOR     = 'rgb(255, 166, 0)';

let W, H, dpr;
let mx = -500, my = 300;
let prepared = null;

const REPEATINGTEXT =
  `Damn Chengdu the goat fr  `;

const FULL_TEXT = REPEATINGTEXT.repeat(850);

function resize() {
  dpr = window.devicePixelRatio || 1;
  W = innerWidth;
  H = innerHeight;
  canvas.width  = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  prepared = prepareWithSegments(FULL_TEXT, FONT);
}

function draw() {
  requestAnimationFrame(draw);
  if (!prepared) return;

  ctx.clearRect(0, 0, W, H);
  ctx.font      = FONT;
  ctx.fillStyle = COLOR;

  const colStart = PAD;
  const colEnd   = W - PAD;
  const colW     = colEnd - colStart;

  let cursor = { segmentIndex: 0, graphemeIndex: 0 };

  for (let y = 0; y < H + LINE_H; y += LINE_H) {
    const midY = y + LINE_H * 0.45;
    const dy   = midY - my;
    const textY = y + FONT_SIZE + 2;

    if (Math.abs(dy) < RADIUS) {
      const chord      = Math.sqrt(RADIUS * RADIUS - dy * dy);
      const leftW      = Math.max(0, (mx - chord) - colStart);
      const rightStart = Math.min(colEnd, mx + chord);
      const rightW     = Math.max(0, colEnd - rightStart);

      // left segment — right-aligned so it butts flush against the circle
      if (leftW >= MIN_W) {
        const line = layoutNextLine(prepared, cursor, leftW);
        if (!line) break;
        ctx.textAlign = 'right';
        ctx.fillText(line.text, colStart + leftW, textY);
        ctx.textAlign = 'left';
        cursor = line.end;
      }

      // right segment — left-aligned, anchored at circle edge
      if (rightW >= MIN_W) {
        const line = layoutNextLine(prepared, cursor, rightW);
        if (!line) break;
        ctx.fillText(line.text, rightStart, textY);
        cursor = line.end;
      }

      // circle neeeds to swallow the full line — advance cursor so text doesn't stall
      if (leftW < MIN_W && rightW < MIN_W) {
        const line = layoutNextLine(prepared, cursor, colW);
        if (!line) break;
        cursor = line.end;
      }

    } else {
      const line = layoutNextLine(prepared, cursor, colW);
      if (!line) break;
      ctx.fillText(line.text, colStart, textY);
      cursor = line.end;
    }
  }
}

addEventListener('resize', resize);
addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

resize();
draw();
