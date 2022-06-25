export default class Rect {
   x: number;
   y: number;
   width: number;
   height: number;

   constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
   }

   right(): number {
      return this.x + this.width;
   }

   bottom(): number {
      return this.y + this.height;
   }
}
