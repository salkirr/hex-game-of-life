import { Point } from "./point.js";

export class Canvas {
  constructor(canvas_id) {
    this.canvasElem = document.getElementById(canvas_id);
    this.ctx = this.canvasElem.getContext("2d");

    // Padding on vertical and horizontal axis of canvas
    this.padding = new Point(50, 50);

    // Canvas origin coordinates in screen coordinate system
    this.origin;

    // Style properties
    this.lineColor = "#cccbca";
    this.lineWidth = 3;
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
    this.canvasElem.height = innerHeight - 100;
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
}
