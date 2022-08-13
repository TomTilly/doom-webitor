import Rect from './Rect';
import Editor, { EditorMode } from './Editor';
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
   public gridSize: 8 | 16 | 32 | 64 = 32;

   constructor(canvas: HTMLCanvasElement, editor: Editor) {
      this.canvas = canvas;
      this.editor = editor;

      const context = canvas.getContext('2d');
      if (context === null) {
         throw new Error('2D context is null');
      }
      this.ctx = context;

      // Set initial canvas width and height and get 2D context
      this.setCanvasSize(
         this.editor.map.bounds.width,
         this.editor.map.bounds.height
      );

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

      canvas.addEventListener('keydown', (event) => {
         event.preventDefault();

         // TODO: Remove?
         this.keysPressed.add(event.key);

         switch (event.key) {
            case ' ':
               container.classList.add('map-view--movement-mode');
               this.editor.mode = EditorMode.scroll;
               break;
            case '=':
               this.gridSize /= 2;
               this.drawMap(this.editor.map);
               break;
            case '-':
               this.gridSize *= 2;
               this.drawMap(this.editor.map);
               break;
            case 'v':
               this.editor.mode = EditorMode.vertex;
               break;
            default:
               break;
         }
      });

      canvas.addEventListener('keyup', (event) => {
         event.preventDefault();

         // TODO: Remove?
         this.keysPressed.delete(event.key);
         switch (event.key) {
            case ' ':
               container.classList.remove('map-view--movement-mode');
               this.editor.mode = EditorMode.select;
               break;
            case 'v':
               this.editor.mode = EditorMode.select;
               break;
            default:
               break;
         }
      });

      canvas.addEventListener('mousedown', (event) => {
         this.isMouseDown = true;

         switch (this.editor.mode) {
            case EditorMode.select:
               this.editor.selectObject(event);
               break;
            case EditorMode.vertex:
               this.editor.selectObject(event);
               break;
            case EditorMode.line:
               break;
            case EditorMode.thing:
               break;
            default:
               break;
         }

         this.drawMap(editor.map);
      });

      canvas.addEventListener('mousemove', (event) => {
         event.preventDefault(); // prevent selection of text
         if (!this.isMouseDown) return;

         const { movementX, movementY } = event;
         // this.movementX = movementX;
         // this.movementY = movementY;

         // Scrolling
         switch (this.editor.mode) {
            case EditorMode.scroll:
               container.scrollLeft -= movementX;
               container.scrollTop -= movementY;
               break;
            case EditorMode.select:
            case EditorMode.vertex:
            case EditorMode.line:
            case EditorMode.thing:
               // move anything selected
               this.editor.dragObjects(event);
               this.drawMap(editor.map);
               break;
            default:
               break;
         }
      });

      canvas.addEventListener('mouseleave', () => {
         this.isMouseDown = false;
      });

      canvas.addEventListener('mouseup', () => {
         this.isMouseDown = false;
      });

      // update the retina scaling when changing monitors/resolutions
      const pixelRatio = window.devicePixelRatio;
      matchMedia(`(resolution: ${pixelRatio}dppx)`).addEventListener(
         'change',
         () => {
            this.setCanvasSize(
               this.editor.map.bounds.width,
               this.editor.map.bounds.height
            );
            this.drawMap(editor.map);
         }
      );

      this.drawMap(editor.map);
   }

   setCanvasSize(width: number, height: number) {
      const scale = window.devicePixelRatio;
      console.log('pixel ratio: ', window.devicePixelRatio);

      this.canvas.width = Math.floor(width * scale);
      this.canvas.height = Math.floor(height * scale);

      this.ctx.scale(scale, scale);

      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
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
      // ctx.translate(0.5, 0.5);
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
