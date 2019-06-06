// Represents view that represents the map
var MapView = /** @class */ (function () {
    function MapView(width, height) {
        this.scale = 1;
        this.gridSize = 8;
        this.canvas = document.getElementById('map-view');
        this.width = width;
        this.height = height;
        if (this.canvas.getContext) {
            this.view = this.canvas.getContext('2d');
            this.view.translate(0.5, 0.5);
        }
    }
    MapView.prototype.drawGrid = function () {
        var x;
        var y;
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
    };
    return MapView;
}());
var mapView = new MapView(1028, 1028);
mapView.drawGrid();
