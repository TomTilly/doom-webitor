import { WadFile } from './WadFile';
import doomWadURL from '/wads/DOOM.WAD';
import Map from './Map';
import MapView from './MapView';
import Editor from './Editor';

if (typeof doomWadURL !== 'string') {
   throw new Error('testIWAD should be a string.');
}

const response = await fetch(doomWadURL);
const arrayBuffer = await response.arrayBuffer();

const doomWad = new WadFile(arrayBuffer);
const map = new Map(doomWad, 'E4M1');
const canvas = document.getElementById('map') as HTMLCanvasElement;
const editor = new Editor(map);
const mapView = new MapView(canvas, editor);
editor.mapView = mapView;

const container = canvas.parentElement as HTMLDivElement;
container.focus();

console.log(doomWad);
console.log(map);
console.log(mapView);

// const testWad = new WadFile();

// const e1m1Label = doomWad.getLumpNumberWithName('E1M1');
// const e1m1Things = doomWad.getLump(e1m1Label + MapLumps.things);
// const e2m3Label = doomWad.getLumpNumberWithName('E2M3');
// const e2m3Lines = doomWad.getLump(e2m3Label + MapLumps.linedefs);

// testWad.addLump('THINGS', e1m1Things);
// testWad.addLump('LINEDEFS', e2m3Lines);
// testWad.writeDirectory();
// testWad.saveAndDownload('test.wad');

export {};
