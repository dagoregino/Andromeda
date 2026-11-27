// Piezas de la ciudad dibujada. Casi todas se apoyan en el punto (x, y) de su base.
import { azar } from '../anim';
import { C, SANS } from '../tema';
import { Recortado } from './Personas';

export const Edificio = ({
  x, y, ancho, alto, color = C.superficie, semilla = 1, luz = 1,
}: Readonly<{ x: number; y: number; ancho: number; alto: number; color?: string; semilla?: number; luz?: number }>) => {
  const columnas = Math.max(1, Math.floor((ancho - 24) / 42));
  const filas = Math.max(1, Math.floor((alto - 30) / 52));
  const margen = (ancho - columnas * 42 + 20) / 2;
  return (
    <g transform={`translate(${x} ${y - alto})`}>
      <rect width={ancho} height={alto} fill={color} />
      <rect width={ancho} height={10} fill="#fff" opacity={0.18} />
      {Array.from({ length: columnas * filas }, (_, i) => {
        const prendida = azar(semilla * 31 + i) > 0.55;
        return (
          <rect
            key={i} x={margen + (i % columnas) * 42} y={26 + Math.floor(i / columnas) * 52} width={22} height={28} rx={3}
            fill={prendida && luz > azar(semilla + i * 7) ? C.amarillo : C.hondo}
            opacity={prendida ? 0.9 : 0.55}
          />
        );
      })}
    </g>
  );
};

export const Horizonte = ({
  y, desde, hasta, semilla = 5, alto = 330, color = C.tramo, luz = 1,
}: Readonly<{ y: number; desde: number; hasta: number; semilla?: number; alto?: number; color?: string; luz?: number }>) => {
  const paso = 190;
  return (
    <g>
      {Array.from({ length: Math.ceil((hasta - desde) / paso) }, (_, i) => (
        <Edificio
          key={i} x={desde + i * paso} y={y} ancho={120 + azar(semilla + i) * 90}
          alto={alto * (0.45 + azar(semilla * 3 + i) * 0.55)} color={color} semilla={semilla + i} luz={luz}
        />
      ))}
    </g>
  );
};

