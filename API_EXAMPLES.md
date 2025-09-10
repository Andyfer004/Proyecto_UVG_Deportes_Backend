# Ejemplos de Uso de la API - Sistema de Gestión Deportiva UVG

## 🚀 Inicio Rápido

### 1. Levantar el sistema
```bash
# Opción 1: Usar el script de inicio
./start.sh

# Opción 2: Usar Docker Compose manualmente
docker-compose up -d
```

### 2. Verificar que todo funciona
```bash
# Health check
curl http://localhost:3000/health

# Listar torneos (debería devolver array vacío inicialmente)
curl http://localhost:3000/torneos
```

## 📋 Ejemplos Completos por Funcionalidad

### Gestión de Torneos

#### Crear un Torneo
```bash
curl -X POST http://localhost:3000/torneos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Torneo de Fútbol 2024",
    "deporteId": 1,
    "categoriaId": 1,
    "fechaInicio": "2024-01-15",
    "fechaFin": "2024-02-15"
  }'
```

**Respuesta esperada:**
```json
{
  "id": 1
}
```

#### Obtener Todos los Torneos
```bash
curl http://localhost:3000/torneos
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "Nombre": "Torneo de Fútbol 2024",
    "Deporte": "Fútbol",
    "fecha_inicio": "2024-01-15",
    "fecha_fin": "2024-02-15"
  }
]
```

#### Obtener Torneo Específico
```bash
curl http://localhost:3000/torneos/1
```

### Gestión de Equipos

#### Agregar Equipos a un Torneo
```bash
# Equipo 1
curl -X POST http://localhost:3000/torneos/1/equipos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Los Tigres",
    "grupo": "A"
  }'

# Equipo 2
curl -X POST http://localhost:3000/torneos/1/equipos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Los Leones",
    "grupo": "A"
  }'

# Equipo 3
curl -X POST http://localhost:3000/torneos/1/equipos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Los Águilas",
    "grupo": "B"
  }'

# Equipo 4
curl -X POST http://localhost:3000/torneos/1/equipos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Los Halcones",
    "grupo": "B"
  }'
```

#### Listar Equipos de un Torneo
```bash
curl http://localhost:3000/torneos/1/equipos
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "Nombre": "Los Tigres",
    "Torneo_id": 1,
    "Grupo": "A",
    "Anotaciones_a": 0,
    "Anotaciones_r": 0,
    "Anotaciones_d": 0,
    "Victorias": 0,
    "Derrotas": 0,
    "Empates": 0,
    "Puntos": 0
  },
  {
    "id": 2,
    "Nombre": "Los Leones",
    "Torneo_id": 1,
    "Grupo": "A",
    "Anotaciones_a": 0,
    "Anotaciones_r": 0,
    "Anotaciones_d": 0,
    "Victorias": 0,
    "Derrotas": 0,
    "Empates": 0,
    "Puntos": 0
  }
]
```

### Gestión de Partidos

#### Crear Partidos de Fase de Grupos
```bash
# Partido 1: Tigres vs Leones
curl -X POST http://localhost:3000/torneos/1/partidos \
  -H "Content-Type: application/json" \
  -d '{
    "local": 1,
    "visitante": 2,
    "ubicacion": "Cancha Central",
    "fecha": "2024-01-20",
    "estado": "programado",
    "fase": "grupo"
  }'

# Partido 2: Águilas vs Halcones
curl -X POST http://localhost:3000/torneos/1/partidos \
  -H "Content-Type: application/json" \
  -d '{
    "local": 3,
    "visitante": 4,
    "ubicacion": "Cancha Norte",
    "fecha": "2024-01-21",
    "estado": "programado",
    "fase": "grupo"
  }'
```

#### Listar Partidos por Fase
```bash
# Partidos de fase de grupos
curl "http://localhost:3000/torneos/1/partidos?fase=grupo"
```

#### Actualizar Marcador de Partido
```bash
curl -X PUT http://localhost:3000/partidos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "golesLocal": 2,
    "golesVisitante": 1,
    "estado": "finalizado"
  }'
```

**Respuesta esperada:**
```json
{
  "message": "Partido actualizado"
}
```

### Generación de Bracket (Eliminación Directa)

#### Generar Bracket Automáticamente
```bash
curl -X POST http://localhost:3000/torneos/1/bracket/generate
```

**Respuesta esperada:**
```json
{
  "message": "Bracket generado correctamente",
  "partidos_creados": 3
}
```

#### Obtener Bracket Completo
```bash
curl http://localhost:3000/torneos/1/bracket
```

