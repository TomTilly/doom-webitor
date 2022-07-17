import Map from './Map';
import { isPointInRect } from './geometry';
import Rect from './Rect';
import Point from './Point';

const POINT_SIZE = 4;
const THING_SIZE = 32;

export default class MapView {
   private map: Map;
   private canvas: HTMLCanvasElement;
   private container: HTMLElement;
   private ctx: CanvasRenderingContext2D;
   private _isMouseDown = false;
   private keysPressed: Set<string> = new Set<string>();
   private gridSize: 8 | 16 | 32 | 64 = 32;

   constructor(map: Map, canvas: HTMLCanvasElement) {
      this.map = map;
      this.canvas = canvas;

      // Set initial canvas width and height and get 2D context

      canvas.width = map.bounds.width;
      canvas.height = map.bounds.height;
      const context = canvas.getContext('2d');

      if (context === null) {
         throw new Error('2D context is null');
      }

      this.ctx = context;

      // Set container

      const container = canvas.parentElement;

      if (container === null) {
         throw new Error('Canvas has no parent element');
      }

      this.container = container;

      container.scrollLeft =
         (container.scrollWidth - container.clientWidth) / 2;
      container.scrollTop =
         (container.scrollHeight - container.clientHeight) / 2;

      // Click and drag to scroll functionality

      container.addEventListener('keydown', (event) => {
         event.preventDefault();
         this.keysPressed.add(event.key);

         if (event.key === ' ') {
            container.classList.add('map-view--movement-mode');
         }
         if (event.key === '=') {
            this.gridSize /= 2;
            this.drawMap();
         }
         if (event.key === '-') {
            this.gridSize *= 2;
            this.drawMap();
         }
      });

      container.addEventListener('keyup', (event) => {
         event.preventDefault();
         this.keysPressed.delete(event.key);

         if (event.key === ' ') {
            container.classList.remove('map-view--movement-mode');
         }
      });

      container.addEventListener('mousedown', () => {
         this.isMouseDown = true;
      });

      container.addEventListener('mouseleave', () => {
         this.isMouseDown = false;
      });

      container.addEventListener('mouseup', () => {
         this.isMouseDown = false;
      });

      container.addEventListener('mousemove', (event) => {
         if (!this.isMouseDown || !this.keysPressed.has(' ')) return;
         event.preventDefault(); // prevent selection of text
         const { movementX, movementY } = event;

         // Scrolling

         container.scrollLeft -= movementX;
         container.scrollTop -= movementY;
      });

      canvas.addEventListener('mousedown', (event) => {
         const worldX = event.offsetX + map.bounds.x;
         const worldY = event.offsetY + map.bounds.y;
         console.log({ worldX, worldY });

         // Get nearest grid point
         const gridX = Math.round(worldX / this.gridSize) * this.gridSize;
         const gridY = Math.round(worldY / this.gridSize) * this.gridSize;
         console.log({ gridX, gridY });

         this.selectObject(worldX, worldY);
         this.drawMap();
      });

      this.drawMap();
   }

   // TODO: move to Editor
   selectObject(worldX: number, worldY: number) {
      const clickRect = new Rect(); // extra margin around clicked point
      clickRect.makeSquare(worldX, worldY, POINT_SIZE + 4);

      // try to select a point
      // FIXME: clicking a point should deselect any selected line and things
      let gotSelection = false;
      for (const point of this.map.points) {
         if (!gotSelection && isPointInRect(point.x, point.y, clickRect)) {
            point.selected = true;
            gotSelection = true;
         } else {
            if (!this.keysPressed.has('Shift')) {
               point.selected = false;
            }
         }
      }
      if (gotSelection) {
         return;
      }

      // TODO: try to select a line

      // try to select a thing
      gotSelection = false;
      for (const thing of this.map.things) {
         const rect = new Rect(
            thing.x - THING_SIZE / 2,
            thing.y - THING_SIZE / 2,
            THING_SIZE,
            THING_SIZE
         );
         if (!gotSelection && isPointInRect(worldX, worldY, rect)) {
            thing.selected = true;
            gotSelection = true;
         } else {
            if (!this.keysPressed.has('Shift')) {
               thing.selected = false;
            }
         }
      }
   }

   get isMouseDown() {
      return this._isMouseDown;
   }

   set isMouseDown(newValue) {
      if (newValue === true) {
         this.container.classList.add('map-view--active');
      } else {
         this.container.classList.remove('map-view--active');
      }

      this._isMouseDown = newValue;
   }

   drawSquare(centerX: number, centerY: number, size: number) {
      this.ctx.fillRect(centerX - size / 2, centerY - size / 2, size, size);
   }

   drawGrid() {
      const { ctx, map, gridSize } = this;

      ctx.strokeStyle = '#dedede';

      let gridStartX = map.bounds.x;
      while (gridStartX % gridSize !== 0) {
         gridStartX++;
      }
      let gridStartY = map.bounds.y;
      while (gridStartY % gridSize !== 0) {
         gridStartY++;
      }

      // Vertical
      for (let x = gridStartX; x < map.bounds.right(); x += gridSize) {
         ctx.strokeStyle = x % 64 === 0 ? '#A0A3F5' : '#dedede';
         ctx.beginPath();
         ctx.moveTo(x, map.bounds.y);
         ctx.lineTo(x, map.bounds.y + map.bounds.height);
         ctx.stroke();
      }

      // Horizontal
      for (let y = gridStartY; y < map.bounds.bottom(); y += gridSize) {
         ctx.strokeStyle = y % 64 === 0 ? '#A0A3F5' : '#dedede';
         ctx.beginPath();
         ctx.moveTo(map.bounds.x, y);
         ctx.lineTo(map.bounds.x + map.bounds.width, y);
         ctx.stroke();
      }
   }

   drawMap() {
      const { ctx, map, canvas } = this;

      ctx.save(); // ensure following translation is always from (0, 0)
      ctx.translate(-map.bounds.x, -map.bounds.y);
      ctx.clearRect(map.bounds.x, map.bounds.y, canvas.width, canvas.height);

      this.drawGrid();

      // Draw points, lines, and things
      const { points, lines, things } = map;

      for (const line of lines) {
         ctx.strokeStyle = 'rgb(0,0,0)'; // TODO: color
         ctx.beginPath();
         ctx.moveTo(points[line.point1].x, points[line.point1].y);
         ctx.lineTo(points[line.point2].x, points[line.point2].y);
         ctx.stroke();
      }

      for (const point of points) {
         ctx.fillStyle = point.selected ? 'red' : 'black';
         this.drawSquare(point.x, point.y, POINT_SIZE);
      }

      for (const thing of things) {
         ctx.fillStyle = thing.selected ? 'red' : 'black';
         this.drawSquare(thing.x, thing.y, THING_SIZE);
      }

      ctx.restore(); // return canvas origin to (0, 0)
   }
}
