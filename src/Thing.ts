export default class Thing {
   x: number;
   y: number;
   angle: number;
   type: number;
   flags: number;

   constructor(dataView: DataView) {
      this.x = dataView.getInt16(0, true);
      this.y = dataView.getInt16(2, true);
      this.angle = dataView.getInt16(4, true);
      this.type = dataView.getInt16(6, true);
      this.flags = dataView.getInt16(8, true);
   }
}
