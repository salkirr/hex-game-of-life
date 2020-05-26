import { Hex } from "./hex.js";

/* -------------------------------------------------------------------------- */
/* -------------------------- GLOBAL VARIABLES ------------------------------ */
/* -------------------------------------------------------------------------- */

// Canvas element
export let canvas = document.getElementById("game");

// Variables for canvas dimensions
export const canvasWidth = innerWidth;
export const canvasHeight = innerHeight - 100;

// Change size of the canvas
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Style constants
const lineColor = "#cccbca";
const lineWidth = 3;
const colorAlive = "white";
const colorDead = "black";

/* -------------------------------------------------------------------------- */
/* ------------------------------- FUNCTIONS -------------------------------- */
/* -------------------------------------------------------------------------- */

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

export function shapeRectangle(gridWidth, gridHeight) {
  /*   We store hex objects in two dimensional dict.
  I wanted to use two dimensional array but
  our coordinates can be negative and indexes can't.
  Also indexes aren't in the same order as the coordinates.
  (q, r) -> coordinates; [r][q] -> indexes
  Blame the algorithm that generates Hex's for this. */
  let hexes = {};

  // Get min and max q coordinates
  let qMin = -Math.floor(gridWidth / 2);
  let qMax = qMin + gridWidth;

  // Get min and max r coordinates
  let rMin = -Math.floor(gridHeight / 2);
  let rMax = rMin + gridHeight;

  // Create hexes
  for (let r = rMin; r < rMax; r++) {
    let innerDict = {};
    let rOffset = -Math.floor(r / 2);

    for (let q = qMin + rOffset; q < qMax + rOffset; q++) {
      let isAlive = Boolean(Math.round(Math.random()));

      innerDict[q] = constructorQRS(q, r, -q - r, isAlive);
    }

    hexes[r] = innerDict;
  }

  return hexes;
}

export function drawGrid(layout, backgroundColor, hexes) {
  // Exit if no canvas element
  if (!canvas) {
    console.error("Couldn't find canvas element!");
    return;
  }

  let ctx = canvas.getContext("2d");

  // Reset previous translation to the center
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Apply background color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Move the origin of the canvas to the center
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // Draw all hexes
  for (const r of Object.keys(hexes)) {
    for (const q of Object.keys(hexes[r])) {
      drawHex(ctx, layout, hexes[r][q]);
      // drawHexLabel(ctx, layout, hexes[r][q]);
    }
  }
}
