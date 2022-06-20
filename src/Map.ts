import { WadFile } from './WadFile';

enum MapLumps {
   label,
   things,
   linedefs,
   sidedefs,
   vertexes,
   segs,
   ssectors,
   nodes,
   sectors,
   reject,
   blockmap,
}

class Point {
   x: number;
   y: number;

   constructor(dataView: DataView) {
      this.x = dataView.getInt16(0, true);
      this.y = dataView.getInt16(2, true);
   }
}

class Line {
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

export class Map {
   points: Point[];
   lines: Line[];

   constructor(wad: WadFile, mapName: string) {
      const lumpNum = wad.getLumpNumberWithName(mapName);

      // Read vertexes from wad

      const vertexesLump = wad.getLump(lumpNum + MapLumps.vertexes);
      const VERTEX_SIZE = 4; // bytes
      const numVertexes = vertexesLump.byteLength / VERTEX_SIZE;

      this.points = [];
      for (let i = 0; i < numVertexes; i++) {
         const view = new DataView(vertexesLump, i * VERTEX_SIZE, VERTEX_SIZE);
         this.points.push(new Point(view));
      }

      // Read linedefs from wad

      const lineLump = wad.getLump(lumpNum + MapLumps.linedefs);
      const LINE_SIZE = 14;
      const numLines = lineLump.byteLength / LINE_SIZE;

      this.lines = [];
      for (let i = 0; i < numLines; i++) {
         const view = new DataView(lineLump, i * LINE_SIZE, LINE_SIZE);
         this.lines.push(new Line(view));
      }
   }
}