export const Arbol = ({ x, y, escala = 1, vaiven = 0 }: Readonly<{ x: number; y: number; escala?: number; vaiven?: number }>) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0.001, escala)})`}>
    <Recortado>
      <rect x={-13} y={-150} width={26} height={152} rx={8} fill="#8a5a34" />
      <g transform={`rotate(${vaiven} 0 -150)`}>
        <circle cx={-62} cy={-180} r={56} fill={C.verde} />
        <circle cx={60} cy={-186} r={62} fill={C.verde} />
        <circle cx={0} cy={-232} r={76} fill={C.verdeClaro} />
        <circle cx={-8} cy={-176} r={56} fill={C.verdeClaro} />
      </g>
    </Recortado>
  </g>
);

export const Sol = ({ x, y, r, giro, color = C.amarillo }: Readonly<{ x: number; y: number; r: number; giro: number; color?: string }>) => (
  <g transform={`translate(${x} ${y})`}>
    <g transform={`rotate(${giro})`}>
      {Array.from({ length: 14 }, (_, i) => (
        <path key={i} d={`M${r * 1.2} ${-r * 0.11} L${r * (i % 2 ? 1.65 : 2)} 0 L${r * 1.2} ${r * 0.11} Z`} fill={color} transform={`rotate(${(i * 360) / 14})`} />
      ))}
    </g>
    <circle r={r} fill={color} stroke="#fff" strokeWidth={7} />
  </g>
);

export const Bus = ({
  x, y, color = C.amarillo, giro = 0, escala = 1, letrero = '', rampa = 0,
}: Readonly<{ x: number; y: number; color?: string; giro?: number; escala?: number; letrero?: string; rampa?: number }>) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    <Recortado borde={14}>
      <rect x={-230} y={-260} width={460} height={216} rx={38} fill={color} />
      <rect x={-230} y={-120} width={460} height={34} fill={C.azul} />
    </Recortado>
    {[-200, -112, -24, 64].map((vx) => <rect key={vx} x={vx} y={-228} width={72} height={84} rx={12} fill={C.hondo} stroke="#fff" strokeWidth={5} />)}
    <rect x={152} y={-228} width={56} height={174} rx={12} fill={C.hondo} stroke="#fff" strokeWidth={5} />
    {letrero ? (
      <g>
        <rect x={-120} y={-286} width={240} height={42} rx={12} fill={C.oscuro} stroke="#fff" strokeWidth={4} />
        <text x={0} y={-256} textAnchor="middle" fill={C.amarillo} style={{ font: `700 26px ${SANS}` }}>{letrero}</text>
      </g>
    ) : null}
    {rampa > 0 ? <path d={`M210 -54 L${210 + 150 * rampa} ${-54 + 52 * rampa} L${210 + 150 * rampa} ${-40 + 52 * rampa} L210 -40 Z`} fill={C.suave} stroke="#fff" strokeWidth={5} /> : null}
    {[-140, 100].map((rx) => (
      <g key={rx} transform={`translate(${rx} -46) rotate(${giro})`}>
        <circle r={46} fill={C.oscuro} stroke="#fff" strokeWidth={7} />
        <circle r={16} fill={C.suave} />
        <path d="M-14 0H14M0 -14V14" stroke={C.oscuro} strokeWidth={5} />
      </g>
    ))}
  </g>
);

export const Paradero = ({ x, y }: Readonly<{ x: number; y: number }>) => (
  <g transform={`translate(${x} ${y})`}>
    <Recortado>
      <rect x={-190} y={-310} width={380} height={30} rx={10} fill={C.azul} />
      <rect x={-170} y={-290} width={16} height={290} fill={C.suave} />
      <rect x={154} y={-290} width={16} height={290} fill={C.suave} />
      <rect x={-130} y={-84} width={260} height={20} rx={8} fill={C.encima} />
      <circle cx={240} cy={-300} r={44} fill={C.amarillo} />
      <rect x={234} y={-262} width={12} height={262} fill={C.suave} />
    </Recortado>
    <text x={240} y={-285} textAnchor="middle" fill={C.oscuro} style={{ font: `700 42px ${SANS}` }}>B</text>
  </g>
);

export const Puesto = ({ x, y, escala = 1 }: Readonly<{ x: number; y: number; escala?: number }>) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0.001, escala)})`}>
    <Recortado>
      <rect x={-150} y={-300} width={14} height={190} fill={C.suave} />
      <rect x={136} y={-300} width={14} height={190} fill={C.suave} />
      <path d="M-180 -340 H180 L196 -280 H-196 Z" fill={C.rojo} />
      <rect x={-160} y={-130} width={320} height={130} rx={16} fill={C.encima} />
      <rect x={-176} y={-142} width={352} height={26} rx={9} fill={C.amarillo} />
    </Recortado>
    {[-150, -70, 10, 90].map((fx) => <path key={fx} d={`M${fx} -340 h40 l6 60 h-44 Z`} fill={C.amarillo} />)}
    {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={-168 + i * 56} cy={-280} r={28} fill={i % 2 ? C.amarillo : C.rojo} />)}
    {[[-100, C.naranja], [-42, '#e8327d'], [16, C.verdeClaro]].map(([jx, tono]) => (
      <g key={String(jx)} transform={`translate(${jx} -142)`}>
        <rect y={-74} width={44} height={74} rx={10} fill="#fff" opacity={0.9} />
        <rect x={5} y={-56} width={34} height={51} rx={7} fill={String(tono)} />
        <rect x={9} y={-84} width={26} height={12} rx={4} fill={C.oscuro} />
      </g>
    ))}
    <rect x={-110} y={-98} width={220} height={58} rx={12} fill={C.hondo} stroke="#fff" strokeWidth={4} />
    <text x={0} y={-56} textAnchor="middle" fill={C.amarillo} style={{ font: `700 36px ${SANS}`, letterSpacing: '.08em' }}>JUGOS</text>
  </g>
);

