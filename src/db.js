import conn from './conn.js';

/** TORNEOS **/
export async function getTorneos() {
  const [rows] = await conn.query('SELECT * FROM Torneos');
  return rows;
}

export async function getTorneoById(id) {
  const [rows] = await conn.query('SELECT * FROM Torneos WHERE id = ?', [id]);
  return rows[0];
}

export async function insertTorneo(nombre, deporteId, categoriaId, fechaInicio, fechaFin) {
  const [res] = await conn.query(
    `INSERT INTO Torneos (nombre, deporte_id, categoria_id, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?)`,
    [nombre, deporteId, categoriaId, fechaInicio, fechaFin]
  );
  return res.insertId;
}

export async function updateTorneo(id, fields) {
  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  const vals = [...Object.values(fields), id];
  await conn.query(`UPDATE Torneos SET ${sets} WHERE id = ?`, vals);
}

/** EQUIPOS **/
export async function getAllEquipos() {
  const [rows] = await conn.query('SELECT * FROM Equipos');
  return rows;
}

export async function getEquiposByTorneo(torneoId) {
  const [rows] = await conn.query('SELECT * FROM Equipos WHERE torneo_id = ?', [torneoId]);
  return rows;
}

export async function insertEquipo(nombre, torneoId, grupo = null) {
  const [res] = await conn.query(
    `INSERT INTO Equipos (nombre, torneo_id, grupo) VALUES (?, ?, ?)`,
    [nombre, torneoId, grupo]
  );
  return res.insertId;
}

export async function updateEquipoPuntos(id, puntos) {
  await conn.query('UPDATE Equipos SET puntos = ? WHERE id = ?', [puntos, id]);
}

export async function updateEquipoGrupo(id, grupo) {
  await conn.query('UPDATE Equipos SET grupo = ? WHERE id = ?', [grupo, id]);
}

/** JUGADORES **/
export async function getAllJugadores() {
  const [rows] = await conn.query('SELECT * FROM Jugadores');
  return rows;
}

export async function insertJugador(nombre, equipoId, numero) {
  const [res] = await conn.query(
    `INSERT INTO Jugadores (nombre, equipo_id, numero) VALUES (?, ?, ?)`,
    [nombre, equipoId, numero]
  );
  return res.insertId;
}

/** PARTIDOS **/
export async function getAllPartidos() {
  const [rows] = await conn.query('SELECT * FROM Partidos');
  return rows;
}

export async function getPartidosByTorneoAndFase(torneoId, fase) {
  const [rows] = await conn.query(
    `SELECT * FROM Partidos WHERE torneo_id = ? AND fase = ? ORDER BY fecha`,
    [torneoId, fase]
  );
  return rows;
}

