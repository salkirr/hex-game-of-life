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

// Track generation number
let generation = 1;

// Track ongoing touches on the screen
let ongoingTouches = [];

// Block that contains generation number
const generationText = document.querySelector("#generation-text");

// Watch if user is drawing
let isInteractingWithCanvas = false;
let isCreating = false;

// Watch on what cell were cursor when mouse was clicked
let previousCell;
let currentCell;

// Get game speed input element
const speedElem = document.querySelector("#game-speed input");
speedElem.min = 0;
speedElem.max = 1000;
speedElem.value = 500;
speedElem.step = 50;

// Delay between generations (ms)
let delay = 1000 - speedElem.value;

// Get the input element that changes size of the cells
const cellSizeElem = document.querySelector("#hexagons-size input");
cellSizeElem.min = 5;
cellSizeElem.max = 40;
cellSizeElem.value = 15;

// Get Change Rules button
const changeRulesButton = document.querySelector("#change-rules");

// Get container for rules settings
const rulesContainer = document.querySelector(".rules-container");

// Get close button for rules settings
const closeButton = document.querySelector("#close-button");

// Get elements with min and max value of neighbours for staying alive
// And set their initial values
const minAliveElem = document.querySelector("#min-alive");
const maxAliveElem = document.querySelector("#max-alive");
minAliveElem.value = 2;
maxAliveElem.value = 3;

minAliveElem.min = 0;
minAliveElem.max = maxAliveElem.value;

maxAliveElem.min = minAliveElem.value;
maxAliveElem.max = 6;

// Get elements with min and max value of neighbours to be born
// And set their initial values
const minBirthElem = document.querySelector("#min-birth");
const maxBirthElem = document.querySelector("#max-birth");
minBirthElem.value = 3;
maxBirthElem.value = 3;

minBirthElem.min = 0;
minBirthElem.max = maxBirthElem.value;

maxBirthElem.min = minBirthElem.value;
maxBirthElem.max = 6;

// Get start/stop button
const playButton = document.querySelector("#play-button");

// Get random-button
const randomButton = document.querySelector("#random-button");

// Get Clear button
const clearButton = document.querySelector("#clear-button");

// Coordinates of the center of the rectangle
let centerPoint = new Point(0, 0);

const layout = new Layout(Layout.pointy, cellSizeElem.value, centerPoint);
const canvas = new Canvas("game");
const grid = new Grid(
  minAliveElem.value,
  maxAliveElem.value,
  minBirthElem.value,
  maxBirthElem.value
);

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
  canvas.drawGrid(layout, grid.currentConfiguration);
});

// Draw new empty grid when Clear button is clicked
clearButton.addEventListener("click", () => {
  generation = 1;
  generationText.innerHTML = `Generation: ${generation}`;

  grid.createEmptyGrid(layout, canvas);
  canvas.drawGrid(layout, grid.currentConfiguration);
});

// Change cell size and redraw grid when element value had changed
cellSizeElem.addEventListener("input", () => {
  layout.size = cellSizeElem.value;

  if (layout.size <= 8) {
    canvas.lineWidth = 1;
  } else if (layout.size < 20) {
    canvas.lineWidth = 2;
  } else if (layout.size < 30) {
    canvas.lineWidth = 3;
  } else {
    canvas.lineWidth = 4;
  }

  let currentCells = grid.currentConfiguration;

  grid.createEmptyGrid(layout, canvas);
  let newCells = grid.currentConfiguration;

  canvas.redrawCurrentGrid(layout, currentCells, newCells);
});

// Change game speed when element value had changed
speedElem.addEventListener("input", () => {
  delay = 1000 - speedElem.value;

  if (isActive) {
    clearInterval(gameLoop);
    gameLoop = setInterval(game, delay);
  }
});

// Open "Rules" menu
changeRulesButton.addEventListener("click", () => {
  rulesContainer.style.visibility = "visible";
});

// Close "Rules" menu
closeButton.addEventListener("click", () => {
  rulesContainer.style.visibility = "hidden";

  // To eliminate empty or incorrent value from the field
  minAliveElem.value = grid.minAlive;
  maxAliveElem.value = grid.maxAlive;
  minBirthElem.value = grid.minBirth;
  maxBirthElem.value = grid.maxBirth;
});

minAliveElem.addEventListener("input", () => {
  if (!minAliveElem.value) {
    return;
  }

  if (Number(minAliveElem.value) < Number(minAliveElem.min)) {
    minAliveElem.value = minAliveElem.min;
  } else if (Number(minAliveElem.value) > Number(minAliveElem.max)) {
    minAliveElem.value = minAliveElem.max;
  }

  grid.minAlive = minAliveElem.value;

  maxAliveElem.min = minAliveElem.value;
});

maxAliveElem.addEventListener("input", () => {
  if (!maxAliveElem.value) {
    return;
  }

  if (Number(maxAliveElem.value) < Number(maxAliveElem.min)) {
    maxAliveElem.value = maxAliveElem.min;
  } else if (Number(maxAliveElem.value) > Number(maxAliveElem.max)) {
    maxAliveElem.value = maxAliveElem.max;
  }

  grid.maxAlive = maxAliveElem.value;
  minAliveElem.max = maxAliveElem.value;
});

minBirthElem.addEventListener("input", () => {
  if (!minBirthElem.value) {
    return;
  }

  if (Number(minBirthElem.value) < Number(minBirthElem.min)) {
    minBirthElem.value = minBirthElem.min;
  } else if (Number(minBirthElem.value) > Number(minBirthElem.max)) {
    minBirthElem.value = minBirthElem.max;
  }

  grid.minBirth = minBirthElem.value;

  maxBirthElem.min = minBirthElem.value;
});

maxBirthElem.addEventListener("input", () => {
  if (!maxBirthElem.value) {
    return;
  }

  if (Number(maxBirthElem.value) < Number(maxBirthElem.min)) {
    maxBirthElem.value = maxBirthElem.min;
  } else if (Number(maxBirthElem.value) > Number(maxBirthElem.max)) {
    maxBirthElem.value = maxBirthElem.max;
  }

  grid.maxBirth = maxBirthElem.value;
  minBirthElem.max = maxBirthElem.value;
});
/* -------------------------------------------------------------------------- */
/* --------------------------------- MAIN ----------------------------------- */
/* -------------------------------------------------------------------------- */

// Draw the grid for the first time
grid.createEmptyGrid(layout, canvas);
canvas.drawGrid(layout, grid.currentConfiguration);

function game() {
  // Create next generation of hexagons
  grid.createNextGeneration();

  if (!grid.isChanged()) {
    alert("Nothing has changed since last generation. The game is stopped.");

    isActive = false;
    randomButton.disabled = false;
    clearButton.disabled = false;

    clearInterval(gameLoop);

    return;
  }

  generation++;
  generationText.innerHTML = `Generation: ${generation}`;

  // Draw the grid
  canvas.drawGrid(layout, grid.currentConfiguration);
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

  canvas.drawGrid(layout, grid.currentConfiguration);

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
  isInteractingWithCanvas = true;

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
  if (isInteractingWithCanvas) {
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
  if (isInteractingWithCanvas) {
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

    isInteractingWithCanvas = false;
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
