enum WadType {
   iwad = 'IWAD',
   pwad = 'PWAD',
}

// format of each directory entry
type LumpInfo = {
   filePosition: number; // what byte offset within the WAD
   size: number; // in bytes
   name: string;
};

function createAndDownloadFile(file: File, filename: string): void {
   const link = document.createElement('a');
   const url = URL.createObjectURL(file);
   link.href = url;
   link.download = filename;
   link.click();
}

// Format of an entire WAD file:
// HEADER (12 bytes)
// - id string 'IWAD' or 'PWAD' (Uint8[4])
// - number of lumps in the WAD (Uint32)
// - location of the directory (Uint32)
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

const HEADER_SIZE = 12;
const ENTRY_SIZE = 16;

export class WadFile {
   type!: WadType;
   private buffer!: ArrayBuffer; // the entire WAD as raw data
   directory: LumpInfo[] = [];

   constructor(buffer?: ArrayBuffer) {
      if (buffer !== undefined) {
         this.loadFromBuffer(buffer);
      } else {
         this.create();
      }
   }

   private loadFromBuffer(buffer: ArrayBuffer) {
      this.buffer = buffer;

      const header = new DataView(this.buffer, 0, HEADER_SIZE);

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

      const numLumps = header.getUint32(4, true);

      // get directory offset

      const directoryOffset = header.getUint32(8, true);

      for (let i = 0; i < numLumps; i++) {
         const entryOffset = directoryOffset + i * ENTRY_SIZE;
         const entry = new DataView(this.buffer, entryOffset, ENTRY_SIZE);

         const lumpInfo: LumpInfo = {
            filePosition: entry.getUint32(0, true),
            size: entry.getUint32(4, true),
            name: this.getString(entry, 8, 8),
         };
         this.directory.push(lumpInfo);
      }

      console.log(`Read WAD file with ${numLumps} lumps`);
   }

   private create() {
      this.buffer = new ArrayBuffer(HEADER_SIZE);
      const id = 'PWAD';
      const view = new DataView(this.buffer, 0, id.length);
      for (let i = 0; i < id.length; i++) {
         view.setUint8(i, id.charCodeAt(i));
      }

      // TEMP: test
      const file = new File([this.buffer], 'new.wad');
      //createAndDownloadFile(file, 'test.wad');
   }

   // resize this.buffer by amount
   increaseBufferSize(amount: number) {
      const newSize = this.buffer.byteLength + amount;
      const newBuffer = new ArrayBuffer(newSize);

      // copy old data into new buffer
      const temp = new Uint8Array(newBuffer); // we need set() on Uint8Array
      temp.set(new Uint8Array(this.buffer)); // copy old buffer to start of new buffer

      this.buffer = newBuffer; // repoint old buffer to new
   }

   // insert data into this.buffer at byte offset
   insertData(buffer: ArrayBuffer, offset: number) {
      new Uint8Array(this.buffer).set(new Uint8Array(buffer), offset);
   }

   // TODO: check performance
   addLump(name: string, data: ArrayBuffer) {
      // don't change an IWAD!
      if (this.type === WadType.iwad) {
         throw new Error('error: try to add lump to IWAD!');
      }

      // append a directory entry for this lump
      const entry: LumpInfo = {
         filePosition: this.buffer.byteLength,
         size: data.byteLength,
         name: name,
      };
      this.directory.push(entry);

      this.increaseBufferSize(data.byteLength);
      this.insertData(data, entry.filePosition);
   }

   writeDirectory() {
      let writePosition = this.buffer.byteLength;

      // complete WAD Header
      const headerView = new DataView(this.buffer, 0, HEADER_SIZE);
      headerView.setUint32(4, this.directory.length); // number of lumps
      headerView.setUint32(8, writePosition);

      // make room for entire directory
      this.increaseBufferSize(this.directory.length * ENTRY_SIZE);

      // LumpInfo layout:
      // uint32_t  filePosition  (4 BYTES)
      // uint32_t  size          (4 BYTES)
      // uint8_t   name[8]       (8 BYTES)

      for (let i = 0; i < this.directory.length; i++) {
         const view = new DataView(this.buffer, writePosition, ENTRY_SIZE);
         view.setUint32(0, this.directory[i].filePosition, true);
         view.setUint32(4, this.directory[i].size, true);

         writePosition += ENTRY_SIZE;
      }
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
