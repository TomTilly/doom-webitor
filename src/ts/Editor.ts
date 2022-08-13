import DoomMap from './DoomMap';
import MapView from './MapView';
import Point from './Point';
import Rect from './Rect';
import { THING_SIZE, POINT_SIZE } from './constants';

export enum EditorMode {
   select,
   scroll,
   vertex,
   line,
   thing,
}

export default class Editor {
   public map: DoomMap;
   public mapView!: MapView;
   public mode: EditorMode = EditorMode.select;

   constructor(map: DoomMap) {
      this.map = map;
      // this.mapView = mapView;

      // TODO - Temporary, maybe not here
      // mapView.setCanvasSize(map.bounds.width, map.bounds.height);
      // mapView.drawMap(map);
   }

   // keyDown()

   // TODO: remove? likely to remove because mousedown is handled in MapView
   // mouseDown(event: MouseEvent) {
   //    const worldPoint = new Point(
   //       event.offsetX + this.map.bounds.origin.x,
   //       event.offsetY + this.map.bounds.origin.y
   //    );

   //    // Get nearest grid point
   //    // const gridX = Math.round(worldX / this.gridSize) * this.gridSize;
   //    // const gridY = Math.round(worldY / this.gridSize) * this.gridSize;

   //    this.selectObject(worldPoint);
   //    this.mapView.drawMap(this.map);
   // }

   currentDragPoint: Point = new Point();
   prevDragPoint: Point = new Point();
   dragObjects(event: MouseEvent): void {
      this.currentDragPoint = this.getGridPoint(this.canvasToWorld(event));

      // Get difference between current cursor position and the starting drag position
      const dx = this.currentDragPoint.x - this.prevDragPoint.x;
      const dy = this.currentDragPoint.y - this.prevDragPoint.y;
      console.log({ dx, dy });

      this.map.vertices
         .filter((vertex) => vertex.selected === true)
         .forEach((vertex) => {
            const nearestGridPoint = this.getGridPoint(vertex.origin);
            vertex.origin.x = nearestGridPoint.x + dx;
            vertex.origin.y = nearestGridPoint.y + dy;
         });

      this.map.things
         .filter((thing) => thing.selected === true)
         .forEach((thing) => {
            const nearestGridPoint = this.getGridPoint(thing.origin);

            thing.origin.x = nearestGridPoint.x + dx;
            thing.origin.y = nearestGridPoint.y + dy;
         });

      this.prevDragPoint = this.currentDragPoint;
   }

   getGridPoint(point: Point): Point {
      // Get nearest grid point
      const gridX =
         Math.round(point.x / this.mapView.gridSize) * this.mapView.gridSize;
      const gridY =
         Math.round(point.y / this.mapView.gridSize) * this.mapView.gridSize;
      return new Point(gridX, gridY);
   }

   canvasToWorld(event: MouseEvent): Point {
      return new Point(
         event.offsetX + this.map.bounds.origin.x,
         event.offsetY + this.map.bounds.origin.y
      );
   }

   // TODO: Move to DoomMap
   deselectAll() {
      for (const vertex of this.map.vertices) {
         vertex.selected = false;
      }
      for (const line of this.map.lines) {
         line.selected = false;
      }
      for (const thing of this.map.things) {
         thing.selected = false;
      }
   }

   selectObject(event: MouseEvent) {
      const worldPoint = this.canvasToWorld(event);
      // extra margin around clicked point
      const clickSize = POINT_SIZE + 4;
      const clickRectOrigin = new Point(
         worldPoint.x - clickSize / 2,
         worldPoint.y - clickSize / 2
      );
      const clickRect = new Rect(clickRectOrigin, clickSize, clickSize);

      // try to select a point
      if (this.mode === EditorMode.select || this.mode === EditorMode.vertex) {
         for (const vertex of this.map.vertices) {
            if (clickRect.containsPoint(vertex.origin)) {
               if (vertex.selected) {
                  if (this.mapView.keysPressed.has('Shift')) {
                     vertex.selected = false;
                  }
               } else {
                  if (!this.mapView.keysPressed.has('Shift')) {
                     this.deselectAll();
                  }
                  vertex.selected = true;
               }
               this.currentDragPoint = this.getGridPoint(
                  this.canvasToWorld(event)
               );
               this.prevDragPoint = this.getGridPoint(
                  this.canvasToWorld(event)
               );
               return;
            }
         }
      }

      // TODO: try to select a line
      /*
      if (this.mode === EditorMode.select || this.mode === EditorMode.line) {
         for (const line of this.map.lines) {
            const point1 = this.map.vertices[line.vertex1].origin;
            const point2 = this.map.vertices[line.vertex2].origin;
            if (clickRect.intersectsLine(point1, point2)) {
               line.selected = true;
               return;
            }
         }
      }
      */

      // try to select a thing
      if (this.mode === EditorMode.select || this.mode === EditorMode.thing) {
         for (const thing of this.map.things) {
            const point = new Point(
               thing.origin.x - THING_SIZE / 2,
               thing.origin.y - THING_SIZE / 2
            );

            const rect = new Rect(point, THING_SIZE, THING_SIZE);
            if (rect.containsPoint(worldPoint)) {
               if (thing.selected) {
                  if (this.mapView.keysPressed.has('Shift')) {
                     thing.selected = false;
                  }
               } else {
                  if (!this.mapView.keysPressed.has('Shift')) {
                     this.deselectAll();
                  }
                  thing.selected = true;
               }
               this.currentDragPoint = this.getGridPoint(
                  this.canvasToWorld(event)
               );
               this.prevDragPoint = this.getGridPoint(
                  this.canvasToWorld(event)
               );
               return;
            }
         }
      }

      this.deselectAll();
   }
}
