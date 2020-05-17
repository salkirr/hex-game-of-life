import { shapeRectangle, drawGrid } from "./canvas.js";
import { Layout, Point, Hex } from "./hex.js";

// State of the game
let isActive = false;

// Create array of hexes that form a grid
let hexes = shapeRectangle(40, 20);

// Create the instance of the Layout
const layout = new Layout(Layout.pointy, new Point(20, 20), new Point(0, 0));

// Draw the grid
drawGrid("game", "black", layout, hexes);

// Start/Stop button
const playButton = document.querySelector("#play-button");

// Start or stop the game when the button is clicked
playButton.addEventListener("click", () => {
  isActive = isActive ? false : true;
  main();
});

async function main() {
  while (isActive) {
    // Create next generation of hexagons
    hexes = createNewGeneration(hexes);

    // Draw the grid
    drawGrid("game", "black", layout, hexes);

    // Sleep for 0.5 sec
    await new Promise((r) => setTimeout(r, 500));
  }
}

function createNewGeneration(hexes) {
  // Create new array for hexes
  let newHexes = [];

  // Change the state of hexes and add them to newHexes array
  for (let i = 0; i < hexes.length; i++) {
    let currentHex = hexes[i];

    let newHex = cloneHex(currentHex);

    // Create array of all neighbours
    let neighbours = [];
    for (let i = 0; i < 6; i++) {
      // Creates new instance of hex with coordinates of neighbour and pushes to an array
      neighbours.push(currentHex.getNeighbour(i));
    }

    /* Because neighbour variable doesn't contain correct
      isAlive value, we need to search for the hex with same
      coordinates in hexes array. */
    let neighboursAlive = 0;
    for (let k = 0; k < neighbours.length; k++) {
      for (let i = 0; i < hexes.length; i++) {
        if (
          hexes[i].isAlive &&
          hexes[i].q === neighbours[k].q &&
          hexes[i].r === neighbours[k].r &&
          hexes[i].s === neighbours[k].s
        ) {
          neighboursAlive++;

          break;
        }
      }

      if (neighboursAlive === neighbours.length) {
        break;
      }
    }

    // Change the state of the hex
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

    newHexes.push(newHex);
  }

  return newHexes;
}

function cloneHex(hex) {
  return new Hex(hex.q, hex.r, hex.s, hex.isAlive);
}
