# Hasta Que Nos Vayamos

Página web de "Hasta Que Nos Vayamos" (HNV), programa de radio de alumnos de 2° año de Periodismo que estudian en DeporTEA (@deporteamdp), Mar del Plata. Al aire los lunes de 11:14 a 12:14 hs.

## Contenido

- `index.html` — estructura de la página (inicio, en vivo, programas, equipo, contacto)
- `style.css` — estilos, animaciones y paleta del brand kit
- `script.js` — interacciones: menú mobile, scroll-reveal, reproductor en vivo, widget de contacto, listado de programas
- `episodes.json` — lista de programas subidos (se actualiza sola, ver abajo). Cada `archivo` es una URL de Vercel Blob (o un `url` externo si es un episodio en Spotify)
- `api/stream.js` — función serverless (Edge) que relee el streaming de DeporTEA/marpla.com.ar en https, para que el reproductor de la página lo pueda pasar sin bloqueo de contenido mixto
- `.github/workflows/record-episode.yml` + `scripts/publish-episode.mjs` + `scripts/upload-blob.mjs` — graban el programa en vivo cada lunes, lo suben a Vercel Blob y lo publican solos
- `.github/workflows/migrate-blob.yml` + `scripts/migrate-to-blob.mjs` — herramienta de uso puntual para subir a Blob un mp3 que haya quedado commiteado a mano en `/episodios`
- `assets/` — logo y elementos gráficos de la marca
- `episodios/` — vacía en uso normal; el audio vive en Vercel Blob, no en el repo

## Uso

Sitio estático sin build. Para probarlo local, abrí `index.html` en el navegador (el reproductor en vivo y el proxy de `/api/stream` sólo funcionan una vez desplegado en Vercel, porque dependen de la función serverless). Desplegalo directo en Vercel, sin configuración extra: detecta `api/stream.js` solo.

## Almacenamiento de los audios (Vercel Blob)

Los mp3 de cada programa NO se guardan en git (un archivo de ~65MB por semana haría crecer el repo sin límite). Se suben a **Vercel Blob** y `episodes.json` guarda solo la URL pública.

Configuración (una sola vez):

1. En el proyecto de Vercel: **Storage → Create Database → Blob**, crearlo y conectarlo al proyecto.
2. Eso agrega la variable `BLOB_READ_WRITE_TOKEN` en **Settings → Environment Variables** del proyecto en Vercel — copiar su valor.
3. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**, nombre `BLOB_READ_WRITE_TOKEN`, pegar el mismo valor.

Sin ese secret, el workflow de grabación graba igual pero falla al intentar subir el audio.

## Grabación y publicación automática de los programas

Cada lunes, un GitHub Action (`.github/workflows/record-episode.yml`):

1. Arranca ~11:10/11:12 hora Argentina, graba el streaming en vivo durante 67 minutos (hasta ~12:17, con margen por si el programa se extiende).
2. Si la grabación salió muy chica (no hubo transmisión esa semana), no publica nada.
3. Si salió bien, sube el mp3 a Vercel Blob, agrega la entrada a `episodes.json` con el título "Programa lunes DD de mes" y esa URL, y hace commit + push (solo de `episodes.json`, liviano).
4. Ese push dispara el deploy automático en Vercel — el programa nuevo aparece solo en la sección "Programas".

No depende de detectar el inicio/fin reales del programa (el stream de DeporTEA no lo permite: transmite todo el día y no hay nadie antes ni después de HNV, pero tampoco metadata que diferencie el programa) — por eso el horario es fijo con margen.

**Para probarlo sin esperar a un lunes:** en GitHub → Actions → "Grabar y publicar programa" → Run workflow, completando "duración en segundos" con un valor chico (ej. `30`) para validar todo el flujo (grabar, subir a Blob, commit, deploy) en menos de un minuto. Ojo: graba lo que esté sonando en el stream en ese momento, sea o no HNV.

Si el streaming de DeporTEA cambia de dirección, actualizar la URL en `api/stream.js` y en `.github/workflows/record-episode.yml`.

## Cómo sumar un programa a mano

Si alguna vez hace falta cargar un episodio sin pasar por el workflow automático:

- **Si ya tenés una URL pública del audio** (Vercel Blob, Spotify, lo que sea): abrí `episodes.json` y agregá un objeto a la lista, por ejemplo:
  ```json
  { "fecha": "25 AGO", "titulo": "Programa 1", "descripcion": "", "archivo": "https://xxxx.public.blob.vercel-storage.com/episodios/2026-08-25.mp3" }
  ```
  Para un episodio sin audio propio (por ahora), usá `"url"` en vez de `"archivo"` (aparece como botón "Escuchar en Spotify" — el texto está hardcodeado en `script.js`, cambiarlo ahí si es otra plataforma).
- **Si tenés el mp3 pero no una URL todavía**: ponelo en `episodios/`, agregá la entrada en `episodes.json` apuntando a `episodios/archivo.mp3`, hacé commit y push, y después corré el workflow "Migrar audios a Vercel Blob" para que lo suba y actualice la URL solo.

## Pendiente

- Cargar fotos reales del equipo (hoy son placeholders)
- Confirmar que el primer programa se grabe y publique bien el próximo lunes
