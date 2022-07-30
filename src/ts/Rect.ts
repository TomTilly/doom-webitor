import Point from './Point';

export default class Rect {
   origin: Point; // upper left corner
   width: number;
   height: number;

   constructor(origin = new Point(), width = 0, height = 0) {
      this.origin = origin;
      this.width = width;
      this.height = height;
   }

   right(): number {
      return this.origin.x + this.width;
   }

   bottom(): number {
      return this.origin.y + this.height;
   }

   containsPoint(point: Point): boolean {
      return (
         point.x >= this.origin.x &&
         point.x <= this.right() &&
         point.y >= this.origin.y &&
         point.y <= this.bottom()
      );
   }

   intersectsLine(p1: Point, p2: Point) {
      const { origin } = this;

      // Four corners of rectangle, clockwise starting from origin
      const r1 = origin;
      const r2 = new Point(this.right(), origin.y);
      const r3 = new Point(this.right(), this.bottom());
      const r4 = new Point(origin.x, this.bottom());

      return (
         lineLineIntersection(p1, p2, r1, r2) ||
         lineLineIntersection(p1, p2, r2, r3) ||
         lineLineIntersection(p1, p2, r3, r4) ||
         lineLineIntersection(p1, p2, r4, r1)
      );
   }
}

function lineLineIntersection(p1: Point, p2: Point, p3: Point, p4: Point) {
   // https://www.jeffreythompson.org/collision-detection/line-line.php
   const uA =
      ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
      ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));
   const uB =
      ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
      ((p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y));

   return uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1;
}
