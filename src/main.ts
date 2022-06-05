import { WadFile } from './WadFile';
import testIWAD from '../wads/DOOM.WAD';

const response = await fetch(testIWAD);
const arrayBuffer = await response.arrayBuffer();

const wadFile = new WadFile(arrayBuffer);

export {};
