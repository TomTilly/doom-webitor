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
      return this.origin.x + this.width - 1;
   }

   bottom(): number {
      return this.origin.y + this.height - 1;
   }

   containsPoint(point: Point): boolean {
      return (
         point.x >= this.origin.x &&
         point.x <= this.right() &&
         point.y >= this.origin.y &&
         point.y <= this.bottom()
      );
   }
}
