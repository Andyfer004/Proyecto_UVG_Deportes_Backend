# Sistema de Gestión Deportiva UVG

## 📋 Descripción

Sistema de gestión de torneos deportivos desarrollado para la Universidad del Valle de Guatemala. Permite administrar torneos, equipos, jugadores, partidos y estadísticas de manera eficiente y organizada.

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas

```
Proyecto_UVG_Deportes_Backend/
├── src/
│   ├── index.js      # Servidor Express y rutas API
│   ├── db.js         # Funciones de base de datos
│   └── conn.js       # Configuración de conexión DB
├── schema.sql        # Esquema de base de datos
├── Dockerfile        # Configuración Docker para MySQL
├── package.json      # Dependencias y scripts
└── README.md         # Documentación
```

### Tecnologías Utilizadas

- **Backend**: Node.js con Express.js
- **Base de Datos**: MySQL 8.0
- **Contenedorización**: Docker
- **Autenticación**: bcryptjs para hash de contraseñas
- **CORS**: Habilitado para desarrollo frontend

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v16 o superior)
- Docker y Docker Compose
- Git

### Opción 1: Instalación con Docker (Recomendada)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Andyfer004/Proyecto_UVG_Deportes_Backend.git
   cd Proyecto_UVG_Deportes_Backend
   ```

2. **Levantar la base de datos con Docker**
   ```bash
   # Construir y ejecutar el contenedor MySQL
   docker build -t deportes-mysql .
   docker run -d --name deportes-db -p 3306:3306 deportes-mysql
   ```

3. **Instalar dependencias del backend**
   ```bash
   npm install
   ```

4. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env (opcional, las credenciales están hardcodeadas)
   echo "DB_HOST=localhost
   DB_USER=Admin
   DB_PASSWORD=Admin
   DB_NAME=deportes
   PORT=3000" > .env
   ```

5. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

### Opción 2: Instalación Manual

1. **Instalar MySQL localmente**
   ```bash
   # En Ubuntu/Debian
   sudo apt update
   sudo apt install mysql-server
   
   # En Arch Linux
   sudo pacman -S mysql
   ```

2. **Configurar MySQL**
   ```bash
   sudo mysql_secure_installation
   mysql -u root -p < schema.sql
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Ejecutar la aplicación**
   ```bash
   npm start
   ```

## 📊 API Endpoints

### Base URL
```
http://localhost:3000
```

### Torneos

| Método | Endpoint | Descripción | Body (POST/PUT) |
|--------|----------|-------------|-----------------|
| GET | `/torneos` | Obtener todos los torneos | - |
| GET | `/torneos/:id` | Obtener un torneo específico | - |
| POST | `/torneos` | Crear un nuevo torneo | `{nombre, deporteId, categoriaId, fechaInicio, fechaFin}` |
| PUT | `/torneos/:id` | Actualizar un torneo | `{nombre, deporteId, categoriaId, fechaInicio, fechaFin}` |

### Equipos

| Método | Endpoint | Descripción | Body (POST/PUT) |
|--------|----------|-------------|-----------------|
| GET | `/torneos/:id/equipos` | Obtener equipos de un torneo | - |
| POST | `/torneos/:id/equipos` | Crear equipo en un torneo | `{nombre, grupo}` |
| PUT | `/equipos/:id/puntos` | Actualizar puntos de equipo | `{puntos}` |

### Partidos

| Método | Endpoint | Descripción | Body (POST/PUT) |
|--------|----------|-------------|-----------------|
| GET | `/torneos/:id/partidos?fase=grupo` | Obtener partidos por fase | - |
| POST | `/torneos/:id/partidos` | Crear nuevo partido | `{local, visitante, ubicacion, fecha, estado, fase}` |
| PUT | `/partidos/:id` | Actualizar marcador | `{golesLocal, golesVisitante, estado}` |

### Bracket (Eliminación Directa)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/torneos/:id/bracket/generate` | Generar bracket cuartos→semis→final |
| GET | `/torneos/:id/bracket` | Obtener bracket completo |

### Round Robin

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/torneos/:id/roundrobin/generate` | Generar partidos round-robin |
| GET | `/torneos/:id/roundrobin` | Obtener partidos round-robin |

### Usuarios (Admin)

| Método | Endpoint | Descripción | Body (POST/PUT) |
|--------|----------|-------------|-----------------|
| GET | `/users` | Obtener todos los usuarios | - |
| GET | `/users/:id` | Obtener usuario específico | - |
| POST | `/users` | Crear usuario | `{nombre, email, password, role}` |
| PUT | `/users/:id` | Actualizar usuario | `{nombre, email, role}` |
| DELETE | `/users/:id` | Eliminar usuario | - |

### Estadísticas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/estadisticas/jugadores` | Top goleador y jugador con más tarjetas |

### Utilidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check del servidor |

## 🎯 Ejemplos de Uso

### Crear un Torneo

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

### Agregar Equipos

```bash
curl -X POST http://localhost:3000/torneos/1/equipos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Los Tigres",
    "grupo": "A"
  }'
```

### Crear Partido

```bash
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
```

### Actualizar Marcador

```bash
curl -X PUT http://localhost:3000/partidos/1 \
  -H "Content-Type: application/json" \
  -d '{
    "golesLocal": 2,
    "golesVisitante": 1,
    "estado": "finalizado"
  }'
```

### Generar Bracket

```bash
curl -X POST http://localhost:3000/torneos/1/bracket/generate
```

### Obtener Estadísticas

```bash
curl http://localhost:3000/estadisticas/jugadores
```

## 🗄️ Base de Datos

### Tablas Principales

- **Torneos**: Información de torneos
- **Equipos**: Equipos participantes con estadísticas
- **Jugadores**: Jugadores de cada equipo
- **Partidos**: Registro de partidos y resultados
- **HistorialMejoresEquipos**: Historial de mejores equipos por semana
- **torneo_has_equipos**: Relación muchos a muchos entre torneos y equipos

### Credenciales de Base de Datos

- **Host**: localhost (o IP del contenedor Docker)
- **Puerto**: 3306
- **Base de datos**: deportes
- **Usuario**: Admin
- **Contraseña**: Admin

## 🐳 Docker

### Comandos Útiles

```bash
# Construir imagen
docker build -t deportes-mysql .

# Ejecutar contenedor
docker run -d --name deportes-db -p 3306:3306 deportes-mysql

# Ver logs del contenedor
docker logs deportes-db

# Detener contenedor
docker stop deportes-db

# Eliminar contenedor
docker rm deportes-db

# Acceder a MySQL dentro del contenedor
docker exec -it deportes-db mysql -u Admin -p
```

### Variables de Entorno del Contenedor

- `MYSQL_DATABASE=deportes`
- `MYSQL_ROOT_PASSWORD=Admin`
- `MYSQL_USER=Admin`
- `MYSQL_PASSWORD=Admin`

## 🔧 Desarrollo

### Scripts Disponibles

```bash
npm start          # Iniciar servidor con nodemon
npm test           # Ejecutar tests (pendiente de implementar)
```

### Estructura del Código

- **`src/index.js`**: Servidor Express, middleware y rutas
- **`src/db.js`**: Funciones de acceso a base de datos
- **`src/conn.js`**: Configuración de conexión MySQL

### Logs y Debugging

El servidor muestra logs en consola incluyendo:
- Puerto de ejecución
- Health check endpoint
- Errores de base de datos
- Operaciones de partidos

## 🚀 Despliegue

### Producción

```bash
# Configurar variables de entorno de producción
export NODE_ENV=production
export PORT=3000

# Instalar dependencias de producción
npm install --production

# Ejecutar
npm start
```

### Docker Compose (Recomendado para producción)

Crear `docker-compose.yml`:

```yaml
version: '3.8'
services:
  db:
    build: .
    environment:
      MYSQL_DATABASE: deportes
      MYSQL_ROOT_PASSWORD: Admin
      MYSQL_USER: Admin
      MYSQL_PASSWORD: Admin
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_USER: Admin
      DB_PASSWORD: Admin
      DB_NAME: deportes

volumes:
  mysql_data:
```

Ejecutar:
```bash
docker-compose up -d
```

## 📈 Monitoreo

### Health Check

```bash
curl http://localhost:3000/health
# Respuesta: OK
```

### Verificar Base de Datos

```bash
# Conectar a MySQL
mysql -h localhost -u Admin -p deportes

# Verificar tablas
SHOW TABLES;

# Verificar datos
SELECT * FROM Torneos;
```

## 🐛 Troubleshooting

### Problemas Comunes

1. **Error de conexión a MySQL**
   ```bash
   # Verificar que el contenedor esté corriendo
   docker ps
   
   # Verificar logs
   docker logs deportes-db
   ```

2. **Puerto 3306 ocupado**
   ```bash
   # Cambiar puerto en docker run
   docker run -d --name deportes-db -p 3307:3306 deportes-mysql
   ```

3. **Error de permisos en MySQL**
   ```bash
   # Reiniciar contenedor
   docker restart deportes-db
   ```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 👥 Autores

- **Andy Fuentes** - [Andyfer004](https://github.com/Andyfer004)
- **Christian Echeverria** - Desarrollador

## 🙏 Agradecimientos

- Universidad del Valle de Guatemala
- Equipo de desarrollo
- Contribuidores del proyecto

---

**Versión**: 1.0.0  
**Última actualización**: 2024  
**Estado**: En desarrollo activo 