import Map from './Map';

export default class MapView {
   private map: Map;
   private canvas: HTMLCanvasElement;
   private context: CanvasRenderingContext2D;

   constructor(map: Map, canvas: HTMLCanvasElement) {
      this.map = map;
      this.canvas = canvas;
      canvas.width = map.bounds.width;
      canvas.height = map.bounds.height;
      const context = canvas.getContext('2d');

      if (context === null) {
         throw new Error('2D context is null');
      }

      this.context = context;
      this.drawMap();
   }

   drawMap() {
      const { context, map } = this;
      const { points, lines } = map;

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
   }
}
