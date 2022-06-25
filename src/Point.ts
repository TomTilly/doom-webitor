export default class Point {
   x: number;
   y: number;

   constructor(dataView: DataView) {
      this.x = dataView.getInt16(0, true);
      this.y = dataView.getInt16(2, true);
   }
}
