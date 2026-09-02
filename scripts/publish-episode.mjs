// Lo corre el workflow de GitHub Actions despues de grabar el streaming.
// Si la grabacion salio muy chica (radio apagada esa semana, stream caido),
// no publica nada y borra el archivo para no dejar basura en el repo.
import { readFileSync, writeFileSync, statSync, unlinkSync } from 'node:fs';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const mp3Path = process.argv[2];
if (!mp3Path) {
  console.error('Uso: node publish-episode.mjs <ruta-al-mp3>');
  process.exit(1);
}

const MIN_BYTES = 500 * 1024; // ~500KB de mp3 128kbps son unos 30s de audio real
const stats = statSync(mp3Path);

if (stats.size < MIN_BYTES) {
  console.log(`Archivo muy chico (${stats.size} bytes) — probablemente no hubo transmisión. No se publica.`);
  unlinkSync(mp3Path);
  process.exit(0);
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
  archivo: mp3Path,
});

writeFileSync(episodesPath, `${JSON.stringify(episodios, null, 2)}\n`);
console.log(`Publicado: Programa lunes ${dia} de ${mes} (${mp3Path})`);
