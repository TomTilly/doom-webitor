import Rect from './Rect';
import Editor from './Editor';
import DoomMap from './DoomMap';
import { THING_SIZE, POINT_SIZE } from './constants';
import Thing from './Thing';

export default class MapView {
   private canvas: HTMLCanvasElement;
   private editor: Editor;
   private container: HTMLElement;
   private ctx: CanvasRenderingContext2D;
   private _isMouseDown = false;
   public keysPressed: Set<string> = new Set<string>();
   private gridSize: 8 | 16 | 32 | 64 = 32;

   constructor(canvas: HTMLCanvasElement, editor: Editor) {
      this.canvas = canvas;
      this.editor = editor;

      // Set initial canvas width and height and get 2D context
      this.setCanvasSize(
         this.editor.map.bounds.width,
         this.editor.map.bounds.height
      );

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
            this.drawMap(this.editor.map);
         }
         if (event.key === '-') {
            this.gridSize *= 2;
            this.drawMap(this.editor.map);
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
         this.editor.mouseDown(event);
      });

      this.drawMap(editor.map);
   }

   setCanvasSize(width: number, height: number) {
      this.canvas.width = width;
      this.canvas.height = height;
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

   drawGrid(bounds: Rect) {
      const { ctx, gridSize } = this;

      ctx.strokeStyle = '#dedede';

      let gridStartX = bounds.origin.x;
      while (gridStartX % gridSize !== 0) {
         gridStartX++;
      }
      let gridStartY = bounds.origin.y;
      while (gridStartY % gridSize !== 0) {
         gridStartY++;
      }

      // Vertical
      for (let x = gridStartX; x < bounds.right(); x += gridSize) {
         ctx.strokeStyle = x % 64 === 0 ? '#A0A3F5' : '#dedede';
         ctx.beginPath();
         ctx.moveTo(x, bounds.origin.y);
         ctx.lineTo(x, bounds.origin.y + bounds.height);
         ctx.stroke();
      }

      // Horizontal
      for (let y = gridStartY; y < bounds.bottom(); y += gridSize) {
         ctx.strokeStyle = y % 64 === 0 ? '#A0A3F5' : '#dedede';
         ctx.beginPath();
         ctx.moveTo(bounds.origin.x, y);
         ctx.lineTo(bounds.origin.x + bounds.width, y);
         ctx.stroke();
      }
   }

   // TODO Find a way to make this readonly
   drawMap(map: Readonly<DoomMap>) {
      const { ctx, canvas } = this;

      ctx.save(); // ensure following translation is always from (0, 0)
      ctx.translate(-map.bounds.origin.x, -map.bounds.origin.y);
      ctx.clearRect(
         map.bounds.origin.x,
         map.bounds.origin.y,
         canvas.width,
         canvas.height
      );

      this.drawGrid(map.bounds);

      // Draw points, lines, and things
      const { vertices, lines, things } = map;

      for (const line of lines) {
         ctx.strokeStyle = line.selected ? 'red' : 'black'; // TODO: color
         ctx.beginPath();
         ctx.moveTo(
            vertices[line.vertex1].origin.x,
            vertices[line.vertex1].origin.y
         );
         ctx.lineTo(
            vertices[line.vertex2].origin.x,
            vertices[line.vertex2].origin.y
         );
         ctx.stroke();
      }

      for (const vertex of vertices) {
         // TODO: filter and draw selected points separately
         ctx.fillStyle = vertex.selected ? 'red' : 'black';
         this.drawSquare(vertex.origin.x, vertex.origin.y, POINT_SIZE);
      }

      // TODO: Figure out solution for selecting stacked things
      const selectedThings: Thing[] = [];
      for (const thing of things) {
         if (thing.selected) {
            selectedThings.push(thing);
            continue;
         }
         ctx.fillStyle = 'black';
         this.drawSquare(thing.origin.x, thing.origin.y, THING_SIZE);
      }
      for (const thing of selectedThings) {
         ctx.fillStyle = 'red';
         this.drawSquare(thing.origin.x, thing.origin.y, THING_SIZE);
      }

      ctx.restore(); // return canvas origin to (0, 0)
   }
}
