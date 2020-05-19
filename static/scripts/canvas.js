import { Hex } from "./hex.js";

// Style constants
const lineColor = "#cccbca";
const lineWidth = 3;
const colorAlive = "white";
const colorDead = "black";

const constructor = (q, r, s, isAlive) => {
  return new Hex(q, r, s, isAlive);
};

function drawHex(ctx, layout, hex) {
  // Get coordinates of all corners
  let corners = layout.getPolygonCorners(hex);

  // Draw the hexagon
  let hexagon = new Path2D();

  hexagon.moveTo(corners[5].x, corners[5].y);
  for (let i = 0; i < 6; i++) {
    hexagon.lineTo(corners[i].x, corners[i].y);
  }

  hexagon.closePath();

  // Apply styles to the lines
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.stroke(hexagon);

  // Fill the hexagon with color
  ctx.fillStyle = hex.isAlive ? colorAlive : colorDead;
  ctx.fill(hexagon);
}

// Writes hex coordinates on the hexagons themeselves
// Useful for debugging
function drawHexLabel(ctx, layout, hex) {
  const pointSize = Math.round(
    0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y))
  );

  let center = layout.convertHexToPixel(hex);

  // Draw text
  ctx.fillStyle = "blue";
  ctx.font = `${pointSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(
    hex.length === 0 ? "q,r,s" : hex.q + "," + hex.r + "," + hex.s,
    center.x,
    center.y
  );
}

export function shapeRectangle(width, height) {
  /*   We store hex objects in two dimensional dict.
  I wanted to use two dimensional array but
  our coordinates can be negative and indexes can't.
  Also indexes aren't in the same order as the coordinates.
  (q, r) -> coordinates; [r][q] -> indexes
  Blame the algorithm that generates Hex's for this. */
  let hexes = {};

  let q1 = -Math.floor(width / 2);
  let q2 = q1 + width;

  let r1 = -Math.floor(height / 2);
  let r2 = r1 + height;

  for (let r = r1; r < r2; r++) {
    let innerDict = {};
    let qOffset = -Math.floor(r / 2);

    for (let q = q1 + qOffset; q < q2 + qOffset; q++) {
      let isAlive = Boolean(Math.round(Math.random()));

      innerDict[q] = constructor(q, r, -q - r, isAlive);
    }

    hexes[r] = innerDict;
  }

  return hexes;
}

export function drawGrid(
  id,
  backgroundColor,
  layout,
  hexes = shapeRectangle(50, 20)
) {
  // Find the canvas element on the page
  let canvas = document.getElementById(id);
  if (!canvas) {
    return;
  }

  // Get 2d context object
  let ctx = canvas.getContext("2d");

  canvas.width = innerWidth;
  canvas.height = innerHeight - 200;

  let width = canvas.width;
  let height = canvas.height;

  // ??? (I don't know what it does)
  /*   if (window.devicePixelRatio && window.devicePixelRatio != 1) {
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  } */

  // Apply background color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Move the origin of the canvas
  ctx.translate(width / 2, height / 2);

  // Draw all hexes
  for (const r of Object.keys(hexes)) {
    for (const q of Object.keys(hexes[r])) {
      drawHex(ctx, layout, hexes[r][q]);
    }
  }
}
