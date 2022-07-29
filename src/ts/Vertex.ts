export default class Vertex {
   x: number;
   y: number;
   selected = false;

   constructor(dataView: DataView) {
      this.x = dataView.getInt16(0, true);
      this.y = dataView.getInt16(2, true);
   }
}
