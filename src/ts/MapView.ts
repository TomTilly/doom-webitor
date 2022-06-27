import Map from './Map';

export default class MapView {
   private map: Map;
   private canvas: HTMLCanvasElement;
   private container: HTMLElement;
   private context: CanvasRenderingContext2D;
   private _isMouseDown = false;
   private prevX: number;
   private prevY: number;
   private scrollInitialTop: number;
   private scrollInitialLeft: number;

   constructor(map: Map, canvas: HTMLCanvasElement) {
      this.map = map;
      this.canvas = canvas;

      // Set container

      const container = canvas.parentElement;

      if (container === null) {
         throw new Error('Canvas has no parent element');
      }

      this.container = container;

      // Set initial canvas width and height and get 2D context

      canvas.width = map.bounds.width;
      canvas.height = map.bounds.height;
      const context = canvas.getContext('2d');

      if (context === null) {
         throw new Error('2D context is null');
      }

      this.context = context;

      // Click and drag to scroll functionality

      container.addEventListener('mousedown', (event) => {
         this.isMouseDown = true;
         this.prevX = event.offsetX;
         this.prevY = event.offsetY;

         // this.scrollInitialLeft = container.scrollLeft;
         // this.scrollInitialTop = container.scrollTop;
      });

      container.addEventListener('mouseleave', () => {
         this.isMouseDown = false;
      });

      container.addEventListener('mouseup', () => {
         this.isMouseDown = false;
      });

      container.addEventListener('mousemove', (event) => {
         if (!this.isMouseDown) return;
         event.preventDefault(); // prevent selection of text

         // Scrolling

         const x = event.offsetX;
         const y = event.offsetY;

         const walkX = this.prevX - x;
         const walkY = this.prevY - y;

         console.group('mousemove');
         console.log({ x, y });
         console.log({ prevX: this.prevX, prevY: this.prevY });
         console.log({ walkX, walkY });
         console.groupEnd();
         if (walkX !== 0 || walkY !== 0) {
            container.scrollLeft += walkX;
            container.scrollTop += walkY;

            this.prevX = x;
            this.prevY = y;
         }
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
      const { context, map } = this;
      const { points, lines, things } = map;

      context.strokeStyle = 'rgb(0,0,0)';
      context.translate(-map.bounds.x, -map.bounds.y);

      // Draw points

      for (const point of points) {
         context.fillRect(point.x - 2, point.y - 2, 4, 4);
      }

      for (const line of lines) {
         context.beginPath();
         context.moveTo(points[line.point1].x, points[line.point1].y);
         context.lineTo(points[line.point2].x, points[line.point2].y);
         context.stroke();
      }

      for (const thing of things) {
         context.fillRect(thing.x - 16, thing.y - 16, 32, 32);
      }
   }
}
