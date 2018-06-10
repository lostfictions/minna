// Based on https://github.com/axelpale/nudged/blob/master/lib/Transform.js

export default class Transform {
  s: number;
  r: number;
  tx: number;
  ty: number;

  constructor(s: number, r: number, tx: number, ty: number) {
    this.s = s;
    this.r = r;
    this.tx = tx;
    this.ty = ty;
  }

  // Default epsilon to use when coping with floating point arithmetics.
  // JavaScript floating point numbers have 52 bits in mantissa (IEEE-754).
  // That is about 16 base10 numbers. Therefore the epsilon should be
  // much larger than 1 * 10^-16. Let say 1 * 10^-10 is a good one.
  static EPSILON = 0.0000000001;

  /**
   * Returns whether this transform is _almost_ equal to another transform. True
   * if a matrix norm of the difference is smaller than epsilon. We use modified
   * L1 norm that values s, r, tx, and ty as equally important.
   *
   * @param t The other transform.
   * @param epsilon Defaults to Transform.EPSILON. Set to 0 for strict
   * comparison.
   */
  isAlmostEqualTo(t: Transform, epsilon = Transform.EPSILON) {
    // Note:
    //   We first thought to use Frobenius norm but it felt wrong
    //   because it exaggerates s and r. Proof:
    //     We know Frobenius norm for real square matrices:
    //       Norm(A) = sqrt(sum_i(sum_j(a_ij * a_ij)))
    //     For a transform it looks like:
    //       Norm(T) = sqrt(s*s + r*r + x*x + r*r + s*s + y*y + 1)
    //     Thus s and r have bigger impact.
    //
    var ds = Math.abs(this.s - t.s);
    var dr = Math.abs(this.r - t.r);
    var dx = Math.abs(this.tx - t.tx);
    var dy = Math.abs(this.ty - t.ty);

    // smaller-or-equal instead of smaller-than to make epsilon=0 work.
    return ds + dr + dx + dy <= epsilon;
  }

  /**
   * Returns whether this transform is strictly equal to another transform.
   */
  isEqualTo(t: Transform) {
    // Are transforms equal?
    return (
      this.s === t.s && this.r === t.r && this.tx === t.tx && this.ty === t.ty
    );
  }

  /**
   * Get the transformation matrix as an object with a format common to many
   * APIs, including `kld-affine`
   *
   * Returns an object having properties a, b, c, d, e, f, as follows:
   * ```
   *   [ s  -r  tx ]   [ a  c  e ]
   *   [ r   s  ty ] = [ b  d  f ]
   *   [ 0   0   1 ]   [ -  -  - ]
   * ```
   */
  getMatrix() {
    return {
      a: this.s,
      b: this.r,
      c: -this.r,
      d: this.s,
      e: this.tx,
      f: this.ty
    };
  }

  /**
   * Get the current rotation in radians.
   */
  getRotation(): number {
    return Math.atan2(this.r, this.s);
  }

  /**
   * Get the scale multiplier.
   */
  getScale(): number {
    return Math.sqrt(this.r * this.r + this.s * this.s);
  }

  /**
   * Get the translation, as a tuple in the form [x, y].
   */
  getTranslation(): [number, number] {
    return [this.tx, this.ty];
  }

  /**
   * Return an array representation of the transformation.
   *
   * Together with nudged.createFromArray(...), this method makes an easy
   * serialization and deserialization to and from JSON possible.
   */
  toArray() {
    return [this.s, this.r, this.tx, this.ty];
  }

  /**
   * Transform an array of points by this matrix.
   */
  transformPoints(ps: [number, number][]): [number, number][] {
    return ps.map(this.transformPoint);
  }

  /**
   * Transform a point by this matrix.
   */
  transformPoint(p: [number, number]): [number, number] {
    return [
      this.s * p[0] - this.r * p[1] + this.tx,
      this.r * p[0] + this.s * p[1] + this.ty
    ];
  }

  /**
   * Return an inversed instance of this transform.
   */
  inverse(): Transform {
    const det = this.s * this.s + this.r * this.r;
    // Test if singular transformation. These might occur when all the range
    // points are the same, forcing the scale to drop to zero.
    if (Math.abs(det) < Transform.EPSILON) {
      throw new Error("Singular transformations cannot be inversed.");
    }
    const shat = this.s / det;
    const rhat = -this.r / det;
    const txhat = (-this.s * this.tx - this.r * this.ty) / det;
    const tyhat = (this.r * this.tx - this.s * this.ty) / det;

    return new Transform(shat, rhat, txhat, tyhat);
  }

  translateBy(dx: number, dy: number): Transform {
    return new Transform(this.s, this.r, this.tx + dx, this.ty + dy);
  }

  scaleBy(multiplier: number, pivot?: [number, number]): Transform {
    const m = multiplier;
    let x: number;
    let y: number;
    if (typeof pivot === "undefined") {
      x = y = 0;
    } else {
      x = pivot[0];
      y = pivot[1];
    }
    return new Transform(
      m * this.s,
      m * this.r,
      m * this.tx + (1 - m) * x,
      m * this.ty + (1 - m) * y
    );
  }

  /**
   * @param radians From positive x to positive y axis
   * @param pivot
   */
  rotateBy(radians: number, pivot?: [number, number]): Transform {
    const co = Math.cos(radians);
    const si = Math.sin(radians);
    let x: number;
    let y: number;

    if (typeof pivot === "undefined") {
      x = y = 0;
    } else {
      x = pivot[0];
      y = pivot[1];
    }
    const shat = this.s * co - this.r * si;
    const rhat = this.s * si + this.r * co;
    const txhat = (this.tx - x) * co - (this.ty - y) * si + x;
    const tyhat = (this.tx - x) * si + (this.ty - y) * co + y;

    return new Transform(shat, rhat, txhat, tyhat);
  }

  multiplyRight(transform: Transform): Transform {
    return this.multiplyBy(transform);
  }

  /**
   * Multiply this transformation matrix A
   * from the right with the given transformation matrix B
   * and return the result AB
   */
  multiplyBy(transform: Transform): Transform {
    // For reading aid:
    // s -r tx  t.s -r tx
    // r  s ty *  r  s ty
    // 0  0  1    0  0  1
    const t = transform;
    const shat = this.s * t.s - this.r * t.r;
    const rhat = this.s * t.r + this.r * t.s;
    const txhat = this.s * t.tx - this.r * t.ty + this.tx;
    const tyhat = this.r * t.tx + this.s * t.ty + this.ty;

    return new Transform(shat, rhat, txhat, tyhat);
  }

  static IDENTITY = new Transform(1, 0, 0, 0);
  static R90 = new Transform(0, 1, 0, 0);
  static R180 = new Transform(-1, 0, 0, 0);
  static R270 = new Transform(0, -1, 0, 0);
  static X2 = new Transform(2, 0, 0, 0);
}
