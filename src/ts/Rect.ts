export default class Rect {
   x: number;
   y: number;
   width: number;
   height: number;

   // constructor(point: Point, size: number);
   // constructor(x = 0, y = 0, width = 0, height = 0);
   constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
   }

   makeSquare(centerX: number, centerY: number, size: number): void {
      this.x = centerX - size / 2;
      this.y = centerY - size / 2;
      this.width = size;
      this.height = size;
   }

   right(): number {
      return this.x + this.width;
   }

   bottom(): number {
      return this.y + this.height;
   }
}
