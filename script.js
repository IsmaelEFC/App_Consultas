document.addEventListener('DOMContentLoaded', (event) => {
  const boxes = document.querySelectorAll('.box');

  boxes.forEach(box => {
    box.addEventListener('click', (e) => {
      const link = box.querySelector('a').href;
      // Asegúrate de que el evento clic no interfiera con el hover
      window.open(link, '_blank');
    });
  });
});
