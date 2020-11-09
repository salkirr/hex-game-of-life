/* -------------------------------------------------------------------------- */
/* -------------------------------- Classes --------------------------------- */
/* -------------------------------------------------------------------------- */

class Canvas {
  constructor(canvas_id) {
    this.canvasElem = document.getElementById(canvas_id);
    this.ctx = this.canvasElem.getContext("2d");

    // Padding on vertical and horizontal axis of canvas
    this.padding = new Point(50, 50);

    // Canvas origin coordinates in screen coordinate system
    this.origin;

    // Style properties
    this.lineColor = "#cccbca";
    this.lineWidth = 2;
    this.colorAlive = "white";
    this.colorEmpty = "black";
    this.backgroundColor = "black";
  }

  updateCanvasOrigin() {
    this.origin = new Point(
      this.canvasElem.width / 2,
      this.canvasElem.height / 2
    );
  }

  updateCanvasDimensions() {
    this.canvasElem.width = innerWidth;
    this.canvasElem.height = innerHeight - 175;
  }

  drawCell(layout, cell) {
    // Get coordinates of all corners
    let corners = layout.getPolygonCorners(cell);

    // Draw the hexagon
    let hexagon = new Path2D();

    hexagon.moveTo(corners[5].x, corners[5].y);
    for (let i = 0; i < 6; i++) {
      hexagon.lineTo(corners[i].x, corners[i].y);
    }

    hexagon.closePath();

    // Apply styles to the lines
    this.ctx.strokeStyle = this.lineColor;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.stroke(hexagon);

    // Fill the hexagon with color
    this.ctx.fillStyle = cell.isAlive ? this.colorAlive : this.colorEmpty;
    this.ctx.fill(hexagon);
  }

  /*
    Writes cube coordinates on cells.
    Useful for debugging.
  */
  drawCellLabel(layout, cell) {
    const pointSize = Math.round(
      0.5 * Math.min(Math.abs(layout.size.x), Math.abs(layout.size.y))
    );

    let center = layout.convertHexToCanvas(cell);

    // Draw text
    this.ctx.fillStyle = "blue";
    this.ctx.font = `${pointSize}px sans-serif`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      cell.length === 0 ? "q,r,s" : cell.q + "," + cell.r + "," + cell.s,
      center.x,
      center.y
    );
  }

  drawGrid(layout, cells) {
    // Reset previous translation to the center
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.updateCanvasOrigin();

    // Apply background color
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvasElem.width, this.canvasElem.height);

    // Move the origin of the canvas to the center
    this.ctx.translate(this.origin.x, this.origin.y);

    // Draw all hexes
    for (const r of Object.keys(cells)) {
      for (const q of Object.keys(cells[r])) {
        this.drawCell(layout, cells[r][q]);
        // this.drawCellLabel(layout, cells[r][q]);
      }
    }
  }

  /* Redraw grid saving all possible cells from the current one */
  redrawCurrentGrid(layout, currentCells, newCells) {
    // Carry all possible cells to the new grid
    for (const r of Object.keys(currentCells)) {
      for (const q of Object.keys(currentCells[r])) {
        if (newCells[r] && newCells[r][q]) {
          newCells[r][q] = currentCells[r][q];
        }
      }
    }

    this.drawGrid(layout, newCells);
  }
}

class Grid {
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

class Hex {
  // Static property for vectors of all posible directions
  static directions = [
    new Hex(1, 0, -1),
    new Hex(1, -1, 0),
    new Hex(0, -1, 1),
    new Hex(-1, 0, 1),
    new Hex(-1, 1, 0),
    new Hex(0, 1, -1),
  ];

  // Length of the this hexagon's vector
  get length() {
    return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
  }

  constructor(q, r, s, isAlive) {
    // We are using cube coordinate system
    // q -> x, r -> z, s -> y
    this.q = q;
    this.r = r;
    this.s = s;

    // Status of the hex (dead or alive)
    if (isAlive !== undefined) {
      this.isAlive = isAlive;
    } else {
      this.isAlive = false;
    }

    // Check coordinates for correctness
    if (Math.round(q + r + s) !== 0) {
      throw new Error(`q + r + s must be equal 0, was ${q + r + s}`);
    }
  }

  static getDirection(direction) {
    return Hex.directions[direction];
  }

  // Add two hexagons' vectors
  add(hex) {
    return new Hex(this.q + hex.q, this.r + hex.r, this.s + hex.s);
  }

  // Subtract two hexagons' vectors
  subtract(hex) {
    return new Hex(this.q - hex.q, this.r - hex.r, this.s - hex.s);
  }

  // Get length of the vector between two hexagons
  getDistance(hex) {
    return this.subtract(hex).length;
  }

  // Get this hexagon neighbour in the indicated direction
  getNeighbour(direction) {
    return this.add(Hex.getDirection(direction));
  }

