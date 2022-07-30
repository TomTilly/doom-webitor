import Point from './Point';

export default class Vertex {
   origin: Point;
   selected = false;

   constructor(dataView: DataView) {
      this.origin = new Point(
         dataView.getInt16(0, true),
         dataView.getInt16(2, true)
      );
   }
}
