// Dibuja la actividad de un curso y responde al momento. Todo texto entra con textContent.
// Nada de lo que se marca o escribe sale de la página ni se guarda.
import { evaluar, mover } from './cursos-recorrido.js';
import { crear, crearBoton } from './cursos-dom.js';

const alPulsarEnter = (campo, accion) => campo.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Enter') return;
  evento.preventDefault();
  accion();
});

/** Botones de una sola elección: se responde al pulsar. */
function opciones({ curso, idConsigna, responder }) {
  const nodo = crear('div', 'ventana__opciones');
  nodo.setAttribute('role', 'group');
  nodo.setAttribute('aria-labelledby', idConsigna);
  const botones = curso.opciones.map((texto, i) => {
    const boton = crearBoton('ventana__opcion', texto, () => {
      reiniciar();
      boton.dataset.resultado = responder(i) ? 'bien' : 'mal';
      boton.setAttribute('aria-pressed', 'true');
    });
    boton.setAttribute('aria-pressed', 'false');
    return boton;
  });
  function reiniciar() {
    for (const boton of botones) {
      boton.removeAttribute('data-resultado');
      boton.setAttribute('aria-pressed', 'false');
    }
  }
  nodo.append(...botones);
  return { nodos: [nodo], reiniciar, foco: () => botones[0] };
}

/** Casillas: se marcan varias y se comprueba. */
function marcar({ curso, idConsigna, responder, limpiar }) {
  const nodo = crear('fieldset', 'actividad__marcar');
  nodo.setAttribute('aria-labelledby', idConsigna);
  const casillas = curso.opciones.map((texto) => {
    const etiqueta = crear('label', 'casilla');
    const casilla = crear('input');
    casilla.type = 'checkbox';
    casilla.addEventListener('change', limpiar);
    etiqueta.append(casilla, crear('span', '', texto));
    nodo.append(etiqueta);
    return casilla;
  });
  const comprobar = crearBoton('ventana__boton ventana__boton--principal', 'Comprobar', () => {
    responder(casillas.flatMap((casilla, i) => (casilla.checked ? [i] : [])));
  });
  const reiniciar = () => casillas.forEach((casilla) => { casilla.checked = false; });
  return { nodos: [nodo, comprobar], reiniciar, foco: () => casillas[0] };
}

/** Lista que se ordena con los botones Subir y Bajar. */
function orden({ curso, paso, idConsigna, responder, limpiar }) {
  let actual = [...paso.inicio];
  const lista = crear('ol', 'actividad__orden');
  lista.setAttribute('aria-labelledby', idConsigna);
  const aviso = crear('p', 'actividad__aviso');
  aviso.setAttribute('role', 'status');

  const filas = curso.opciones.map((texto, elemento) => {
    const fila = crear('li');
    const botones = crear('span', 'actividad__mover');
    const crearMover = (nombre, delta) => {
      const boton = crearBoton('ventana__boton', nombre, () => cambiar(elemento, delta));
      boton.setAttribute('aria-label', `${nombre}: ${texto}`);
      return boton;
    };
    const subir = crearMover('Subir', -1);
    const bajar = crearMover('Bajar', 1);
    botones.append(subir, bajar);
    fila.append(crear('span', 'actividad__elemento', texto), botones);
    return { fila, subir, bajar };
  });

  function pintar() {
    lista.replaceChildren(...actual.map((elemento) => filas[elemento].fila));
    actual.forEach((elemento, posicion) => {
      filas[elemento].subir.disabled = posicion === 0;
      filas[elemento].bajar.disabled = posicion === actual.length - 1;
    });
  }

  function cambiar(elemento, delta) {
    actual = mover(actual, actual.indexOf(elemento), delta);
    pintar();
    limpiar();
    // El foco sigue al elemento movido; en un extremo pasa al otro botón.
    const { subir, bajar } = filas[elemento];
    const [elegido, otro] = delta < 0 ? [subir, bajar] : [bajar, subir];
    (elegido.disabled ? otro : elegido).focus();
    aviso.textContent = `${curso.opciones[elemento]}: posición ${actual.indexOf(elemento) + 1} de ${actual.length}.`;
  }

  const comprobar = crearBoton('ventana__boton ventana__boton--principal', 'Comprobar orden', () => responder(actual));
  const reiniciar = () => {
    actual = [...paso.inicio];
    aviso.textContent = '';
    pintar();
  };
  pintar();
  return { nodos: [lista, aviso, comprobar], reiniciar, foco: () => lista.querySelector('button:not(:disabled)') };
}

