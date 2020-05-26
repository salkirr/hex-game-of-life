import { shapeRectangle, drawGrid, canvas, canvasWidth, canvasHeight } from "./canvas.js";
import { Layout, Point, Hex } from "./hex.js";

/* -------------------------------------------------------------------------- */
/* -------------------------- GLOBAL VARIABLES ------------------------------ */
/* -------------------------------------------------------------------------- */

// Declare variable for setInterval
let gameLoop;

// State of the game
let isActive = false;

// Delay between generations (ms)
const delay = 500;

// Canvas background color
const backgroundColor = "black";

// Width and height of hexes
let hexWidth = 10;
let hexHeight = 10;

// Create the instance of the Layout
const layout = new Layout(
  Layout.pointy,
  new Point(hexWidth, hexHeight),
  new Point(0, 0)
);

// Set the size of the grid
let gridWidth = layout.getGridWidth(canvas.width);
let gridHeight = layout.getGridHeight(canvas.height);

// Create array of hexes that form a grid
let hexes = shapeRectangle(gridWidth, gridHeight);

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
  // Set new canvas size
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Set new grid size
  gridWidth = layout.getGridWidth(canvas.width);
  gridHeight = layout.getGridHeight(canvas.height);

  // Create new hexes
  hexes = shapeRectangle(gridWidth, gridHeight);

  drawGrid(layout, backgroundColor, hexes);
});

/* -------------------------------------------------------------------------- */
/* ------------------------------- FUNCTIONS -------------------------------- */
/* -------------------------------------------------------------------------- */

// Draw the grid for the first time
drawGrid(layout, backgroundColor, hexes);

function game() {
  // Create next generation of hexagons
  hexes = createNewGeneration(hexes);

  // Draw the grid
  drawGrid(layout, backgroundColor, hexes);
}

function createNewGeneration(hexes) {
  // Create new outer dict for hexes
  let newHexes = {};

  // Iterate through all hexes and calculate their next state
  for (const r of Object.keys(hexes)) {
    // Create inner dict for hexes
    let innerDict = {};

    for (const q of Object.keys(hexes[r])) {
      let newHex = cloneHex(hexes[r][q]);

      // Get number of alive neighbours
      let neighboursAlive = 0;
      for (let i = 0; i < 6; i++) {
        // Calculate neighbour hex
        let imaginaryNeighbour = newHex.getNeighbour(i);

        // Continue to the next iteration if neighbour doesn't exist
        // It is possible for hexes in the corners
        if (!(imaginaryNeighbour.r in hexes)) {
          continue;
        }

        // Get the state of the neighbour
        // And increment neighboursAlive if neighbour is alive
        let realNeighbour = hexes[imaginaryNeighbour.r][imaginaryNeighbour.q];
        if (realNeighbour && realNeighbour.isAlive) {
          neighboursAlive++;
        }
      }

      // Change the state of the hex using rules
      if (newHex.isAlive && (neighboursAlive == 2 || neighboursAlive == 3)) {
        newHex.isAlive = true;
      }
      // We shouldn't check if hex is dead because all alive hexes
      // with 3 alive neighbours passed the first condition
      else if (neighboursAlive == 3) {
        newHex.isAlive = true;
      } else {
        newHex.isAlive = false;
      }

      // Append hex to the inner dictionary
      innerDict[q] = newHex;
    }

    // Append inner dictionary to the outer dictionary
    newHexes[r] = innerDict;
  }

  return newHexes;
}

function cloneHex(hex) {
  return new Hex(hex.q, hex.r, hex.s, hex.isAlive);
}
