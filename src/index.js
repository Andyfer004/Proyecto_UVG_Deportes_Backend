import express from 'express';
import cors from 'cors';
import { getAllEquipos, getAllJugadores, getAllPartidos, getAllTorneos, insertTorneo, insertEquipo, insertJugador, insertPartido, updateEquipoPuntos } from './db.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Endpoints

// Obtener todos los torneos
app.get('/torneos', async (req, res) => {
  try {
    const torneos = await getAllTorneos();
    res.json(torneos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener torneos' });
  }
});

// Obtener todos los equipos
app.get('/equipos', async (req, res) => {
  try {
    const equipos = await getAllEquipos();
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener equipos' });
  }
});

// Obtener todos los jugadores
app.get('/jugadores', async (req, res) => {
  try {
    const jugadores = await getAllJugadores();
    res.json(jugadores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener jugadores' });
  }
});

// Obtener todos los partidos
app.get('/partidos', async (req, res) => {
  try {
    const partidos = await getAllPartidos();
    res.json(partidos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener partidos' });
  }
});

// Insertar un nuevo torneo
app.post('/torneos', async (req, res) => {
  const { nombre, deporte, fechaInicio, fechaFin } = req.body;
  try {
    const torneoId = await insertTorneo(nombre, deporte, fechaInicio, fechaFin);
    res.json({ id: torneoId });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar torneo' });
  }
});

// Insertar un nuevo equipo
app.post('/equipos', async (req, res) => {
  const { nombre, torneoId } = req.body;
  try {
    const equipoId = await insertEquipo(nombre, torneoId);
    res.json({ id: equipoId });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar equipo' });
  }
});

// Insertar un nuevo jugador
app.post('/jugadores', async (req, res) => {
  const { nombre, equipoId, numero } = req.body;
  try {
    const jugadorId = await insertJugador(nombre, equipoId, numero);
    res.json({ id: jugadorId });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar jugador' });
  }
});

// Insertar un nuevo partido
app.post('/partidos', async (req, res) => {
  const { torneoId, local, visitante, ubicacion, fecha, estado } = req.body;
  try {
    const partidoId = await insertPartido(torneoId, local, visitante, ubicacion, fecha, estado);
    res.json({ id: partidoId });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar partido' });
  }
});

// Actualizar puntos de un equipo
app.put('/equipos/:id/puntos', async (req, res) => {
  const { id } = req.params;
  const { puntos } = req.body;
  try {
    await updateEquipoPuntos(id, puntos);
    res.json({ message: 'Puntos actualizados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar puntos del equipo' });
  }
});

app.get('/', (req, res) => {
    res.send('API de torneos');
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
