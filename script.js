document.querySelector('.contact-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Gracias por escribirnos. Pronto vamos a habilitar el envío del formulario.');
  e.target.reset();
});