  // Create clone of this hex
  clone() {
    return new Hex(this.q, this.r, this.s, this.isAlive);
  }
}

/*
  Contains forward and inverse matrices for conversions between
  hex coordinates and screen coordinates. Also contains start
  angle which are used to draw the corners.
*/
class Orientation {
  constructor(forward_matrix, inverse_matrix, start_angle) {
    this.forward_matrix = forward_matrix;
    this.inverse_matrix = inverse_matrix;
    this.start_angle = start_angle;
  }
}

/* Handles everything related to hex coordinates */
class Layout {
  // Static properties for different orientations of hexagons
  static pointy = new Orientation(
    [Math.sqrt(3.0), Math.sqrt(3.0) / 2.0, 0.0, 3.0 / 2.0],
    [Math.sqrt(3.0) / 3.0, -1.0 / 3.0, 0.0, 2.0 / 3.0],
    0.5
  );

  static flat = new Orientation(
    [3.0 / 2.0, 0.0, Math.sqrt(3.0) / 2.0, Math.sqrt(3.0)],
    [2.0 / 3.0, 0.0, -1.0 / 3.0, Math.sqrt(3.0) / 3.0],
    0.0
  );

  constructor(orientation, size, origin) {
    // Orientation of the hexagons (pointy or flat-top)
    this.orientation = orientation;

    // Size of side of the hexagon
    this.size = size;

    // Canvas coordinates of the origin point for the layout
    this.origin = origin;
  }

  roundHexCoordinates(hex) {
    let qRounded = Math.round(hex.q);
    let rRounded = Math.round(hex.r);
    let sRounded = Math.round(hex.s);

    let qDiff = Math.abs(qRounded - hex.q);
    let rDiff = Math.abs(rRounded - hex.r);
    let sDiff = Math.abs(sRounded - hex.s);

    /*
      We reset the coordinate with the most difference
      because rounded coordinates may not satisfy the
      condition: q + r + s = 0 
    */
    if (qDiff > rDiff && qDiff > sDiff) {
      qRounded = -rRounded - sRounded;
    } else if (rDiff > qDiff && rDiff > sDiff) {
      rRounded = -qRounded - sRounded;
    } else {
      sRounded = -qRounded - rRounded;
    }

    return new Hex(qRounded, rRounded, sRounded);
  }

  convertScreenToCanvas(screenPoint, canvasOrigin) {
    let x = screenPoint.x - canvasOrigin.x;
    let y = screenPoint.y - canvasOrigin.y;

    return new Point(x, y);
  }

  // Convert cube coordinates to canvas coordinates
  convertHexToCanvas(hex) {
    let x =
      (this.orientation.forward_matrix[0] * hex.q +
        this.orientation.forward_matrix[1] * hex.r) *
      this.size;
    let y =
      (this.orientation.forward_matrix[2] * hex.q +
        this.orientation.forward_matrix[3] * hex.r) *
      this.size;

    return new Point(x + this.origin.x, y + this.origin.y);
  }

  // Convert canvas coordinates to cube coordinates
  convertCanvasToHex(point) {
    let pt = new Point(
      (point.x - this.origin.x) / this.size,
      (point.y - this.origin.y) / this.size
    );

    let q =
      this.orientation.inverse_matrix[0] * pt.x +
      this.orientation.inverse_matrix[1] * pt.y;
    let r =
      this.orientation.inverse_matrix[2] * pt.x +
      this.orientation.inverse_matrix[3] * pt.y;

    return this.roundHexCoordinates(new Hex(q, r, -q - r));
  }

  convertScreenToHex(screenPoint, canvasOrigin) {
    let canvasPoint = this.convertScreenToCanvas(screenPoint, canvasOrigin);

    return this.convertCanvasToHex(canvasPoint);
  }

  // Get coordinates offset for the corner of the hexagon (relative to the center of the hexagon)
  getHexCornerOffset(corner) {
    let angle = (2.0 * Math.PI * (this.orientation.start_angle - corner)) / 6.0;

    return new Point(this.size * Math.cos(angle), this.size * Math.sin(angle));
  }

  // Get coordinates for all corners of the hexagon
  getPolygonCorners(hex) {
    let corners = [];
    let center = this.convertHexToCanvas(hex);

    for (let i = 0; i < 6; i++) {
      let offset = this.getHexCornerOffset(i);
      corners.push(new Point(center.x + offset.x, center.y + offset.y));
    }

    return corners;
  }
}

class Permutation {
  static QRS(q, r, s, isAlive) {
    return new Hex(q, r, s, isAlive);
  }

  static SRQ(s, r, q, isAlive) {
    return new Hex(q, r, s, isAlive);
  }

  static SQR(s, q, r, isAlive) {
    return new Hex(q, r, s, isAlive);
  }

  static RQS(r, q, s, isAlive) {
    return new Hex(q, r, s, isAlive);
  }

  static RSQ(r, s, q, isAlive) {
    return new Hex(q, r, s, isAlive);
  }

  static QSR(q, s, r, isAlive) {
    return new Hex(q, r, s, isAlive);
  }
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

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
    alert("Nothing has changed since the last generation. The game is stopped.");

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
