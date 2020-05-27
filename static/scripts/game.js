import { Canvas } from "../classes/canvas.js";
import { Point } from "../classes/point.js";
import { Layout } from "../classes/layout.js";
import { Grid } from "../classes/grid.js";

/* -------------------------------------------------------------------------- */
/* -------------------------- GLOBAL VARIABLES ------------------------------ */
/* -------------------------------------------------------------------------- */

// Declare variable for setInterval function
let gameLoop;

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

/* -------------------------------------------------------------------------- */
/* ----------------------------- BUTTON EVENTS ------------------------------ */
/* -------------------------------------------------------------------------- */

// Start or stop the game when the button is clicked
playButton.addEventListener("click", () => {
  isActive = isActive ? false : true;

  if (isActive) {
    randomButton.disabled = true;
    gameLoop = setInterval(game, delay);
  } else {
    randomButton.disabled = false;
    clearInterval(gameLoop);
  }
});

// Generate new random grid when randomButton is clicked
randomButton.addEventListener("click", () => {
  grid.createRandomGrid(layout, canvas);
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
