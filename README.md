# Hasta Que Nos Vayamos

Página web de "Hasta Que Nos Vayamos" (HNV), programa de radio de alumnos de 2° año de Periodismo Deportivo (@deporteamdp), Mar del Plata. Al aire los lunes de 11:15 a 12:15 hs.

## Contenido

- `index.html` — estructura de la página (inicio, en vivo, programas, equipo, contacto)
- `style.css` — estilos, animaciones y paleta del brand kit
- `script.js` — interacciones: menú mobile, scroll-reveal, reproductor en vivo, widget de contacto, listado de programas
- `episodes.json` — lista de programas subidos (se actualiza sola, ver abajo)
- `api/stream.js` — función serverless (Edge) que relee el streaming de DeporTEA/marpla.com.ar en https, para que el reproductor de la página lo pueda pasar sin bloqueo de contenido mixto
- `.github/workflows/record-episode.yml` + `scripts/publish-episode.mjs` — graban el programa en vivo cada lunes y lo publican solos
- `assets/` — logo y elementos gráficos de la marca
- `episodios/` — acá quedan los archivos de audio de cada programa

## Uso

Sitio estático sin build. Para probarlo local, abrí `index.html` en el navegador (el reproductor en vivo y el proxy de `/api/stream` sólo funcionan una vez desplegado en Vercel, porque dependen de la función serverless). Desplegalo directo en Vercel, sin configuración extra: detecta `api/stream.js` solo.

## Grabación y publicación automática de los programas

Cada lunes, un GitHub Action (`.github/workflows/record-episode.yml`):

1. Arranca ~11:10/11:12 hora Argentina, graba el streaming en vivo durante 67 minutos (hasta ~12:17, con margen por si el programa se extiende).
2. Si la grabación salió muy chica (no hubo transmisión esa semana), no publica nada.
3. Si salió bien, guarda el mp3 en `episodios/`, agrega la entrada a `episodes.json` con el título "Programa lunes DD de mes", y hace commit + push solo.
4. Ese push dispara el deploy automático en Vercel — el programa nuevo aparece solo en la sección "Programas".

No depende de detectar el inicio/fin reales del programa (el stream de DeporTEA no lo permite: transmite todo el día y no hay nadie antes ni después de HNV, pero tampoco metadata que diferencie el programa) — por eso el horario es fijo con margen.

**Para probarlo sin esperar a un lunes:** en GitHub → Actions → "Grabar y publicar programa" → Run workflow, completando "duración en segundos" con un valor chico (ej. `30`) para validar todo el flujo (grabar, commit, deploy) en menos de un minuto. Ojo: graba lo que esté sonando en el stream en ese momento, sea o no HNV.

Si el streaming de DeporTEA cambia de dirección, actualizar la URL en `api/stream.js` y en `.github/workflows/record-episode.yml`.

## Cómo sumar un programa a mano

Si alguna vez hace falta cargar un episodio sin pasar por el workflow:

1. Poné el archivo de audio (mp3) dentro de la carpeta `episodios/`.
2. Abrí `episodes.json` y agregá un objeto a la lista, por ejemplo:
   ```json
   { "fecha": "25 AGO", "titulo": "Programa 1", "descripcion": "Actualidad, deporte y música", "archivo": "episodios/2026-08-25.mp3" }
   ```
3. Commit y push. Aparece solo en la sección "Programas".

## Pendiente

- Cargar fotos reales del equipo (hoy son placeholders)
- Confirmar que el primer programa se grabe y publique bien el próximo lunes
