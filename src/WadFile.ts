export class WadFile {
    // type
    // data

    constructor(file: File) {
        console.log(file);
        let fileReader = new FileReader();

        fileReader.readAsArrayBuffer(file);

        fileReader.onload = function(e) {
            let arrayBuffer = e.target.result;
            let wadTypeSlice = arrayBuffer?.slice(0, 4);
            let charArray = new Uint8Array(wadTypeSlice);
            let idString = String.fromCharCode(...charArray);
            console.log(idString);
            //let dataView = new DataView(arrayBuffer);
            //console.log(dataView.getUint8(0));
        }

        fileReader.onerror = function(e) {
            console.log('WadFile: read error');
        }
    }
}
