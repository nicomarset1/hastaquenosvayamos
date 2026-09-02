// Proxy en vivo hacia el stream de DeporTEA (el mismo que usa marpla.com.ar).
// Corre como Edge Function para poder reenviar el audio sin cortes por límite
// de duración, y porque el stream original es http:// (Vercel sirve el sitio
// por https, así que el <audio> del navegador no puede pedirlo directo).
export const config = { runtime: 'edge' };

const STREAM_URL = 'http://173.255.205.241:7278/?type=https';

export default async function handler() {
  try {
    const upstream = await fetch(STREAM_URL, { headers: { 'User-Agent': 'HastaQueNosVayamos/1.0' } });

    if (!upstream.ok || !upstream.body) {
      return new Response('Stream no disponible', { status: 502 });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'audio/mpeg',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new Response('Stream no disponible', { status: 502 });
  }
}
