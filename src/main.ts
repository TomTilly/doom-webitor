import { WadFile } from './WadFile';
import testIWAD from '../wads/DOOM.WAD';

if (typeof testIWAD !== 'string') {
   throw new Error('testIWAD should be a string.');
}

const response = await fetch(testIWAD);
const arrayBuffer = await response.arrayBuffer();

const wadFile = new WadFile(arrayBuffer);

export {};
