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
