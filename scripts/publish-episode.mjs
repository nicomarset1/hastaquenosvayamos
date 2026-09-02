// Lo corre el workflow de GitHub Actions despues de subir la grabacion a
// Vercel Blob. Agrega la entrada nueva a episodes.json (mas reciente primero).
import { readFileSync, writeFileSync } from 'node:fs';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const archivo = process.argv[2];
if (!archivo) {
  console.error('Uso: node publish-episode.mjs <url-del-audio>');
  process.exit(1);
}

// Fecha en horario Argentina (UTC-3 todo el año, sin horario de verano)
const now = new Date();
const arg = new Date(now.getTime() - 3 * 60 * 60 * 1000);
const dia = arg.getUTCDate();
const mesIndex = arg.getUTCMonth();
const mes = MESES[mesIndex];

const episodesPath = 'episodes.json';
const episodios = JSON.parse(readFileSync(episodesPath, 'utf8'));

episodios.unshift({
  fecha: `${dia} ${mes.slice(0, 3).toUpperCase()}`,
  titulo: `Programa lunes ${dia} de ${mes}`,
  descripcion: '',
  archivo,
});

writeFileSync(episodesPath, `${JSON.stringify(episodios, null, 2)}\n`);
console.log(`Publicado: Programa lunes ${dia} de ${mes} (${archivo})`);
