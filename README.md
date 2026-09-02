# Hasta Que Nos Vayamos

Página web de "Hasta Que Nos Vayamos" (HNV), programa de radio de alumnos de 2° año de Periodismo Deportivo (@deporteamdp), Mar del Plata. Al aire los lunes de 11:15 a 12:15 hs.

## Contenido

- `index.html` — estructura de la página (inicio, en vivo, programas, equipo, contacto)
- `style.css` — estilos, animaciones y paleta del brand kit
- `script.js` — interacciones: menú mobile, scroll-reveal, reproductor en vivo, widget de contacto
- `episodes.js` — lista de programas subidos (ver "Cómo sumar un programa" abajo)
- `api/stream.js` — función serverless (Edge) que relee el streaming de DeporTEA/marpla.com.ar en https, para que el reproductor de la página lo pueda pasar sin bloqueo de contenido mixto
- `assets/` — logo y elementos gráficos de la marca
- `episodios/` — acá van los archivos de audio de cada programa

## Uso

Sitio estático sin build. Para probarlo local, abrí `index.html` en el navegador (el reproductor en vivo y el proxy de `/api/stream` sólo funcionan una vez desplegado en Vercel, porque dependen de la función serverless). Desplegalo directo en Vercel, sin configuración extra: detecta `api/stream.js` solo.

## Cómo sumar un programa nuevo

1. Poné el archivo de audio (mp3) del programa dentro de la carpeta `episodios/`.
2. Abrí `episodes.js` y agregá un objeto a la lista `EPISODIOS`, por ejemplo:
   ```js
   { fecha: '25 AGO', titulo: 'Programa 1', descripcion: 'Actualidad, deporte y música', archivo: 'episodios/2026-08-25.mp3' }
   ```
3. Commit y push. Aparece solo en la sección "Programas", no hace falta tocar el HTML.

## Pendiente

- Cargar fotos reales del equipo (hoy son placeholders)
- Sumar el primer programa a `episodes.js` cuando esté grabado
- Completar los links de Facebook, Twitter/X y WhatsApp en Contacto
- Si el streaming de DeporTEA cambia de dirección, actualizar `STREAM_URL` en `api/stream.js`