export const Estadio = ({ x, y, escala = 1, luz = 1, onda = 0 }: Readonly<{ x: number; y: number; escala?: number; luz?: number; onda?: number }>) => (
  <g transform={`translate(${x} ${y}) scale(${escala})`}>
    {[-330, 330].map((tx) => (
      <g key={tx} transform={`translate(${tx} 0)`}>
        <rect x={-9} y={-470} width={18} height={470} fill={C.suave} />
        <rect x={-58} y={-520} width={116} height={62} rx={10} fill={C.oscuro} stroke="#fff" strokeWidth={5} />
        {[-32, 0, 32].map((lx) => [-503, -477].map((ly) => <circle key={`${lx}-${ly}`} cx={lx} cy={ly} r={10} fill={C.amarillo} opacity={0.35 + luz * 0.65} />))}
      </g>
    ))}
    {[-150, 0, 150].map((fx, i) => (
      <g key={fx} transform={`translate(${fx} -372)`}>
        <rect x={-3} y={-70} width={6} height={90} fill="#fff" />
        <path d={`M3 -70 q26 ${-10 + Math.sin(onda + i) * 9} 58 4 q-26 ${12 + Math.sin(onda + i) * 9} -58 24 Z`} fill={[C.amarillo, C.rojo, C.verdeClaro][i]} />
      </g>
    ))}
    <Recortado>
      <path d="M-370 0 V-250 Q0 -330 370 -250 V0 Z" fill={C.encima} />
      <path d="M-400 -262 Q0 -430 400 -262 L378 -226 Q0 -352 -378 -226 Z" fill={C.blanco} />
    </Recortado>
    <path d="M-364 -214 Q0 -306 364 -214" fill="none" stroke={C.amarillo} strokeWidth={20} />
    {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${-342 + i * 78} 0 v-96 a27 27 0 0 1 54 0 v96 Z`} fill={C.hondo} stroke="#fff" strokeWidth={5} />)}
    <rect x={-150} y={-208} width={300} height={62} rx={14} fill={C.oscuro} stroke="#fff" strokeWidth={5} />
    <text x={0} y={-164} textAnchor="middle" fill={C.blanco} style={{ font: `700 42px ${SANS}`, letterSpacing: '.12em' }}>ESTADIO</text>
  </g>
);

export const Hospital = ({ x, y, energia = 1 }: Readonly<{ x: number; y: number; energia?: number }>) => (
  <g transform={`translate(${x} ${y})`}>
    <Recortado>
      <rect x={-150} y={-280} width={300} height={280} rx={14} fill={C.blanco} />
      <rect x={-44} y={-340} width={88} height={88} rx={14} fill={C.rojo} />
      <rect x={170} y={-130} width={90} height={130} rx={12} fill={C.verde} />
      <rect x={194} y={-150} width={42} height={22} rx={6} fill={C.verde} />
    </Recortado>
    <path d="M-11 -320h22v13h13v22h-13v13h-22v-13h-13v-22h13Z" fill="#fff" />
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-118 + (i % 4) * 66} y={-222 + Math.floor(i / 4) * 66} width={38} height={44} rx={5} fill={energia > azar(i) ? C.amarillo : C.hondo} />)}
    <path d="M222 -108 L194 -62 h22 l-10 40 34 -52 h-22 l12 -34 Z" fill={C.amarillo} />
  </g>
);

export const Escuela = ({ x, y, onda = 0 }: Readonly<{ x: number; y: number; onda?: number }>) => (
  <g transform={`translate(${x} ${y})`}>
    <Recortado>
      <path d="M-170 -210 L0 -320 L170 -210 Z" fill={C.rojo} />
      <rect x={-150} y={-212} width={300} height={212} fill={C.amarillo} />
      <rect x={-38} y={-110} width={76} height={110} rx={36} fill={C.hondo} />
      <rect x={-4} y={-400} width={8} height={90} fill={C.suave} />
      <path d={`M4 -400 q30 ${-12 + Math.sin(onda) * 10} 66 4 q-30 ${12 + Math.sin(onda) * 10} -66 28 Z`} fill={C.verde} />
    </Recortado>
    {[-120, 66].map((vx) => <rect key={vx} x={vx} y={-170} width={54} height={60} rx={8} fill={C.azul} stroke="#fff" strokeWidth={5} />)}
    <circle cx={0} cy={-248} r={26} fill="#fff" />
    <path d="M0 -264v16l11 7" fill="none" stroke={C.oscuro} strokeWidth={5} strokeLinecap="round" />
  </g>
);

export const Cartelera = ({ x, y, avance }: Readonly<{ x: number; y: number; avance: number }>) => (
  <g transform={`translate(${x} ${y})`}>
    <Recortado>
      <rect x={-100} y={-130} width={14} height={130} fill={C.suave} />
      <rect x={86} y={-130} width={14} height={130} fill={C.suave} />
      <rect x={-140} y={-330} width={280} height={210} rx={16} fill={C.hondo} />
    </Recortado>
    <text x={-116} y={-290} fill={C.blanco} style={{ font: `700 26px ${SANS}` }}>Cuentas claras</text>
    {[0.55, 0.85, 0.7, 1].map((v, i) => <rect key={v} x={-110 + i * 62} y={-146 - 110 * v * avance} width={40} height={110 * v * avance} rx={6} fill={[C.amarillo, C.azul, C.rojo, C.verdeClaro][i]} />)}
  </g>
);
