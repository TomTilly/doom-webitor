import Map from './Map';
import MapView from './MapView';
import Point from './Point';
import Rect from './Rect';
import { THING_SIZE, POINT_SIZE } from './constants';

export default class Editor {
   public map: Map;
   public mapView!: MapView;

   constructor(map: Map) {
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

      // try to select a point
      // FIXME: clicking a point should deselect any selected line and things
      let gotSelection = false;
      for (const vertex of this.map.vertices) {
         if (!gotSelection && clickRect.containsPoint(vertex)) {
            vertex.selected = true;
            gotSelection = true;
         } else {
            if (!this.mapView.keysPressed.has('Shift')) {
               vertex.selected = false;
            }
         }
      }
      if (gotSelection) {
         // TODO: why?
         return;
      }

      // TODO: try to select a line

      // try to select a thing
      gotSelection = false;
      for (const thing of this.map.things) {
         const point = new Point(
            thing.origin.x - THING_SIZE / 2,
            thing.origin.y - THING_SIZE / 2
         );

         const rect = new Rect(point, THING_SIZE, THING_SIZE);
         if (!gotSelection && rect.containsPoint(worldPoint)) {
            thing.selected = true;
            gotSelection = true;
         } else {
            if (!this.mapView.keysPressed.has('Shift')) {
               thing.selected = false;
            }
         }
      }
   }
}
