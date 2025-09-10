// index.js
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import {
  getTorneos,
  getTorneoById,
  insertTorneo,
  updateTorneo,

  getEquiposByTorneo,
  insertEquipo,
  updateEquipoPuntos,

  getPartidosPorFase,
  insertPartido,
  updatePartido,

  generateBracket,
  avanzarGanadorAlSiguiente,

  generateRoundRobin,
  getRoundRobinMatches,

  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,

  getTopJugadores
} from './db.js';

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.status(200).send('OK');
});

/** —————— TORNEOS —————— **/
app.get('/torneos', async (_, res) => {
  const torneos = await getTorneos();
  res.json(torneos);
});

app.get('/torneos/:id', async (req, res) => {
  const torneo = await getTorneoById(Number(req.params.id));
  res.json(torneo);
});

app.post('/torneos', async (req, res) => {
  const { nombre, deporteId, categoriaId, fechaInicio, fechaFin } = req.body;
  const id = await insertTorneo(nombre, deporteId, categoriaId, fechaInicio, fechaFin);
  res.json({ id });
});

app.put('/torneos/:id', async (req, res) => {
  await updateTorneo(Number(req.params.id), req.body);
  res.json({ message: 'Torneo actualizado' });
});

/** —————— EQUIPOS —————— **/
app.get('/torneos/:id/equipos', async (req, res) => {
  const equipos = await getEquiposByTorneo(Number(req.params.id));
  res.json(equipos);
});

app.post('/torneos/:id/equipos', async (req, res) => {
  const { nombre, grupo } = req.body;
  const id = await insertEquipo(nombre, Number(req.params.id), grupo);
  res.json({ id });
});

app.put('/equipos/:id/puntos', async (req, res) => {
  await updateEquipoPuntos(Number(req.params.id), req.body.puntos);
  res.json({ message: 'Puntos actualizados' });
});

/** —————— PARTIDOS —————— **/
// Listar partidos por fase (grupo/cuartos/semifinal/final/roundrobin…)
app.get('/torneos/:id/partidos', async (req, res) => {
  const torneoId = Number(req.params.id);
  const fase     = String(req.query.fase || 'grupo');
  const partidos = await getPartidosPorFase(torneoId, fase);
  res.json(partidos);
});

// Crear nuevo partido (cualquiera de las fases)
app.post('/torneos/:id/partidos', async (req, res) => {
  const torneoId   = Number(req.params.id);
  const { local, visitante, ubicacion, fecha, estado, fase } = req.body;
  const id = await insertPartido(torneoId, local, visitante, ubicacion, fecha, estado, fase);
  res.json({ id });
});

// Actualizar marcador de un partido y propagar ganador
app.put('/partidos/:id', async (req, res) => {
  const partidoId = Number(req.params.id);
  const { golesLocal, golesVisitante, estado } = req.body;
  try {
    // 1. Actualiza marcador
    await updatePartido(partidoId, golesLocal, golesVisitante, estado);
    // 2. Propaga ganador si hay next_match_id
    await avanzarGanadorAlSiguiente(partidoId).catch(e => {
      console.warn('No se propagó ganador:', e.message);
    });
    res.json({ message: 'Partido actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar partido', detail: err.message });
  }
});

/** —————— BRACKET FINAL FOUR —————— **/
// Generar bracket (cuartos→semis→final)
app.post('/torneos/:id/bracket/generate', async (req, res) => {
  try {
    const info = await generateBracket(Number(req.params.id));
    res.json(info);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtener el Bracket
app.get('/torneos/:id/bracket', async (req, res) => {
  const torneoId = Number(req.params.id);
  try {
    const cuartos = await getPartidosPorFase(torneoId, 'cuartos');
    const semifinal = await getPartidosPorFase(torneoId, 'semifinal');
    const final = await getPartidosPorFase(torneoId, 'final');

    const toRound = (title, partidos) => ({
      title,
      seeds: partidos.map(p => ({
        id:   p.id,
        date: p.fecha.toISOString(),
        teams: [
          { name: p.localNombre,     score: p.anotaciones_local },
          { name: p.visitanteNombre, score: p.anotaciones_visitante }
        ]
      }))
    });

    res.json([
      toRound('Cuartos de Final', cuartos),
      toRound('Semifinal', semifinal),
      toRound('Final', final)
    ]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al leer bracket', detail: err.message });
  }
});

/** —————— ROUND-ROBIN (“Final Four” todos-contra-todos) —————— **/
// Generar 6 partidos round-robin
app.post('/torneos/:id/roundrobin/generate', async (req, res) => {
  try {
    const ids = await generateRoundRobin(Number(req.params.id));
    res.json({ created: ids });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Recuperar partidos round-robin
app.get('/torneos/:id/roundrobin', async (req, res) => {
  try {
    const matches = await getRoundRobinMatches(Number(req.params.id));
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'No pude leer round-robin', detail: err.message });
  }
});

/** —————— ADMIN / USUARIOS —————— **/
app.get('/users',    async (_, res) => res.json(await getAllUsers()));
app.get('/users/:id', async (req, res) => res.json(await getUserById(Number(req.params.id))));
app.post('/users',   async (req, res) => {
  const { nombre, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const id   = await createUser(nombre, email, hash, role);
  res.json({ id });
});
app.put('/users/:id',    async (req, res) => { await updateUser(Number(req.params.id), req.body);    res.json({ message: 'Usuario actualizado' }); });
app.delete('/users/:id', async (req, res) => { await deleteUser(Number(req.params.id));                res.json({ message: 'Usuario eliminado'  }); });

// Estadísticas de jugadores
app.get('/estadisticas/jugadores', async (_, res) => {
  try {
    const stats = await getTopJugadores();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas', detail: error.message });
  }
});

// Arranca el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
  console.log(`✔ Health    http://localhost:${PORT}/health`);
});