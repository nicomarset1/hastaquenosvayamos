// Corre al arrancar el workflow programado de grabacion. Como GitHub Actions
// puede disparar un cron con horas de demora, este chequeo evita grabar (y
// publicar) lo que sea que este sonando en el stream compartido si el job
// arranco fuera de la ventana real del programa, o si hoy ya se publico un
// episodio.
import { readFileSync, existsSync } from 'node:fs';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

// Horario Argentina = UTC-3 todo el año, sin horario de verano.
const now = new Date();
const arg = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const dia = arg.getUTCDate();
const mes = MESES[arg.getUTCMonth()];
const fechaHoy = `${dia} ${mes.slice(0, 3).toUpperCase()}`;
const esLunes = arg.getUTCDay() === 1;

// El programa sale 11:14 a 12:14 ART. Cortamos a las 12:16 (2 min de margen)
// para no arrancar a grabar contenido de otro programa si el job se disparo tarde.
const CORTE_MINUTOS = 12 * 60 + 16;
const minutosActuales = arg.getUTCHours() * 60 + arg.getUTCMinutes();
const segundosRestantes = (CORTE_MINUTOS - minutosActuales) * 60 - arg.getUTCSeconds();

const DURACION_MINIMA = 300; // menos de 5 min de aire no vale la pena grabar/publicar

let yaPublicado = false;
if (existsSync('episodes.json')) {
  const episodios = JSON.parse(readFileSync('episodes.json', 'utf8'));
  yaPublicado = episodios[0]?.fecha === fechaHoy;
}

if (!esLunes) {
  console.log('grabar=false');
  console.log(`motivo=No es lunes (hoy en ARG: ${arg.toISOString().slice(0, 10)})`);
} else if (yaPublicado) {
  console.log('grabar=false');
  console.log(`motivo=Ya hay un episodio publicado con fecha ${fechaHoy}`);
} else if (segundosRestantes < DURACION_MINIMA) {
  console.log('grabar=false');
  console.log(`motivo=Se disparo fuera de la ventana del programa (quedaban ${segundosRestantes}s)`);
} else {
  console.log('grabar=true');
  console.log(`duracion=${segundosRestantes}`);
}
