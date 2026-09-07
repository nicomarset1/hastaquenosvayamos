// Proxy en vivo hacia el stream de DeporTEA (el mismo que usa marpla.com.ar).
// El stream original es http:// (Vercel sirve el sitio por https, asi que el
// <audio> del navegador no puede pedirlo directo por contenido mixto), asi
// que lo reenviamos desde acá.
//
// Esto corre como funcion Node (no Edge): el runtime Edge de Vercel no puede
// hacer fetch a URLs http:// (falla al toque, sin ni siquiera intentar la
// conexion saliente), y este stream no tiene version https. Node si soporta
// fetch a http://.
//
// Como contrapartida, una funcion Node tiene un limite de duracion maximo
// (maxDuration en vercel.json), asi que no puede sostener una sola conexion
// durante la hora completa del programa. El reproductor (script.js) se
// reconecta solo antes de que el limite corte la conexion, asi el oyente no
// tiene que tocar play de nuevo.
export const config = { runtime: 'nodejs' };

const STREAM_URL = 'http://173.255.205.241:7278/?type=https';

export default async function handler(req, res) {
  try {
    const upstream = await fetch(STREAM_URL, {
      headers: { 'User-Agent': 'HastaQueNosVayamos/1.0', 'Icy-MetaData': '0' },
    });

    if (!upstream.ok || !upstream.body) {
      res.status(502).send('Stream no disponible');
      return;
    }

    res.writeHead(200, {
      'Content-Type': upstream.headers.get('content-type') || 'audio/mpeg',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    });

    for await (const chunk of upstream.body) {
      res.write(chunk);
    }
    res.end();
  } catch {
    if (!res.headersSent) {
      res.status(502).send('Stream no disponible');
    } else {
      res.end();
    }
  }
}
