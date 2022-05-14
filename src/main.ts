const app = document.querySelector<HTMLDivElement>('#app')!;

const inputEl = document.querySelector('input') as HTMLInputElement;

inputEl.addEventListener('change', (e) => {
  console.log('inputEl');
});

console.dir(inputEl);

export {};
