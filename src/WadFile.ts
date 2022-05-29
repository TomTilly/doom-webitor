
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
        console.log(file);
        let fileReader = new FileReader();

        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
            const check = e.target!.result as ArrayBuffer | null;
            if ( check === null ) {
                throw new Error('Error: could not get array buffer from file');
            }
            this.buffer = check;
            
            // Get Header ID String
            let charArray = new Uint8Array(this.buffer, 0, 4);
            let idString = String.fromCharCode(...charArray);
            console.log(idString);

            if ( !(idString == WadType.iwad || idString == WadType.pwad) ) {
                throw new Error('Error: not a valid WAD file');
            }

            if ( idString === WadType.iwad ) {
                this.type = WadType.iwad;
            } else if ( idString === WadType.pwad ) {
                this.type = WadType.pwad;
            }

            // Get Header number of lumps
            let uint32 = new Uint32Array(this.buffer, 4, 1);
            let array = Array.from(uint32);
            this.numLumps = array[0];
            console.log(this.numLumps);

            let offset32array = new Uint32Array(this.buffer, 8, 1);
            let array2 = Array.from(offset32array);
            let directoryOffset = array2[0];

            
        }
        fileReader.onerror = function(e) {
            throw new Error('Error: WAD file read error');
        }
    }
}
