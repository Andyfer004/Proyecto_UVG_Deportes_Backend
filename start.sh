#!/bin/bash

# Script de inicio rápido para Sistema de Gestión Deportiva UVG
echo "🏈 Sistema de Gestión Deportiva UVG"
echo "=================================="

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está disponible
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está disponible. Por favor instala Docker Compose."
    exit 1
fi

echo "🐳 Iniciando servicios con Docker Compose..."

# Detener contenedores existentes si los hay
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

# Construir y levantar servicios
echo "🔨 Construyendo y levantando servicios..."
docker-compose up -d --build

# Esperar a que la base de datos esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 10

# Verificar estado de los servicios
echo "📊 Estado de los servicios:"
docker-compose ps

echo ""
echo "✅ Sistema iniciado correctamente!"
echo ""
echo "🌐 Backend API: http://localhost:3000"
echo "🔍 Health Check: http://localhost:3000/health"
echo "🗄️  Base de datos MySQL: localhost:3306"
echo ""
echo "📚 Para ver logs: docker-compose logs -f"
echo "🛑 Para detener: docker-compose down"
echo ""
echo "🎯 Ejemplos de uso:"
echo "curl http://localhost:3000/health"
echo "curl http://localhost:3000/torneos" 