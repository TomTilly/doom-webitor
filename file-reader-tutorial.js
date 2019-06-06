const input = document.querySelector('input');
const reader = new FileReader();
console.log(reader);
reader.addEventListener('load', (e) => {
  console.log(e.target.result);
});

input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  console.log(file);
  reader.readAsText(file);
});