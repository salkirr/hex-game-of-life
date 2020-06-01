import { Canvas } from "../classes/canvas.js";
import { Point } from "../classes/point.js";
import { Layout } from "../classes/layout.js";
import { Grid } from "../classes/grid.js";

/* -------------------------------------------------------------------------- */
/* -------------------------- GLOBAL VARIABLES ------------------------------ */
/* -------------------------------------------------------------------------- */

// Declare variable for setInterval function
let gameLoop;

// Track generation number
let generation = 1;

// Track ongoing touches on the screen
let ongoingTouches = [];

// Block that contains generation number
const generationText = document.querySelector("#generation-text");

// Watch if user is drawing
let isInteracting = false;
let isCreating = false;

// Watch on what cell were cursor when mouse was clicked
let previousCell;
let currentCell;

// State of the game
let isActive = false;

// Delay between generations (ms)
const delay = 10;

// Cell size input element
const cellSizeElem = document.querySelector("#hexagons-size input");
cellSizeElem.value = 15;

// Coordinates of the center of the rectangle
let centerPoint = new Point(0, 0);

const layout = new Layout(Layout.pointy, cellSizeElem.value, centerPoint);

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

// For mouse
canvas.canvasElem.addEventListener("mousedown", handleStart);
canvas.canvasElem.addEventListener("mousemove", handleMove);
canvas.canvasElem.addEventListener("mouseup", handleEnd);

// For touchscreen
canvas.canvasElem.addEventListener("touchstart", handleStart);
canvas.canvasElem.addEventListener("touchmove", handleMove);
canvas.canvasElem.addEventListener("touchend", handleEnd);
canvas.canvasElem.addEventListener("touchcancel", handleCancel);

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
  generation = 1;
  generationText.innerHTML = `Generation: ${generation}`;

  grid.createRandomGrid(layout, canvas);
  canvas.drawGrid(layout, grid.cells);
});

// Draw new empty grid when Clear button is clicked
clearButton.addEventListener("click", () => {
  generation = 1;
  generationText.innerHTML = `Generation: ${generation}`;

  grid.createEmptyGrid(layout, canvas);
  canvas.drawGrid(layout, grid.cells);
});

// Change cell size and redraw grid when element value had changed
cellSizeElem.addEventListener("pointerup", () => {
  layout.size = cellSizeElem.value;

  let currentCells = grid.cells;

  grid.createEmptyGrid(layout, canvas);
  let newCells = grid.cells;

  canvas.redrawCurrentGrid(layout, currentCells, newCells);
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

  generation++;
  generationText.innerHTML = `Generation: ${generation}`;
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

function copyTouch(touch) {
  return {
    clientX: touch.clientX,
    clientY: touch.clientY,
    identifier: touch.identifier,
  };
}

function ongoingIndexById(idToFind) {
  for (let i = 0; i < ongoingTouches.length; i++) {
    let id = ongoingTouches[i].identifier;

    if (id == idToFind) {
      return id;
    }
  }

  // Not found
  return -1;
}

function handleStart(event) {
  event.preventDefault();
  isInteracting = true;

  // Different actions for mouse and touchscreen
  let point;
  let touches = event.changedTouches;
  if (touches) {
    point = new Point(touches[0].clientX, touches[0].clientY);

    for (let i = 0; i < touches.length; i++) {
      ongoingTouches.push(copyTouch(touches[i]));
    }
  } else {
    point = new Point(event.clientX, event.clientY);
  }

  // Find cell and change it
  let imaginaryCell = layout.convertScreenToHex(point, canvas.origin);

  currentCell = grid.getCell(imaginaryCell);
  if (currentCell) {
    isCreating = currentCell.isAlive;
    changeCurrentCell();
  }
}

function handleMove(event) {
  if (isInteracting) {
    event.preventDefault();

    // Different actions for mouse and touchscreen
    let points = [];
    let touches = event.changedTouches;
    if (touches) {
      touches = Array.from(touches);
      touches.forEach((touch) => {
        points.push(new Point(touch.clientX, touch.clientY));
      });
    } else {
      points.push(new Point(event.clientX, event.clientY));
    }

    // Change all cells
    points.forEach((point) => {
      let imaginaryCell = layout.convertScreenToHex(point, canvas.origin);

      currentCell = grid.getCell(imaginaryCell);

      if (currentCell) {
        changeCurrentCell();
      }
    });
  }
}

function handleEnd() {
  if (isInteracting) {
    event.preventDefault();

    // Different actions for mouse and touchscreen
    let points = [];
    let touches = event.changedTouches;
    if (touches) {
      touches = Array.from(touches);
      touches.forEach((touch) => {
        let idx = ongoingIndexById(touch.identifier);

        if (idx >= 0) {
          points.push(new Point(touch.clientX, touch.clientY));
          ongoingTouches.splice(idx, 1);
        } else {
          console.log("Couldn't figure out which touch to end!");
        }
      });
    } else {
      points.push(new Point(event.clientX, event.clientY));
    }

    points.forEach((point) => {
      let imaginaryCell = layout.convertScreenToHex(point, canvas.origin);

      currentCell = grid.getCell(imaginaryCell);

      if (currentCell) {
        changeCurrentCell();
      }
    });

    isInteracting = false;
    previousCell = undefined;
  }
}

function handleCancel(event) {
  event.preventDefault();

  let touches = Array.from(event.changedTouches);

  touches.forEach((touch) => {
    let idx = ongoingIndexById(touch.identifier);

    ongoingTouches.splice(idx, 1);
  });
}
