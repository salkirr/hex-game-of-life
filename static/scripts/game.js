import { Canvas } from "../classes/canvas.js";
import { Point } from "../classes/point.js";
import { Layout } from "../classes/layout.js";
import { Grid } from "../classes/grid.js";

/* -------------------------------------------------------------------------- */
/* -------------------------- GLOBAL VARIABLES ------------------------------ */
/* -------------------------------------------------------------------------- */

// Declare variable for setInterval function
let gameLoop;

// Watch if user is drawing
let isInteracting = false;
let isCreating = false;

// Watch on what cell were cursor when mouse was clicked
let previousCell;
let currentCell;

// State of the game
let isActive = false;

// Delay between generations (ms)
const delay = 500;

// Dimensions of hexes
let cellSize = 10;

// Coordinates of the center of the rectangle
let centerPoint = new Point(0, 0);

const layout = new Layout(Layout.pointy, cellSize, centerPoint);

const canvas = new Canvas("game");

const grid = new Grid();

// Get start/stop button
const playButton = document.querySelector("#play-button");

// Get random-button
const randomButton = document.querySelector("#random-button");

// Get Clear button
const clearButton = document.querySelector("#clear-button");

/* -------------------------------------------------------------------------- */
/* -------------------------------- EVENTS ---------------------------------- */
/* -------------------------------------------------------------------------- */

/* 
  Drawing works this way:
  - If you clicked on an empty cell then you will only
  create cells until mouse button is unclicked.

  - If you clicked on an alive cell you will only kill cells
  until mouse button is unclicked.
*/
canvas.canvasElem.addEventListener("mousedown", (event) => {
  isInteracting = true;

  let imaginaryCell = layout.convertScreenToHex(
    new Point(event.x, event.y),
    canvas.origin
  );

  currentCell = grid.getCell(imaginaryCell);

  isCreating = currentCell.isAlive;

  changeCurrentCell();
});

canvas.canvasElem.addEventListener("mousemove", (event) => {
  if (isInteracting) {
    let imaginaryCell = layout.convertScreenToHex(
      new Point(event.x, event.y),
      canvas.origin
    );

    currentCell = grid.getCell(imaginaryCell);
    changeCurrentCell();
  }
});

canvas.canvasElem.addEventListener("mouseup", (event) => {
  if (isInteracting) {
    let imaginaryCell = layout.convertScreenToHex(
      new Point(event.x, event.y),
      canvas.origin
    );

    currentCell = grid.getCell(imaginaryCell);

    changeCurrentCell();

    isInteracting = false;
    previousCell = undefined;
  }
});

// Start or stop the game when the button is clicked
playButton.addEventListener("click", () => {
  isActive = isActive ? false : true;

  if (isActive) {
    // Disable buttons
    randomButton.disabled = true;
    clearButton.disabled = true;

    gameLoop = setInterval(game, delay);
  } else {
    // Enable buttons
    randomButton.disabled = false;
    clearButton.disabled = false;

    clearInterval(gameLoop);
  }
});

// Draw new random grid when randomButton is clicked
randomButton.addEventListener("click", () => {
  grid.createRandomGrid(layout, canvas);
  canvas.drawGrid(layout, grid.cells);
});

// Draw new empty grid when Clear button is clicked
clearButton.addEventListener("click", () => {
  grid.createEmptyGrid(layout, canvas);
  canvas.drawGrid(layout, grid.cells);
});

/* -------------------------------------------------------------------------- */
/* --------------------------------- MAIN ----------------------------------- */
/* -------------------------------------------------------------------------- */

// Draw the grid for the first time
grid.createEmptyGrid(layout, canvas);
canvas.drawGrid(layout, grid.cells);

function game() {
  // Create next generation of hexagons
  grid.createNextGeneration();

  // Draw the grid
  canvas.drawGrid(layout, grid.cells);
}

function changeCurrentCell() {
  if (currentCell.isAlive === !isCreating) {
    return;
  }

  if (
    previousCell !== undefined &&
    currentCell.q === previousCell.q &&
    currentCell.r === previousCell.r
  ) {
    return;
  }

  grid.setCellState(currentCell, !isCreating);

  canvas.drawGrid(layout, grid.cells);

  previousCell = currentCell;
}
