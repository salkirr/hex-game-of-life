import { Hex } from "./hex.js";

// Style constants
const lineColor = "#cccbca";
const lineWidth = 3;
const colorAlive = "white";
const colorDead = "black";

// Constructors for different map orientations
const constructorQRS = (q, r, s, isAlive) => {
  return new Hex(q, r, s, isAlive);
};

const constructorSRQ = (s, r, q, isAlive) => {
  return new Hex(q, r, s, isAlive);
};

const constructorSQR = (s, q, r, isAlive) => {
  return new Hex(q, r, s, isAlive);
};

const constructorRQS = (r, q, s, isAlive) => {
  return new Hex(q, r, s, isAlive);
};

const constructorRSQ = (r, s, q, isAlive) => {
  return new Hex(q, r, s, isAlive);
};

const constructorQSR = (q, s, r, isAlive) => {
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

export function shapeRectangle(map_width, map_height) {
  /*   We store hex objects in two dimensional dict.
  I wanted to use two dimensional array but
  our coordinates can be negative and indexes can't.
  Also indexes aren't in the same order as the coordinates.
  (q, r) -> coordinates; [r][q] -> indexes
  Blame the algorithm that generates Hex's for this. */
  let hexes = {};

  // Get min and max q coordinates
  let q_min = -Math.floor(map_width / 2);
  let q_max = q_min + map_width;

  // Get min and max r coordinates
  let r_min = -Math.floor(map_height / 2);
  let r_max = r_min + map_height;

  // Create hexes
  for (let r = r_min; r < r_max; r++) {
    let innerDict = {};
    let rOffset = -Math.floor(r / 2);

    for (let q = q_min + rOffset; q < q_max + rOffset; q++) {
      let isAlive = Boolean(Math.round(Math.random()));

      innerDict[q] = constructorQRS(q, r, -q - r, isAlive);
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

  // Move the origin of the canvas to the center
  ctx.translate(width / 2, height / 2);

  // Draw all hexes
  for (const r of Object.keys(hexes)) {
    for (const q of Object.keys(hexes[r])) {
      drawHex(ctx, layout, hexes[r][q]);
      // drawHexLabel(ctx, layout, hexes[r][q]);
    }
  }
}
