// Corre apenas arranca el job, antes de verificar la ventana de grabacion.
// Vercel Cron (que dispara este workflow via /api/trigger-recording) solo
// garantiza que dispara en algun momento dentro de una hora de margen antes
// del programa, no a un minuto exacto. Asi que si llegamos temprano,
// esperamos aca hasta el horario real de inicio (11:12 ART) para no grabar
// contenido de otra franja horaria por haber arrancado antes de tiempo.
const now = new Date();
const arg = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const minutosActuales = arg.getUTCHours() * 60 + arg.getUTCMinutes();
const segundosActuales = arg.getUTCSeconds();

const TARGET_MINUTOS = 11 * 60 + 12; // 11:12 ART
const TOPE_ESPERA_SEGUNDOS = 100 * 60; // guarda de seguridad: nunca esperar mas de 100 min

let espera = (TARGET_MINUTOS - minutosActuales) * 60 - segundosActuales;
if (espera < 0 || espera > TOPE_ESPERA_SEGUNDOS) espera = 0;

console.log(`espera=${espera}`);
