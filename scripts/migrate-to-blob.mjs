// Uso unico: sube los mp3 que hayan quedado commiteados en /episodios a
// Vercel Blob, actualiza sus URLs en episodes.json y borra los archivos
// locales. Se corre a mano desde el workflow "Migrar audios a Vercel Blob".
import { put } from '@vercel/blob';
import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'node:fs';

const dir = 'episodios';
const files = readdirSync(dir).filter((f) => f.endsWith('.mp3'));

if (files.length === 0) {
  console.log('No hay archivos locales para migrar.');
  process.exit(0);
}

const episodesPath = 'episodes.json';
const episodios = JSON.parse(readFileSync(episodesPath, 'utf8'));

for (const file of files) {
  const localPath = `${dir}/${file}`;
  const buffer = readFileSync(localPath);

  const blob = await put(localPath, buffer, {
    access: 'public',
    contentType: 'audio/mpeg',
    addRandomSuffix: false,
  });

  let matched = false;
  for (const ep of episodios) {
    if (ep.archivo === localPath) {
      ep.archivo = blob.url;
      matched = true;
    }
  }

  unlinkSync(localPath);
  console.log(`${localPath} -> ${blob.url} (${matched ? 'actualizado en episodes.json' : 'sin referencia en episodes.json, revisar a mano'})`);
}

writeFileSync(episodesPath, `${JSON.stringify(episodios, null, 2)}\n`);
