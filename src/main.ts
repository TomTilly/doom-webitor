import { WadFile } from './WadFile';

const inputEl = document.querySelector('input') as HTMLInputElement;

inputEl.addEventListener('change', (e) => {
   /* eslint-disable no-useless-catch */
   try {
      const wadFile = new WadFile(e.target.files[0]);
   } catch (error) {
      throw error;
   }
   /* eslint-enable */
});

export {};
