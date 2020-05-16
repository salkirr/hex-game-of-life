import { Hex, Layout, Point } from "./hex.js";

// Style constants
const lineColor = "#cccbca";
const lineWidth = 3;
const colorAlive = "white";
const colorDead = "black";

const constructor = (q, r, s) => {
  return new Hex(q, r, s);
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

function shapeRectangle(width, height) {
  let hexes = [];

  let i1 = -Math.floor(width / 2);
  let i2 = i1 + width;

  let j1 = -Math.floor(height / 2);
  let j2 = j1 + height;

  for (let j = j1; j < j2; j++) {
    let jOffset = -Math.floor(j / 2);
    for (let i = i1 + jOffset; i < i2 + jOffset; i++) {
      hexes.push(constructor(i, j, -i - j));
    }
  }

  return hexes;
}

function drawGrid(id, backgroundColor, layout, hexes = shapeRectangle(50, 20)) {
  // Find the canvas element on the page
  let canvas = document.getElementById(id);
  if (!canvas) {
    return;
  }

  // Get 2d context object
  let ctx = canvas.getContext("2d");

  canvas.width = innerWidth;
  canvas.height = innerHeight;

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
  hexes.forEach((hex) => {
    drawHex(ctx, layout, hex);
  });
}

drawGrid(
  "game",
  "black",
  new Layout(Layout.pointy, new Point(15, 15), new Point(0, 0))
);
