import { Hex } from "./hex.js";

export class Permutation {
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
