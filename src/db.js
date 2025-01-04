import conn from './conn.js';

// Obtener todos los torneos
export async function getAllTorneos() {
  try {
    const [rows] = await conn.query('SELECT * FROM Torneos');
    return rows;
  } catch (error) {
    console.error('Error al obtener torneos:', error);
    throw error;
  }
}

// Obtener todos los equipos, incluyendo grupos
export async function getAllEquipos() {
  try {
    const [rows] = await conn.query('SELECT * FROM Equipos');
    return rows;
  } catch (error) {
    console.error('Error al obtener equipos:', error);
    throw error;
  }
}

// Obtener equipos por grupo
export async function getEquiposByGrupo(grupo) {
  try {
    const [rows] = await conn.query('SELECT * FROM Equipos WHERE Grupo = ?', [
      grupo,
    ]);
    return rows;
  } catch (error) {
    console.error(`Error al obtener equipos del grupo ${grupo}:`, error);
    throw error;
  }
}

// Obtener equipos por torneo
export async function getEquiposByTorneo(torneoId) {
  try {
    const [rows] = await conn.query(
      'SELECT * FROM Equipos WHERE Torneo_id = ?',
      [torneoId]
    );
    return rows;
  } catch (error) {
    console.error(`Error al obtener equipos del torneo ${torneoId}:`, error);
    throw error;
  }
}

// Obtener todos los jugadores
export async function getAllJugadores() {
  try {
    const [rows] = await conn.query('SELECT * FROM Jugadores');
    return rows;
  } catch (error) {
    console.error('Error al obtener jugadores:', error);
    throw error;
  }
}

// Obtener todos los partidos
export async function getAllPartidos() {
  try {
    const [rows] = await conn.query('SELECT * FROM Partidos');
    return rows;
  } catch (error) {
    console.error('Error al obtener partidos:', error);
    throw error;
  }
}

// Insertar un nuevo torneo
export async function insertTorneo(nombre, deporte, fechaInicio, fechaFin) {
  try {
    const [result] = await conn.query(
      'INSERT INTO Torneos (Nombre, Deporte, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?)',
      [nombre, deporte, fechaInicio, fechaFin]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error al insertar torneo:', error);
    throw error;
  }
}

// Insertar un nuevo equipo, con grupo opcional
export async function insertEquipo(nombre, torneoId, grupo = null) {
  try {
    const [result] = await conn.query(
      'INSERT INTO Equipos (Nombre, Torneo_id, Grupo) VALUES (?, ?, ?)',
      [nombre, torneoId, grupo]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error al insertar equipo:', error);
    throw error;
  }
}

// Insertar un nuevo jugador
export async function insertJugador(nombre, equipoId, numero) {
  try {
    const [result] = await conn.query(
      'INSERT INTO Jugadores (nombre, equipo_id, número) VALUES (?, ?, ?)',
      [nombre, equipoId, numero]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error al insertar jugador:', error);
    throw error;
  }
}

// Insertar un nuevo partido
export async function insertPartido(
  torneoId,
  local,
  visitante,
  ubicacion,
  fecha,
  estado
) {
  try {
    const [result] = await conn.query(
      'INSERT INTO Partidos (torneo_id, Local, Visitante, ubicacion, Fecha, Estado) VALUES (?, ?, ?, ?, ?, ?)',
      [torneoId, local, visitante, ubicacion, fecha, estado]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error al insertar partido:', error);
    throw error;
  }
}

// Actualizar puntuaciones de un equipo
export async function updateEquipoPuntos(equipoId, puntos) {
  try {
    await conn.query('UPDATE Equipos SET Puntos = ? WHERE id = ?', [
      puntos,
      equipoId,
    ]);
  } catch (error) {
    console.error('Error al actualizar puntos del equipo:', error);
    throw error;
  }
}

// Actualizar grupo de un equipo
export async function updateEquipoGrupo(equipoId, grupo) {
  try {
    await conn.query('UPDATE Equipos SET Grupo = ? WHERE id = ?', [
      grupo,
      equipoId,
    ]);
  } catch (error) {
    console.error(`Error al actualizar el grupo del equipo ${equipoId}:`, error);
    throw error;
  }
}