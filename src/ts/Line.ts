export default class Line {
   // The index of the vertex in map.vertices
   vertex1: number;
   vertex2: number;
   flags: number;
   special: number;
   tag: number;
   // TODO Front/back sidedef

   selected = false;

   constructor(dataView: DataView) {
      this.vertex1 = dataView.getInt16(0, true);
      this.vertex2 = dataView.getInt16(2, true);
      this.flags = dataView.getInt16(4, true);
      this.special = dataView.getInt16(6, true);
      this.tag = dataView.getInt16(8, true);
   }
}
