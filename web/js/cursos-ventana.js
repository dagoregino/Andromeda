// Cada curso se hace en una ventana, un paso a la vez. Al cerrarla el recorrido se descarta:
// no se guarda progreso. Sin JavaScript no se crean los botones y los afiches se leen igual.
import { DETALLES } from './cursos-detalle.js';
import { limitar, textoPaso, textoSiguiente } from './cursos-recorrido.js';
import { crearPaso } from './cursos-pasosVista.js';
import { crear, crearBoton } from './cursos-dom.js';

const lista = document.getElementById('lista-cursos');
const ventana = document.getElementById('curso-ventana');

if (lista && ventana && typeof ventana.showModal === 'function') {
  const parte = (id) => document.getElementById(id);
  const contenedor = parte('ventana-pasos');
  const barra = parte('ventana-barra');
  const anterior = parte('ventana-anterior');
  const siguiente = parte('ventana-siguiente');
  /** Curso abierto: { pasos, indice, abridor }. */
  let recorrido = null;

  const mostrar = (destino) => {
    const total = recorrido.pasos.length;
    const indice = limitar(destino, total);
    recorrido = { ...recorrido, indice };
    // Los demás pasos siguen en la página, ocultos: así no se pierde lo escrito al volver.
    recorrido.pasos.forEach(({ nodo }, i) => { nodo.hidden = i !== indice; });
    [...barra.children].forEach((tramo, i) => tramo.toggleAttribute('data-visto', i <= indice));
    parte('ventana-paso').textContent = textoPaso(indice, total);
    anterior.hidden = indice === 0;
    siguiente.textContent = textoSiguiente(indice, total);
    siguiente.classList.toggle('ventana__boton--salir', indice === total - 1);
    ventana.dataset.paso = recorrido.pasos[indice].nodo.dataset.tipo;
    contenedor.scrollTop = 0;
    ventana.scrollTop = 0;
    recorrido.pasos[indice].titulo.focus({ preventScroll: true });
  };

  const abrir = (tarjeta, titulo, curso, abridor) => {
    const { tema, edad } = tarjeta.dataset;
    ventana.dataset.tema = tema;
    parte('ventana-tema').textContent = tarjeta.querySelector('.curso__tema').textContent;
    parte('ventana-titulo').textContent = titulo;
    const pasos = curso.pasos.map((paso, indice) => crearPaso({ curso, paso, indice, tema, edad }));
    contenedor.replaceChildren(...pasos.map(({ nodo }) => nodo));
    barra.replaceChildren(...pasos.map(() => crear('span')));
    recorrido = { pasos, indice: 0, abridor };
    ventana.showModal();
    mostrar(0);
  };

  for (const tarjeta of lista.querySelectorAll('.curso')) {
    const titulo = tarjeta.querySelector('h2').textContent.trim();
    const curso = DETALLES[titulo];
    if (!curso) continue;
    const boton = crearBoton('curso__abrir', 'Abrir curso');
    boton.setAttribute('aria-label', `Abrir curso: ${titulo}`);
    boton.addEventListener('click', () => abrir(tarjeta, titulo, curso, boton));
    tarjeta.append(boton);
  }

  anterior.addEventListener('click', () => mostrar(recorrido.indice - 1));
  siguiente.addEventListener('click', () => {
    if (recorrido.indice === recorrido.pasos.length - 1) ventana.close();
    else mostrar(recorrido.indice + 1);
  });
  parte('ventana-cerrar').addEventListener('click', () => ventana.close());
  // Se cierra con Escape o con un botón. El foco vuelve al botón que abrió el curso.
  ventana.addEventListener('close', () => {
    // El aviso de cierre llega después: si ya se abrió otro curso, no hay que borrarlo.
    if (ventana.open) return;
    const { abridor } = recorrido ?? {};
    contenedor.replaceChildren();
    recorrido = null;
    abridor?.focus();
  });
}