/** Campos escritos (una cantidad o una respuesta breve). Al reintentar se conserva lo escrito. */
function escritos({ campos, textoBoton, responder, limpiar, id }) {
  const entradas = campos.map((campo, i) => {
    const etiqueta = crear('label', 'campo', campo.etiqueta);
    const entrada = crear('input');
    Object.assign(entrada, { type: 'text', id: `${id}-campo-${i}`, autocomplete: 'off', maxLength: 160 });
    if (campo.modo) entrada.inputMode = campo.modo;
    if (campo.ejemplo) entrada.placeholder = `Por ejemplo: ${campo.ejemplo}`;
    entrada.addEventListener('input', limpiar);
    etiqueta.append(entrada);
    return { etiqueta, entrada };
  });
  const enviar = () => responder(entradas.map(({ entrada }) => entrada.value));
  entradas.forEach(({ entrada }) => alPulsarEnter(entrada, enviar));
  const boton = crearBoton('ventana__boton ventana__boton--principal', textoBoton, enviar);
  return {
    nodos: [...entradas.map(({ etiqueta }) => etiqueta), boton],
    reiniciar: () => {},
    foco: () => entradas[0].entrada,
  };
}

const CONTROLES = Object.freeze({
  opciones,
  marcar,
  orden,
  calculo: (datos) => escritos({
    ...datos,
    campos: [{ etiqueta: 'Escribe la cantidad en pesos', modo: 'numeric' }],
    textoBoton: 'Comprobar',
    responder: ([cantidad]) => datos.responder(cantidad),
  }),
  respuesta: (datos) => escritos({ ...datos, campos: datos.paso.campos, textoBoton: 'Revisar mi respuesta' }),
});

/** Nodos de la actividad: consigna, control, resultado y botón para intentar otra vez. */
export function crearActividad(curso, paso, id) {
  const idConsigna = `${id}-consigna`;
  const consigna = crear('div', 'actividad__consigna');
  consigna.id = idConsigna;
  consigna.append(crear('p', '', curso.pregunta));

  const resultado = crear('div', 'actividad__resultado');
  resultado.setAttribute('role', 'status');
  const reintentar = crearBoton('ventana__boton actividad__reintentar', 'Intentar otra vez', () => {
    limpiar();
    control.reiniciar();
    control.foco().focus();
  });
  reintentar.hidden = true;

  function limpiar() {
    resultado.replaceChildren();
    delete resultado.dataset.estado;
    reintentar.hidden = true;
  }

  function responder(respuesta) {
    const bien = evaluar(curso, paso, respuesta);
    resultado.dataset.estado = bien ? 'bien' : 'mal';
    resultado.replaceChildren(
      crear('strong', '', bien ? 'Correcto' : 'Todavía no'),
      crear('p', '', bien ? curso.explicacion : paso.pista),
    );
    reintentar.hidden = false;
    // El resultado y el botón para reintentar quedan a la vista aunque el paso sea largo.
    reintentar.scrollIntoView({ block: 'nearest' });
    return bien;
  }

  const control = CONTROLES[paso.clase]({ curso, paso, id, idConsigna, responder, limpiar });
  const nota = paso.nota ? [crear('p', 'recorrido__nota', paso.nota)] : [];
  return [consigna, ...nota, ...control.nodos, resultado, reintentar];
}
