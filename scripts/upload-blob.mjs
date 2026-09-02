// Sube un archivo de audio a Vercel Blob y devuelve (por stdout) la URL publica.
// Requiere la variable de entorno BLOB_READ_WRITE_TOKEN.
import { put } from '@vercel/blob';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Uso: node upload-blob.mjs <archivo>');
  process.exit(1);
}

const buffer = readFileSync(filePath);
const blob = await put(`episodios/${basename(filePath)}`, buffer, {
  access: 'public',
  contentType: 'audio/mpeg',
  addRandomSuffix: false,
});

console.log(blob.url);
