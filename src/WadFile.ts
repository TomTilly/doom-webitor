
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
        let fileReader = new FileReader();

        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
            const check = e.target!.result as ArrayBuffer | null;
            if ( check === null ) {
                throw new Error('Error: could not get array buffer from file');
            }
            this.buffer = check;
            
            let header = new DataView(this.buffer, 0, 12);

            // get Header ID String

            let charArray = new Uint8Array(header.buffer, 0, 4);
            let idString = String.fromCharCode(...charArray);
            console.log('WAD type: ', idString);

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
            console.log(this.numLumps);
            
            // get directory offset

            let directoryOffset = header.getUint32(8);
            console.log('dir: ', directoryOffset.toString(16));
        }
        fileReader.onerror = function(e) {
            throw new Error('Error: WAD file read error');
        }
    }
}
