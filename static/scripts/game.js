import { shapeRectangle, drawGrid } from "./canvas.js";
import { Layout, Point, Hex } from "./hex.js";

// State of the game
let isActive = false;

// Set the size of the grid
let gridWidth = 90;
let gridHeight = 40;

// Create the instance of the Layout
const layout = new Layout(Layout.pointy, new Point(10, 10), new Point(0, 0));

// Create array of hexes that form a grid
let hexes = shapeRectangle(gridWidth, gridHeight);

// Draw the grid
drawGrid("game", "black", layout, hexes);

// Get start/stop button
const playButton = document.querySelector("#play-button");

// Get reset button
const resetButton = document.querySelector("#reset-button");

// Start or stop the game when the button is clicked
playButton.addEventListener("click", () => {
  isActive = isActive ? false : true;

  // Run the game if it is active
  if (isActive) {
    main();
  }
});

// Generate new random grid when reset button is clicked
resetButton.addEventListener("click", () => {
  hexes = shapeRectangle(gridWidth, gridHeight);

  drawGrid("game", "black", layout, hexes);
});

async function main() {
  while (isActive) {
    // Create next generation of hexagons
    hexes = createNewGeneration(hexes);

    // Draw the grid
    drawGrid("game", "black", layout, hexes);

    // Sleep for 0.5 sec
    await new Promise((r) => setTimeout(r, 50));
  }
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

        // Get the state of the neighbour and increment neighboursAlive if he is alive
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
