export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Hex {
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

  constructor(q, r, s) {
    // We are using cube coordinate system
    // q -> x, r -> z, s -> y
    this.q = q;
    this.r = r;
    this.s = s;

    // Status of the hex (dead or alive)
    this.isAlive = Boolean(Math.round(Math.random()));

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
}

/* 
    Contains forward and inverse matrices for conversions between
  hex coordinates and screen coordinates.
    Also contains start angle which are used to draw the corners.
*/
class Orientation {
  constructor(forward_matrix, inverse_matrix, start_angle) {
    this.forward_matrix = forward_matrix;
    this.inverse_matrix = inverse_matrix;
    this.start_angle = start_angle;
  }
}

export class Layout {
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

    // Size of side of the hexagon (uses Point type to keep different sizes for each dimension)
    this.size = size;

    // Screen coordinates of the origin point for the layout
    this.origin = origin;
  }

  // Convert cube coordinates to screen coordinates
  convertHexToPixel(hex) {
    let x =
      (this.orientation.forward_matrix[0] * hex.q + this.orientation.forward_matrix[1] * hex.r) * this.size.x;
    let y =
      (this.orientation.forward_matrix[2] * hex.q + this.orientation.forward_matrix[3] * hex.r) * this.size.y;

    return new Point(x + this.origin.x, y + this.origin.y);
  }

  // Convert screen coordinates to cube coordinates
  convertPixelToHex(point) {
    let pt = new Point(
      (point.x - this.origin.x) / this.size.x,
      (point.y - this.origin.y) / this.size.y
    );

    let q = this.orientation.inverse_matrix[0] * pt.x + this.orientation.inverse_matrix[1] * pt.y;
    let r = this.orientation.inverse_matrix[2] * pt.x + this.orientation.inverse_matrix[3] * pt.y;

    return new Hex(q, r, -q - r);
  }

  // Get coordinates offset for the corner of the hexagon (relative to the center of the hexagon)
  getHexCornerOffset(corner) {
    let angle = (2.0 * Math.PI * (this.orientation.start_angle - corner)) / 6.0;

    return new Point(
      this.size.x * Math.cos(angle),
      this.size.y * Math.sin(angle)
    );
  }

  // Get coordinates for all corners of the hexagon
  getPolygonCorners(hex) {
    let corners = [];
    let center = this.convertHexToPixel(hex);

    for (let i = 0; i < 6; i++) {
      let offset = this.getHexCornerOffset(i);
      corners.push(new Point(center.x + offset.x, center.y + offset.y));
    }

    return corners;
  }
}
