
enum WadType {
    iwad = "IWAD",
    pwad = "PWAD"
}

export class DirectoryEntry
{
    filePosition: number;
    size: number; // if bytes
    name: string;
}

export class WadFile {
    type: WadType;
    buffer: ArrayBuffer;
    numLumps: number;
    directory: DirectoryEntry[];

    constructor(file: File) {
        const fileReader = new FileReader();

        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
            const check = e.target!.result as ArrayBuffer | null;
            if ( check === null ) {
                throw new Error('Error: could not get array buffer from file');
            }
            this.buffer = check;
            
            const header = new DataView(this.buffer, 0, 12);

            // get Header ID String
            const idString = this.getString(header, 0, 4);

            if ( !(idString == WadType.iwad || idString == WadType.pwad) ) {
                throw new Error('Error: not a valid WAD file');
            }

            if ( idString === WadType.iwad ) {
                this.type = WadType.iwad;
            } else if ( idString === WadType.pwad ) {
                this.type = WadType.pwad;
            }

            // get number of lumps

            this.numLumps = header.getUint32(4, true);
            
            // get directory offset

            let directoryOffset = header.getUint32(8, true);
        }
        fileReader.onerror = function(e) {
            throw new Error('Error: WAD file read error');
        }
    }

    getString(dataView: DataView, offset: number, length: number): string {
      const charArray = new Uint8Array(dataView.buffer, offset, length);
      return String.fromCharCode(...charArray);
    }
}
