import DoomMap from './DoomMap';
import MapView from './MapView';
import Point from './Point';
import Rect from './Rect';
import { THING_SIZE, POINT_SIZE } from './constants';

export default class Editor {
   public map: DoomMap;
   public mapView!: MapView;

   constructor(map: DoomMap) {
      this.map = map;
      // this.mapView = mapView;

      // TODO - Temporary, maybe not here
      // mapView.setCanvasSize(map.bounds.width, map.bounds.height);
      // mapView.drawMap(map);
   }

   mouseDown(event: MouseEvent) {
      const worldPoint = new Point(
         event.offsetX + this.map.bounds.origin.x,
         event.offsetY + this.map.bounds.origin.y
      );

      // Get nearest grid point
      // const gridX = Math.round(worldX / this.gridSize) * this.gridSize;
      // const gridY = Math.round(worldY / this.gridSize) * this.gridSize;
      // console.log({ gridX, gridY });

      this.selectObject(worldPoint);
      this.mapView.drawMap(this.map);
   }

   selectObject(worldPoint: Point) {
      // extra margin around clicked point
      const clickSize = POINT_SIZE + 4;
      const clickRectOrigin = new Point(
         worldPoint.x - clickSize / 2,
         worldPoint.y - clickSize / 2
      );
      const clickRect = new Rect(clickRectOrigin, clickSize, clickSize);

      const deselectAll = () => {
         for (const vertex of this.map.vertices) {
            vertex.selected = false;
         }
         for (const line of this.map.lines) {
            line.selected = false;
         }
         for (const thing of this.map.things) {
            thing.selected = false;
         }
      };

      deselectAll();

      // try to select a point
      for (const vertex of this.map.vertices) {
         if (clickRect.containsPoint(vertex.origin)) {
            vertex.selected = true;
            console.log(this.map.vertices.findIndex((v) => v.selected));
            return;
         }
      }

      // TODO: try to select a line
      for (const line of this.map.lines) {
         const point1 = this.map.vertices[line.vertex1].origin;
         const point2 = this.map.vertices[line.vertex2].origin;
         if (clickRect.intersectsLine(point1, point2)) {
            line.selected = true;
            return;
         }
      }

      // try to select a thing
      for (const thing of this.map.things) {
         const point = new Point(
            thing.origin.x - THING_SIZE / 2,
            thing.origin.y - THING_SIZE / 2
         );

         const rect = new Rect(point, THING_SIZE, THING_SIZE);
         if (rect.containsPoint(worldPoint)) {
            thing.selected = true;
            return;
         }
      }
   }
}
