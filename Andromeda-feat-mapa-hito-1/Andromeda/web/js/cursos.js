// Filtros de la sección de cursos. Sin JavaScript todas las tarjetas se ven y los filtros quedan ocultos.
import { TODOS, coincide, textoCuenta } from './cursos-filtro.js';

const formulario = document.getElementById('filtros-cursos');
const lista = document.getElementById('lista-cursos');

if (formulario && lista) {
  const tarjetas = [...lista.querySelectorAll('.curso')];
  const cuenta = document.getElementById('cursos-cuenta');
  const vacio = document.getElementById('cursos-vacio');
  const limpiar = document.querySelectorAll('[data-limpiar-cursos]');

  const valor = (nombre) => formulario.elements[nombre].value || TODOS;

  const aplicar = () => {
    const edad = valor('edad');
    const tema = valor('tema');
    let visibles = 0;
    for (const tarjeta of tarjetas) {
      const muestra = coincide({ edad: tarjeta.dataset.edad, tema: tarjeta.dataset.tema }, edad, tema);
      tarjeta.hidden = !muestra;
      if (muestra) visibles += 1;
    }
    lista.hidden = visibles === 0;
    vacio.hidden = visibles !== 0;
    cuenta.textContent = textoCuenta(visibles, tarjetas.length);
  };

  // Un enlace como cursos/#calor abre la lista con ese tema ya elegido.
  const temaEnlace = decodeURIComponent(location.hash.slice(1));
  const radioTema = temaEnlace && formulario.querySelector(`input[name="tema"][value="${CSS.escape(temaEnlace)}"]`);
  if (radioTema) radioTema.checked = true;

  formulario.hidden = false;
  formulario.addEventListener('change', aplicar);
  formulario.addEventListener('reset', () => queueMicrotask(aplicar));
  limpiar.forEach((boton) => boton.addEventListener('click', () => formulario.reset()));
  aplicar();
}
