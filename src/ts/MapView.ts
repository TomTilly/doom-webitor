import Map from './Map';

export default class MapView {
   private map: Map;
   private canvas: HTMLCanvasElement;
   private container: HTMLElement;
   private context: CanvasRenderingContext2D;
   private _isMouseDown = false;

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

         container.scrollLeft -= event.movementX;
         container.scrollTop -= event.movementY;
      });

      this.drawMap();
   }

   get isMouseDown() {
      return this._isMouseDown;
   }

   set isMouseDown(newValue) {
      this.container.classList.toggle('map-view--active');
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