export async function insertPartido(torneoId, local, visitante, ubicacion, fecha, estado, fase = 'grupo') {
  const [res] = await conn.query(
    `INSERT INTO Partidos (torneo_id, local, visitante, ubicacion, fecha, estado, fase) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [torneoId, local, visitante, ubicacion, fecha, estado, fase]
  );
  return res.insertId;
}

export async function updatePartido(id, golesLocal, golesVisitante, estado, fecha) {
  await conn.query(
    `UPDATE Partidos SET anotaciones_local = ?, anotaciones_visitante = ?, estado = ? WHERE id = ?`,
    [golesLocal, golesVisitante, estado, id]
  );
  if (fecha) {
    await conn.query('UPDATE Partidos SET fecha = ? WHERE id = ?', [fecha, id]);
  }
}

export async function updatePartidoMarcadorEstado(id, golesLocal, golesVisitante, estado) {
  await conn.query(
    `UPDATE Partidos SET anotaciones_local = ?, anotaciones_visitante = ?, estado = ? WHERE id = ?`,
    [golesLocal, golesVisitante, estado, id]
  );
}

/** BRACKETS Y ROUND ROBIN **/
export async function generateFinal4(torneoId) {
  const [top] = await conn.query(
    `SELECT id FROM Equipos WHERE torneo_id = ? ORDER BY puntos DESC LIMIT 4`,
    [torneoId]
  );
  if (top.length < 4) throw new Error('No hay suficientes equipos');
  const semis = [];
  for (let i = 0; i < 2; i++) {
    const localId = top[i*2].id;
    const visitId = top[i*2+1].id;
    const [r] = await conn.query(
      `INSERT INTO Partidos (torneo_id, local, visitante, ubicacion, fecha, estado, fase) VALUES (?, ?, ?, ?, NOW(), 'programado', 'semifinal')`,
      [torneoId, localId, visitId, `Sede ${i+1}`]
    );
    semis.push(r.insertId);
  }
  const [f] = await conn.query(
    `INSERT INTO Partidos (torneo_id, ubicacion, fecha, estado, fase) VALUES (?, 'Estadio Final', NULL, 'pendiente', 'final')`,
    [torneoId]
  );
  const finalId = f.insertId;
  await conn.query('UPDATE Partidos SET next_match_id = ? WHERE id IN (?, ?)', [finalId, semis[0], semis[1]]);
  return { semifinales: semis, final: finalId };
}

// db.js
// db.js

export async function getPartidosPorFase(torneoId, fase) {
  const [rows] = await conn.query(
    `
    SELECT
      p.id,
      p.fecha,
      p.estado,
      p.fase,
      p.anotaciones_local,
      p.anotaciones_visitante,
      p.ubicacion,
      p.next_match_id,

      -- alias a las columnas originales
      p.local       AS local,
      p.visitante   AS visitante,

      -- y añadimos los nombres
      el.nombre     AS localNombre,
      ev.nombre     AS visitanteNombre

    FROM Partidos p
    LEFT JOIN Equipos el ON p.local     = el.id
    LEFT JOIN Equipos ev ON p.visitante = ev.id
    WHERE p.torneo_id = ? 
      AND p.fase       = ?
    ORDER BY p.fecha, p.id
    `,
    [torneoId, fase]
  );
  return rows;
}2


// db.js

/**
 * Propaga el ganador de un partido al siguiente match (next_match_id).
 * - Lee local, visitante, anotaciones y next_match_id del partido.
 * - Calcula quién ganó (o empates quedan sin propagar).
 * - Busca el partido siguiente y asigna al primer hueco disponible (local o visitante).
 */
export async function avanzarGanadorAlSiguiente(partidoId) {
  // 1) Obtener datos del partido
  const [[p]] = await conn.query(
    `SELECT local, visitante, anotaciones_local, anotaciones_visitante, next_match_id
       FROM Partidos
      WHERE id = ?`,
    [partidoId]
  );
  if (!p || p.next_match_id == null) {
    return null; // nada que propagar
  }

  // 2) Determinar ganador
  let ganadorId = null;
  if (p.anotaciones_local > p.anotaciones_visitante) {
    ganadorId = p.local;
  } else if (p.anotaciones_visitante > p.anotaciones_local) {
    ganadorId = p.visitante;
  } else {
    // empate: podrías lanzar error o no propagar
    return null;
  }

  // 3) Leer la estructura del siguiente partido
  const [[next]] = await conn.query(
    `SELECT id, local, visitante
       FROM Partidos
      WHERE id = ?`,
    [p.next_match_id]
  );
  if (!next) return null;

  // 4) Decidir si va en local o visitante
  const campo = next.local == null ? 'local' 
               : next.visitante == null   ? 'visitante'
               : null;
  if (!campo) return null; // ya estaba completo

  // 5) Actualizar
  await conn.query(
    `UPDATE Partidos
        SET ${campo} = ?
      WHERE id = ?`,
    [ganadorId, next.id]
  );

  return { nextMatchId: next.id, campo, ganadorId };
}


/**
 * Genera 6 partidos de round-robin entre los 4 mejores equipos del torneo.
 * Requiere que exista una función auxiliar getTop4(torneoId): Promise<RawEquipo[]>.
 */
export async function generateRoundRobin(torneoId) {
  // a) Obtener top4
  const top4 = await getTop4(torneoId);
  if (top4.length < 4) {
    throw new Error('No hay 4 equipos finalizados en fase de grupos');
  }

  // b) Definir los 6 emparejamientos
  const pairs = [
    [ top4[0], top4[1] ],  // 1 vs 2
    [ top4[0], top4[2] ],  // 1 vs 3
    [ top4[0], top4[3] ],  // 1 vs 4
    [ top4[1], top4[2] ],  // 2 vs 3
    [ top4[1], top4[3] ],  // 2 vs 4
    [ top4[2], top4[3] ],  // 3 vs 4
  ];

  // c) Insertar y devolver IDs
  const createdIds = [];
  for (const [localEq, visitEq] of pairs) {
    const [res] = await conn.query(
      `INSERT INTO Partidos
         (torneo_id, local, visitante, ubicacion, fecha,
          estado, fase, anotaciones_local, anotaciones_visitante)
       VALUES (?, ?, ?, 'Cancha Principal', NOW(),
               'programado', 'roundrobin', NULL, NULL)`,
      [torneoId, localEq.id, visitEq.id]
    );
    createdIds.push(res.insertId);
  }

  return createdIds;
}

/**
 * Devuelve todos los partidos de fase round-robin de un torneo,
 * con nombres y scores (para mostrar en el frontend).
 */
export async function getRoundRobinMatches(torneoId) {
  const [rows] = await conn.query(
    `
    SELECT
      p.id,
      p.fecha,
      p.estado,
      p.fase,
      p.anotaciones_local,
      p.anotaciones_visitante,
      p.ubicacion,
      p.next_match_id,
      p.local        AS localId,
      e1.nombre      AS localNombre,
      p.visitante    AS visitanteId,
      e2.nombre      AS visitanteNombre
    FROM Partidos p
    JOIN Equipos e1 ON p.local = e1.id
    JOIN Equipos e2 ON p.visitante = e2.id
    WHERE p.torneo_id = ? AND p.fase = 'roundrobin'
    ORDER BY p.fecha, p.id
    `,
    [torneoId]
  );
  return rows;
}


/**
 * Genera automáticamente todo el bracket (cuartos → semis → final)
 * tal como lo tenías antes, usando next_match_id para enlazar rondas.
 */
export async function generateBracket(torneoId) {
  // 1) Leer bracket_size y validar potencia de dos
  const [[{ bracket_size }]] = await conn.query(
    `SELECT bracket_size FROM Torneos WHERE id = ?`,
    [torneoId]
  );
  if (!Number.isInteger(Math.log2(bracket_size))) {
    throw new Error('bracket_size debe ser potencia de dos');
  }

  // 2) Calcular fases
  const allPhases = ['cuartos','semifinal','final'];
  const roundsCount = Math.log2(bracket_size);
  const phases = allPhases.slice(allPhases.length - roundsCount);

  // 3) Tomar mejores equipos de grupos
  const [topTeams] = await conn.query(
    `SELECT id 
       FROM Equipos 
      WHERE torneo_id = ? 
      ORDER BY puntos DESC 
      LIMIT ?`,
    [torneoId, bracket_size]
  );
  const participants = topTeams.map(r => r.id);

  let prevMatchIds = [];
  const bracketInfo = {};

  for (let roundIdx = 0; roundIdx < phases.length; roundIdx++) {
    const fase = phases[roundIdx];
    const matchIds = [];

    if (roundIdx === 0) {
      // Primera ronda (cuartos)
      for (let i = 0; i < participants.length; i += 2) {
        const [res] = await conn.query(
          `INSERT INTO Partidos
             (torneo_id, local, visitante, ubicacion, fecha, estado, fase)
           VALUES (?, ?, ?, ?, NOW(), 'programado', ?)`,
          [torneoId, participants[i], participants[i+1], `Sede ${fase}`, fase]
        );
        matchIds.push(res.insertId);
      }
    } else {
      // Semis/Final: creamos partidos "pendiente" y enlazamos
      for (let i = 0; i < prevMatchIds.length; i += 2) {
        const [res] = await conn.query(
          `INSERT INTO Partidos
             (torneo_id, ubicacion, fecha, estado, fase)
           VALUES (?, ?, NOW(), 'pendiente', ?)`,
          [torneoId, `Sede ${fase}`, fase]
        );
        const mid = res.insertId;
        matchIds.push(mid);

        // Enlazamos los dos partidos previos
        await conn.query(
          `UPDATE Partidos
              SET next_match_id = ?
            WHERE id IN (?, ?)`,
          [mid, prevMatchIds[i], prevMatchIds[i+1]]
        );
      }
    }

    bracketInfo[fase] = matchIds;
    prevMatchIds = matchIds;
  }

  return bracketInfo;  // e.g. { cuartos:[..], semifinal:[..], final:[..] }
}

/** USUARIOS ADMIN **/
export async function getAllUsers() {
  const [rows] = await conn.query('SELECT id, nombre, email, role, created_at FROM Users');
  return rows;
}

export async function getUserById(id) {
  const [rows] = await conn.query('SELECT id, nombre, email, role, created_at FROM Users WHERE id = ?', [id]);
  return rows[0];
}

export async function createUser(nombre, email, passwordHash, role = 'organizador') {
  const [res] = await conn.query(
    `INSERT INTO Users (nombre, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    [nombre, email, passwordHash, role]
  );
  return res.insertId;
}

export async function updateUser(id, fields) {
  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  const vals = [...Object.values(fields), id];
  await conn.query(`UPDATE Users SET ${sets} WHERE id = ?`, vals);
}

export async function deleteUser(id) {
  await conn.query('DELETE FROM Users WHERE id = ?', [id]);
}

/** ESTADÍSTICAS DE JUGADORES **/
export async function getTopJugadores() {
  const [topGoleador] = await conn.query(
    `SELECT j.carnet, j.nombre, j.anotaciones, e.nombre as equipo_nombre FROM Jugadores j JOIN Equipos e ON j.equipo_id = e.id ORDER BY j.anotaciones DESC LIMIT 1`
  );
  const [topAmarillas] = await conn.query(
    `SELECT j.carnet, j.nombre, COUNT(ta.id) as total_amarillas, e.nombre as equipo_nombre FROM Jugadores j JOIN Equipos e ON j.equipo_id = e.id LEFT JOIN TarjetasAmarillas ta ON j.carnet = ta.jugador_carnet GROUP BY j.carnet, j.nombre, e.nombre ORDER BY total_amarillas DESC LIMIT 1`
  );
  return {
    topGoleador: topGoleador[0] || null,
    topAmarillas: topAmarillas[0] || null
  };
}