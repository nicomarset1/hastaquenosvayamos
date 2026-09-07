// Vercel Cron llama esto una vez por semana, en algun momento dentro de una
// hora de margen antes del programa (Vercel Hobby no garantiza el minuto
// exacto, solo que va a caer dentro de la hora programada). Esta funcion
// dispara el workflow de grabacion via la API de GitHub (workflow_dispatch),
// que arranca mucho mas rapido y confiable que el cron nativo de Actions
// (ver record-episode.yml: ese cron nos fallo por 4h30 de demora una vez).
//
// El workflow, ya corriendo, espera solo hasta el horario exacto antes de
// grabar (ver el paso "Esperar el horario exacto" en record-episode.yml),
// asi que no importa en que momento de la hora dispare este cron.
export const config = { runtime: 'nodejs' };

const REPO = 'nicomarset1/hastaquenosvayamos';
const WORKFLOW = 'record-episode.yml';

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    res.status(401).send('No autorizado');
    return;
  }

  const token = process.env.GH_DISPATCH_TOKEN;
  if (!token) {
    res.status(500).send('Falta GH_DISPATCH_TOKEN');
    return;
  }

  const response = await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'User-Agent': 'HastaQueNosVayamos-Cron',
      },
      body: JSON.stringify({ ref: 'main' }),
    },
  );

  if (!response.ok) {
    const detalle = await response.text();
    res.status(502).send(`No se pudo disparar el workflow: ${response.status} ${detalle}`);
    return;
  }

  res.status(200).send('Workflow disparado');
}
