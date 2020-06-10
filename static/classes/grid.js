import { Permutation } from "./permutation.js";

export class Grid {
  constructor(minAlive, maxAlive, minBirth, maxBirth) {
    // Variable for all current cells in the grid
    this.currentConfiguration;

    // Variable for all cells from the previous grid
    this.previousConfiguration;

    // Dimensions of the grid
    this.gridWidth;
    this.gridHeight;

    // Range of values for cell to stay alive
    this.minAlive = Number(minAlive);
    this.maxAlive = Number(maxAlive);

    // Range of values for cell to be born
    this.minBirth = Number(minBirth);
    this.maxBirth = Number(maxBirth);
  }

  // Get number of hexes in a row
  updateGridWidth(canvas, cellSize) {
    let rowWidth = canvas.canvasElem.width - canvas.padding.x;
    let hexWidth = Math.sqrt(3) * cellSize;

    this.gridWidth = Math.floor(rowWidth / hexWidth - 0.5);
  }

  // Get number of hexes in a column
  updateGridHeight(canvas, cellSize) {
    let colHeight = canvas.canvasElem.height - canvas.padding.y;
    let hexHeight = 2 * cellSize;

    this.gridHeight = Math.floor(((4 * colHeight) / hexHeight - 1) / 3);
  }

  /* Update grid dimensions if canvas changed it's dimensions */
  updateGridDimensions(layout, canvas) {
    canvas.updateCanvasDimensions();

    this.updateGridWidth(canvas, layout.size);
    this.updateGridHeight(canvas, layout.size);
  }

  // Get cell from current grid
  getCell(imaginaryCell) {
    if (
      !this.currentConfiguration[imaginaryCell.r] ||
      !this.currentConfiguration[imaginaryCell.r][imaginaryCell.q]
    ) {
      return;
    }

    return this.currentConfiguration[imaginaryCell.r][imaginaryCell.q];
  }

  setCellState(cell, isAlive) {
    this.currentConfiguration[cell.r][cell.q].isAlive = isAlive;
  }

  /* Create rectangular grid */
  shapeRectangle() {
    /*
      We store hex objects in two dimensional dict.
      I wanted to use two dimensional array but
      our coordinates can be negative and indexes can't.
      Also indexes aren't in the same order as the coordinates.
      (q, r) -> coordinates; [r][q] -> indexes
      Blame the algorithm that generates Hex's for this.
    */
    this.currentConfiguration = {};

    // Get min and max q coordinates
    let qMin = -Math.floor(this.gridWidth / 2);
    let qMax = qMin + this.gridWidth;

    // Get min and max r coordinates
    let rMin = -Math.floor(this.gridHeight / 2);
    let rMax = rMin + this.gridHeight;

    // Create cells
    for (let r = rMin; r < rMax; r++) {
      let innerDict = {};
      let rOffset = -Math.floor(r / 2);

      for (let q = qMin + rOffset; q < qMax + rOffset; q++) {
        innerDict[q] = Permutation.QRS(q, r, -q - r);
      }

      this.currentConfiguration[r] = innerDict;
    }
  }

  createEmptyGrid(layout, canvas) {
    this.updateGridDimensions(layout, canvas);

    // Create current cells
    this.shapeRectangle();
  }

  createRandomGrid(layout, canvas) {
    this.createEmptyGrid(layout, canvas);

    for (const r of Object.keys(this.currentConfiguration)) {
      for (const q of Object.keys(this.currentConfiguration[r])) {
        this.currentConfiguration[r][q].isAlive = Boolean(
          Math.round(Math.random())
        );
      }
    }
  }

  createNextGeneration() {
    // Create new outer dict for hexes
    let newCells = {};

    // Iterate through all hexes and calculate their next state
    for (const r of Object.keys(this.currentConfiguration)) {
      // Create inner dict for hexes
      let innerDict = {};

      for (const q of Object.keys(this.currentConfiguration[r])) {
        let newCell = this.currentConfiguration[r][q].clone();

        // Get number of alive neighbours
        let neighboursAlive = 0;
        for (let i = 0; i < 6; i++) {
          // Get neighbour hex
          let neighbour = this.getCell(newCell.getNeighbour(i));

          // Continue to the next iteration if neighbour doesn't exist
          // It is possible for hexes in the corners
          if (!neighbour) {
            continue;
          }

          // Increment neighboursAlive if neighbour is alive
          if (neighbour && neighbour.isAlive) {
            neighboursAlive++;
          }
        }

        // Change the state of the hex using rules
        if (
          newCell.isAlive &&
          neighboursAlive >= this.minAlive &&
          neighboursAlive <= this.maxAlive
        ) {
          newCell.isAlive = true;
        } else if (
          !newCell.isAlive &&
          neighboursAlive >= this.minBirth &&
          neighboursAlive <= this.maxBirth
        ) {
          newCell.isAlive = true;
        } else {
          newCell.isAlive = false;
        }

        // Append hex to the inner dictionary
        innerDict[q] = newCell;
      }

      // Append inner dictionary to the outer dictionary
      newCells[r] = innerDict;
    }

    this.previousConfiguration = this.currentConfiguration;
    this.currentConfiguration = newCells;
  }

  /* Check if configuration has changed or not. */
  isChanged() {
    for (const r of Object.keys(this.currentConfiguration)) {
      for (const q of Object.keys(this.currentConfiguration[r])) {
        if (
          this.currentConfiguration[r][q].isAlive !==
          this.previousConfiguration[r][q].isAlive
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
