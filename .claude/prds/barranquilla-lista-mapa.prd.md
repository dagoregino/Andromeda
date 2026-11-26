# Barranquilla Lista: mapa para moverse por la ciudad

## Problem
Turistas y habitantes de Barranquilla que quieren desplazarse a un punto específico no tienen a la mano toda la información que necesitan para llegar y saber qué hay cerca. La web actual se ve como una presentación del sprint: describe el plan, pero varias de sus propuestas no se pueden usar como funcionalidad, y los escenarios simulados no son lo que se había pedido.

## Evidence
- Supuesto por validar con pruebas de usuario y entrevistas: la información para desplazarse no está disponible en un solo lugar.
- Observación del equipo: la web actual presenta el plan, pero no deja usarlo.

## Users
- **Primary**: turistas y habitantes que quieren ir a un punto específico y ver qué hay cerca.
- **Secondary**: cualquier otra persona que use la ciudad.
- **Not for**: TBD, por validar con el equipo.

## Hypothesis
We believe **un mapa para elegir un destino, ver lugares filtrables y recibir avisos** will **poner a la mano la información para desplazarse** for **turistas y habitantes**.
We'll know we're right when **4 de cada 5 personas de prueba encuentren un destino y un lugar cercano en menos de 1 minuto, sin ayuda** (meta propuesta, sin confirmar).

## Success Metrics
| Metric | Target | How measured |
|---|---|---|
| Encontrar un destino y un lugar cercano sin ayuda | 4 de 5 personas en menos de 1 minuto (propuesta) | Prueba con usuarios, cronometrada |

## Pilar fundamental: Punto Lista
**La ciudad que te escucha y te responde.**

Proponemos un dispositivo con inteligencia artificial, micrófono, parlante y pantalla, donde **cualquier persona** pueda preguntar y recibir la respuesta hablada y escrita: cómo llegar, qué hay cerca y qué avisos hay, sin necesitar celular propio. El punto debe estar conectado a internet.

Está pensado para habitantes y visitantes de todas las edades. La inclusión viene desde el diseño: la voz ayuda a las personas ciegas y la pantalla, a las personas sordas.

## Scope
**MVP**

| Componente | Lo que puede hacer el usuario |
|---|---|
| C. Moverse fácil y accesible | Elegir un destino y ver cómo llegar. Las rutas de bus se muestran solo cuando el usuario las pide, para no saturar el mapa. Saber si el recorrido es accesible. |
| A. Ciudad fresca y verde | Ver puntos de sombra, agua y descanso cerca del recorrido. |
| E. El Mundial también vende en el barrio | Filtrar lugares de interés según lo que busca: hoteles, sitios turísticos, vendedores, cultura local y otros. |
| B. Ciudad que no se detiene | Ver qué tramos tienen inundación o apagón y evitarlos. |
| D. Ciudad que avisa y responde | Recibir avisos y reportar un problema en un punto. |

Referencia de uso: la aplicación Qruta, sumando puntos de interés cercanos y filtros.

**Out of scope** (propuesta, sin confirmar)
- Cuentas de usuario, pagos y reservas: no hacen falta para probar la hipótesis.
- Datos en tiempo real: no se ha confirmado ninguna fuente.
- Cobertura de todas las rutas de transporte: excede la primera versión.
- F. Legado que se vigila: queda para después.
- G. Escuela de ciudad: queda para después.
- Diagnóstico, causas y efectos, lecciones de otras ciudades y escenarios simulados: salen de la web; la investigación sigue en los documentos del repositorio.

**Restricciones**
- El mapa no debe verse saturado: la información adicional aparece cuando el usuario la pide.
- Todo dato de ejemplo debe estar identificado como tal.
- Las fotografías que se conserven mantienen sus créditos.

## Delivery Milestones
<!-- Business outcomes, not engineering tasks. /plan turns each into a plan. -->
<!-- Status: pending | in-progress | complete -->

| # | Milestone | Outcome | Status | Plan |
|---|---|---|---|---|
| 1 | El mapa es la aplicación | La web deja de ser una presentación: el usuario entra al mapa, elige un destino y ve cómo llegar; las rutas de bus aparecen si las pide | in-progress | .claude/plans/barranquilla-lista-mapa.plan.md |
| 2 | Qué hay cerca | El usuario filtra hoteles, sitios turísticos, comercio local y puntos de sombra, agua y descanso | pending | — |
| 3 | Avisos en el camino | El usuario ve tramos con inundación o apagón, recibe avisos y reporta un problema | pending | — |

## Open Questions
- [ ] ¿Cuándo es la entrega del bootcamp?
- [ ] ¿Bastan datos de ejemplo o se exigen datos reales?
- [ ] ¿"Cómo llegar" debe indicar buses concretos, o basta el recorrido en el mapa y las líneas principales?
- [ ] Quedó incompleta la frase "además en caso que se presente…": ¿se refiere a los avisos de B y D?
- [ ] ¿Qué información de accesibilidad se puede obtener?
- [ ] ¿Quién ve los reportes de los usuarios y qué respuesta reciben?
- [ ] ¿Algo de lo propuesto para retirar lo exige el bootcamp?
- [ ] ¿Se confirman la meta de éxito y la lista de fuera de alcance?

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| No conseguir datos de rutas de bus | TBD | Alto: afecta el hito 1 | Confirmar fuentes antes de planear; si no hay, mostrar pocas rutas de ejemplo identificadas |
| Avisos o datos de ejemplo tomados como reales | Media | Alto: puede llevar a decisiones de desplazamiento erradas | Identificarlos de forma visible |
| Alcance mayor que el tiempo disponible | TBD | Alto | Entregar en el orden de los hitos |
| Reportes sin quién los atienda | Alta en una primera versión | Medio | Decir al usuario qué pasa con su reporte |
| Mapa saturado | Media | Medio | Mostrar capas solo a petición y probar con usuarios |

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan.*
