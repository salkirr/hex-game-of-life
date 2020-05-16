import {Hex, Layout, Point} from "./hex.js";

const constructor = (q, r, s) => {
  return new Hex(q, r, s);
};

function drawHex(ctx, layout, hex) {
  // Get coordinates of all corners
  let corners = layout.getPolygonCorners(hex);

  // Draw the hexagon
  ctx.beginPath();

  // Change style settings
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

  // Draw the actual lines
  ctx.moveTo(corners[5].x, corners[5].y);
  for (let i = 0; i < 6; i++) {
    ctx.lineTo(corners[i].x, corners[i].y);
  }

  // Apply styles to the lines
  ctx.stroke();
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

function drawGrid(id, backgroundColor, layout, hexes = shapeRectangle(15, 15)) {
  // Find the canvas element on the page
  let canvas = document.getElementById(id);
  if (!canvas) {
    return;
  }

  // Get 2d context object
  let ctx = canvas.getContext("2d");

  let width = canvas.width;
  let height = canvas.height;
  // ???
  if (window.devicePixelRatio && window.devicePixelRatio != 1) {
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

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
  "white",
  new Layout(Layout.pointy, new Point(25, 25), new Point(0, 0))
);
