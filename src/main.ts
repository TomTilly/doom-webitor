import { WadFile } from "./WadFile";

const inputEl = document.querySelector('input') as HTMLInputElement;


inputEl.addEventListener('change', (e) => {
    try {
        const wadFile = new WadFile(e.target.files[0]);
    } catch(error) {
        throw error;
    }
});

export {};
