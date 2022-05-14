export class WadFile {
    // data

    constructor(file: File) {
        let fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onloadend = function(e) {
            
        }
    }
}