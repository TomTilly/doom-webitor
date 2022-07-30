import { WadFile } from './WadFile';
import Vertex from './Vertex';
import Line from './Line';
import Thing from './Thing';
import Rect from './Rect';
import Point from './Point';

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

enum CoordTranslation {
   canvasToNext = -1,
   nextToCanvas = 1,
}

// translate between NeXTSTEP and HTML Canvas coordinate systems
function translateCoord(
   yCoord: number,
   mapHeight: number,
   translation: CoordTranslation
): number {
   const translated = yCoord + mapHeight * translation;
   return -translated;
}

export default class DoomMap {
   vertices: Vertex[];
   lines: Line[];
   things: Thing[];
   bounds = new Rect();

   constructor(wad: WadFile, mapName: string) {
      const lumpNum = wad.getLumpNumberWithName(mapName);

      // Read vertexes from wad

      const vertexesLump = wad.getLump(lumpNum + MapLumps.vertexes);
      const VERTEX_SIZE = 4; // bytes
      const numVertexes = vertexesLump.byteLength / VERTEX_SIZE;

      // to calculate the map height (in NeXTSPACE coordinates)
      let top = -Number.MAX_VALUE;
      let bottom = Number.MAX_VALUE;

      this.vertices = [];
      for (let i = 0; i < numVertexes; i++) {
         const view = new DataView(vertexesLump, i * VERTEX_SIZE, VERTEX_SIZE);
         const vertex = new Vertex(view);

         if (vertex.origin.y > top) {
            top = vertex.origin.y;
         }
         if (vertex.origin.y < bottom) {
            bottom = vertex.origin.y;
         }

         this.vertices.push(vertex);
      }

      const height = top - bottom;
      for (const vertex of this.vertices) {
         // point.y += height;
         // point.y = -point.y;
         vertex.origin.y = translateCoord(
            vertex.origin.y,
            height,
            CoordTranslation.nextToCanvas
         );
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

      // Read things from wad

      const thingLump = wad.getLump(lumpNum + MapLumps.things);
      const THING_SIZE = 10;
      const numThings = thingLump.byteLength / THING_SIZE;

      this.things = [];
      for (let i = 0; i < numThings; i++) {
         const view = new DataView(thingLump, i * THING_SIZE, THING_SIZE);
         const thing = new Thing(view);
         thing.origin.y = translateCoord(
            thing.origin.y,
            height,
            CoordTranslation.nextToCanvas
         );
         this.things.push(thing);
      }

      this.updateBounds();
   }

   updateBounds() {
      let left = Number.MAX_VALUE;
      let right = -Number.MAX_VALUE;
      let top = Number.MAX_VALUE;
      let bottom = -Number.MAX_VALUE;

      for (const vertex of this.vertices) {
         if (vertex.origin.x < left) {
            left = vertex.origin.x;
         }
         if (vertex.origin.x > right) {
            right = vertex.origin.x;
         }
         if (vertex.origin.y < top) {
            top = vertex.origin.y;
         }
         if (vertex.origin.y > bottom) {
            bottom = vertex.origin.y;
         }
      }

      this.bounds.origin = new Point(left, top);
      this.bounds.width = right - left;
      this.bounds.height = bottom - top;
   }
}
