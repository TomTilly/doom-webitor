export enum MapLumps {
   label,
   things,
   linedefs,
   sidedefs,
   vertexes,
   segs,
   ssectors,
   nodes,
   sectors,
   reject,
   blockmap,
}

export type Point = {
   x: number;
   y: number;
};

class Map {
   points: Point[] = [];
}

export {};
