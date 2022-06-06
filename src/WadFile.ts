enum WadType {
   iwad = 'IWAD',
   pwad = 'PWAD',
}

// format of each directory entry
type LumpInfo = {
   filePosition: number;
   size: number; // in bytes
   name: string;
};

// Format of an entire WAD file:
// HEADER (12 bytes)
// lump 0 (? bytes)
// lump 1 (? bytes)
// lump 2 (? bytes)
// ...
// lump 2305 (? bytes)
// DIRECTORY ENTRY 0 (16 bytes, DirOff)
// DIRECTORY ENTRY 1 (16 bytes, DirOff + n * 16)
// DIRECTORY ENTRY 2 (16 bytes, DirOff + n * 16)
// ...
// DIRECTORY ENTRY 2305

export class WadFile {
   type!: WadType;
   private buffer!: ArrayBuffer; // the entire WAD as raw data
   numLumps!: number;
   directory: LumpInfo[] = [];

   constructor(buffer: ArrayBuffer) {
      this.buffer = buffer;

      const header = new DataView(this.buffer, 0, 12);

      // get Header ID String
      const idString = this.getString(header, 0, 4);
      if (!(idString === WadType.iwad || idString === WadType.pwad)) {
         throw new Error('Error: not a valid WAD file');
      }

      if (idString === WadType.iwad) {
         this.type = WadType.iwad;
      } else if (idString === WadType.pwad) {
         this.type = WadType.pwad;
      }

      // get number of lumps

      this.numLumps = header.getUint32(4, true);

      // get directory offset

      const directoryOffset = header.getUint32(8, true);

      for (let i = 0; i < this.numLumps; i++) {
         const entryOffset = directoryOffset + i * 16;
         const entry = new DataView(this.buffer, entryOffset, 16);

         const lumpInfo: LumpInfo = {
            filePosition: entry.getUint32(0, true),
            size: entry.getUint32(4, true),
            name: this.getString(entry, 8, 8),
         };
         this.directory.push(lumpInfo);
      }

      console.log(`Read WAD file with ${this.numLumps} lumps`);
   }

   getLump(num: number): ArrayBuffer {
      const entry = this.directory[num];
      return this.buffer.slice(
         entry.filePosition,
         entry.filePosition + entry.size
      );
   }

   getLumpNumberWithName(name: string): number {
      return this.directory.findIndex((lumpInfo) => lumpInfo.name === name);
   }

   getLumpNamed(name: string): ArrayBuffer {
      return this.getLump(this.getLumpNumberWithName(name));
   }

   private getString(
      // TODO: location?
      dataView: DataView,
      offset: number,
      length: number
   ): string {
      const charCodes: number[] = [];
      for (let i = offset; i < offset + length; i++) {
         const c = dataView.getUint8(i);
         if (c === 0) {
            break;
         }
         charCodes.push(c);
      }
      const string = String.fromCharCode(...charCodes);
      return string;
   }
}
