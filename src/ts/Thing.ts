import Point from './Point';

export default class Thing {
   origin: Point; // center of the thing
   angle: number;
   type: number;
   flags: number;

   selected = false;

   constructor(dataView: DataView) {
      this.origin = new Point();
      this.origin.x = dataView.getInt16(0, true);
      this.origin.y = dataView.getInt16(2, true);
      this.angle = dataView.getInt16(4, true);
      this.type = dataView.getInt16(6, true);
      this.flags = dataView.getInt16(8, true);
   }
}
