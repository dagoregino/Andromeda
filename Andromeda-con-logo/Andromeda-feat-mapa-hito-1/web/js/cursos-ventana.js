// Cada curso se abre en una ventana con sus actividades y una pregunta para probar.
// Sin JavaScript no se crean los botones y los afiches se leen igual que antes.
import { DETALLES } from './cursos-detalle.js';

const lista = document.getElementById('lista-cursos');
const ventana = document.getElementById('curso-ventana');

if (lista && ventana && typeof ventana.showModal === 'function') {
  const parte = (id) => document.getElementById(id);
  const crear = (etiqueta, clase, texto) => {
    const nodo = document.createElement(etiqueta);
    nodo.className = clase;
    nodo.textContent = texto;
    return nodo;
  };

  const abrir = (curso, titulo, detalle) => {
    ventana.dataset.tema = curso.dataset.tema;
    parte('ventana-tema').textContent = curso.querySelector('.curso__tema').textContent;
    parte('ventana-titulo').textContent = titulo;
    parte('ventana-texto').textContent = curso.querySelector('.curso__texto').textContent;
    parte('ventana-actividades').replaceChildren(...detalle.actividades.map((a) => crear('li', '', a)));
    parte('ventana-pregunta').textContent = detalle.pregunta;
    const respuesta = parte('ventana-respuesta');
    respuesta.textContent = '';
    const botones = detalle.opciones.map((texto, i) => {
      const boton = crear('button', 'ventana__opcion', texto);
      boton.type = 'button';
      boton.addEventListener('click', () => {
        const bien = i === detalle.correcta;
        botones.forEach((b) => b.removeAttribute('data-resultado'));
        boton.dataset.resultado = bien ? 'bien' : 'mal';
        respuesta.textContent = bien ? `Correcto. ${detalle.explicacion}` : 'Esa no es. Prueba con otra opción.';
      });
      return boton;
    });
    parte('ventana-opciones').replaceChildren(...botones);
    ventana.showModal();
    ventana.scrollTop = 0;
  };

  for (const curso of lista.querySelectorAll('.curso')) {
    const titulo = curso.querySelector('h2').textContent.trim();
    const detalle = DETALLES[titulo];
    if (!detalle) continue;
    const boton = crear('button', 'curso__abrir', 'Abrir curso');
    boton.type = 'button';
    boton.setAttribute('aria-label', `Abrir curso: ${titulo}`);
    boton.addEventListener('click', () => abrir(curso, titulo, detalle));
    curso.append(boton);
  }

  parte('ventana-cerrar').addEventListener('click', () => ventana.close());
  // Un clic en el fondo oscuro (fuera del contenido) también cierra.
  ventana.addEventListener('click', (e) => { if (e.target === ventana) ventana.close(); });
}
