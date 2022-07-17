import Map from './Map';
import { isPointInRect } from './geometry';
import Rect from './Rect';

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

         const clickRect = new Rect();
         clickRect.makeSquare(worldX, worldY, POINT_SIZE + 4);
         console.log(clickRect);

         let selected = false;
         for (const point of map.points) {
            if (!selected && isPointInRect(point, clickRect)) {
               point.selected = true;
               selected = true;
            } else {
               point.selected = false;
            }
         }

         this.drawMap();
      });

      this.drawMap();
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

   drawMap() {
      const { ctx, map, gridSize, canvas } = this;
      const { points, lines, things } = map;

      ctx.save();
      ctx.translate(-map.bounds.x, -map.bounds.y);

      ctx.clearRect(map.bounds.x, map.bounds.y, canvas.width, canvas.height);

      // Draw grid lines

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
      for (
         let x = gridStartX;
         x < map.bounds.x + map.bounds.width;
         x += gridSize
      ) {
         if (x % 64 === 0) {
            ctx.strokeStyle = '#A0A3F5';
         } else {
            ctx.strokeStyle = '#dedede';
         }
         ctx.beginPath();
         ctx.moveTo(x, map.bounds.y);
         ctx.lineTo(x, map.bounds.y + map.bounds.height);
         ctx.stroke();
      }
      // Horizontal
      for (
         let y = gridStartY;
         y < map.bounds.y + map.bounds.height;
         y += gridSize
      ) {
         if (y % 64 === 0) {
            ctx.strokeStyle = '#A0A3F5';
         } else {
            ctx.strokeStyle = '#dedede';
         }
         ctx.beginPath();
         ctx.moveTo(map.bounds.x, y);
         ctx.lineTo(map.bounds.x + map.bounds.width, y);
         ctx.stroke();
      }

      // Draw points, lines, and things

      ctx.strokeStyle = 'rgb(0,0,0)';
      for (const line of lines) {
         ctx.beginPath();
         ctx.moveTo(points[line.point1].x, points[line.point1].y);
         ctx.lineTo(points[line.point2].x, points[line.point2].y);
         ctx.stroke();
      }

      ctx.fillStyle = 'rgb(0,0,0)';

      for (const thing of things) {
         ctx.fillRect(
            thing.x - THING_SIZE / 2,
            thing.y - THING_SIZE / 2,
            THING_SIZE,
            THING_SIZE
         );
      }

      for (const point of points) {
         if (point.selected) {
            ctx.fillStyle = 'red';
         } else {
            ctx.fillStyle = 'black';
         }

         ctx.fillRect(
            point.x - POINT_SIZE / 2,
            point.y - POINT_SIZE / 2,
            POINT_SIZE,
            POINT_SIZE
         );
      }

      ctx.restore();
   }
}
