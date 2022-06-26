export default class Line {
   point1: number;
   point2: number;
   flags: number;
   special: number;
   tag: number;
   // TODO Front/back sidedef

   constructor(dataView: DataView) {
      this.point1 = dataView.getInt16(0, true);
      this.point2 = dataView.getInt16(2, true);
      this.flags = dataView.getInt16(4, true);
      this.special = dataView.getInt16(6, true);
      this.tag = dataView.getInt16(8, true);
   }
}
