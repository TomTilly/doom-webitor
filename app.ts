// Represents view that represents the map
class MapView {
  width: number;
  height: number;
  scale: number = 1;
  gridSize: number = 8;
  canvas: any = document.getElementById('map-view');
  view: CanvasRenderingContext2D;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    if (this.canvas.getContext) {
      this.view = this.canvas.getContext('2d');
      this.view.translate(0.5, 0.5);
    }
  }

  drawGrid() {
    let x: number;
    let y: number;

    this.view.strokeStyle = 'rgba(0,0,255,64)';
    this.view.lineWidth = 0.5;
    this.view.beginPath();
    for (x = 0; x < this.width; x += this.gridSize) {
      this.view.moveTo(x, 0);
      this.view.lineTo(x, this.height);
    }
    for (y = 0; y < this.height; y += this.gridSize) {
      this.view.moveTo(0, y);
      this.view.lineTo(this.width, y);
    }
    this.view.stroke();
  }
}

const mapView = new MapView(1028, 1028);

mapView.drawGrid();