**Respuesta esperada:**
```json
[
  {
    "title": "Cuartos de Final",
    "seeds": [
      {
        "id": 3,
        "date": "2024-01-25T00:00:00.000Z",
        "teams": [
          {
            "name": "Los Tigres",
            "score": 0
          },
          {
            "name": "Los Leones",
            "score": 0
          }
        ]
      }
    ]
  },
  {
    "title": "Semifinal",
    "seeds": [
      {
        "id": 4,
        "date": "2024-01-28T00:00:00.000Z",
        "teams": [
          {
            "name": "TBD",
            "score": 0
          },
          {
            "name": "TBD",
            "score": 0
          }
        ]
      }
    ]
  },
  {
    "title": "Final",
    "seeds": [
      {
        "id": 5,
        "date": "2024-02-01T00:00:00.000Z",
        "teams": [
          {
            "name": "TBD",
            "score": 0
          },
          {
            "name": "TBD",
            "score": 0
          }
        ]
      }
    ]
  }
]
```

### Round Robin (Todos contra Todos)

#### Generar Partidos Round Robin
```bash
curl -X POST http://localhost:3000/torneos/1/roundrobin/generate
```

#### Obtener Partidos Round Robin
```bash
curl http://localhost:3000/torneos/1/roundrobin
```

### Gestión de Usuarios

#### Crear Usuario
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@uvg.edu.gt",
    "password": "password123",
    "role": "admin"
  }'
```

#### Listar Usuarios
```bash
curl http://localhost:3000/users
```

### Estadísticas

#### Obtener Top Jugadores
```bash
curl http://localhost:3000/estadisticas/jugadores
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "topGoleador": {
      "carnet": 1,
      "nombre": "Juan Pérez",
      "anotaciones": 5,
      "numero": 10,
      "equipo_nombre": "Los Tigres",
      "torneo_nombre": "Torneo de Fútbol 2024"
    },
    "topAmarillas": {
      "carnet": 2,
      "nombre": "Carlos López",
      "numero": 5,
      "total_amarillas": 2,
      "equipo_nombre": "Los Leones",
      "torneo_nombre": "Torneo de Fútbol 2024"
    }
  },
  "message": "Top jugadores obtenidos correctamente"
}
```

## 🔧 Comandos Útiles para Desarrollo

### Ver Logs en Tiempo Real
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f backend

# Ver logs solo de la base de datos
docker-compose logs -f db
```

### Acceder a la Base de Datos
```bash
# Conectar a MySQL desde el contenedor
docker exec -it deportes-db mysql -u Admin -p deportes

# Ejecutar consultas directamente
docker exec -it deportes-db mysql -u Admin -p deportes -e "SELECT * FROM Torneos;"
```

### Reiniciar Servicios
```bash
# Reiniciar solo el backend
docker-compose restart backend

# Reiniciar solo la base de datos
docker-compose restart db

# Reiniciar todo
docker-compose restart
```

### Limpiar Todo
```bash
# Detener y eliminar contenedores
docker-compose down

# Detener, eliminar contenedores y volúmenes
docker-compose down -v

# Detener, eliminar contenedores, volúmenes e imágenes
docker-compose down -v --rmi all
```

## 🐛 Troubleshooting

### Problema: Error de conexión a la base de datos
```bash
# Verificar que el contenedor esté corriendo
docker ps

# Verificar logs de la base de datos
docker-compose logs db

# Reiniciar la base de datos
docker-compose restart db
```

### Problema: Puerto 3000 ocupado
```bash
# Cambiar puerto en docker-compose.yml
# Cambiar "3000:3000" por "3001:3000"
# Luego ejecutar:
docker-compose up -d
```

### Problema: Cambios en el código no se reflejan
```bash
# Reconstruir la imagen del backend
docker-compose build backend

# Reiniciar el servicio
docker-compose restart backend
```

## 📊 Flujo Completo de Ejemplo

Aquí tienes un flujo completo para crear un torneo, agregar equipos, crear partidos y generar un bracket:

```bash
# 1. Crear torneo
curl -X POST http://localhost:3000/torneos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Torneo Demo", "deporteId": 1, "categoriaId": 1, "fechaInicio": "2024-01-15", "fechaFin": "2024-02-15"}'

# 2. Agregar 4 equipos
for i in {1..4}; do
  curl -X POST http://localhost:3000/torneos/1/equipos \
    -H "Content-Type: application/json" \
    -d "{\"nombre\": \"Equipo $i\", \"grupo\": \"A\"}"
done

# 3. Generar bracket
curl -X POST http://localhost:3000/torneos/1/bracket/generate

# 4. Ver bracket
curl http://localhost:3000/torneos/1/bracket
```

¡Con estos ejemplos deberías poder empezar a usar la API inmediatamente! 