import { WadFile } from "./WadFile";

console.log(true);
const app = document.querySelector<HTMLDivElement>('#app')!;

const inputEl = document.querySelector('input') as HTMLInputElement;


inputEl.addEventListener('change', (e) => {
    const wadFile = new WadFile(e.target.files[0]);
});

console.dir(inputEl);

export {};
