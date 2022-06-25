import { WadFile } from './WadFile';
import Point from './Point';
import Line from './Line';
import Thing from './Thing';
import Rect from './Rect';

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

export default class Map {
   points: Point[];
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

      this.points = [];
      for (let i = 0; i < numVertexes; i++) {
         const view = new DataView(vertexesLump, i * VERTEX_SIZE, VERTEX_SIZE);
         const point = new Point(view);

         if (point.y > top) {
            top = point.y;
         }
         if (point.y < bottom) {
            bottom = point.y;
         }

         this.points.push(point);
      }

      const height = top - bottom;
      for (const point of this.points) {
         // point.y += height;
         // point.y = -point.y;
         point.y = translateCoord(
            point.y,
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
         thing.y = translateCoord(
            thing.y,
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

      for (const point of this.points) {
         if (point.x < left) {
            left = point.x;
         }
         if (point.x > right) {
            right = point.x;
         }
         if (point.y < top) {
            top = point.y;
         }
         if (point.y > bottom) {
            bottom = point.y;
         }
      }

      this.bounds.x = left;
      this.bounds.y = top;
      this.bounds.width = right - left;
      this.bounds.height = bottom - top;
   }
}
