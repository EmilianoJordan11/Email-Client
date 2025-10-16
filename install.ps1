# Script de Instalación Rápida - Cliente de Correo

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Cliente de Correo - Instalación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js no está instalado" -ForegroundColor Red
    Write-Host "  Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
Write-Host "Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Instalando dependencias del backend..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencias del backend instaladas" -ForegroundColor Green
} else {
    Write-Host "✗ Error al instalar dependencias del backend" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencias del frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "✗ Error al instalar dependencias del frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "Configurando archivo .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✓ Archivo .env creado desde .env.example" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANTE: Edita el archivo .env con tus credenciales" -ForegroundColor Red
    Write-Host "  1. Abre el archivo .env" -ForegroundColor Yellow
    Write-Host "  2. Configura tu EMAIL_USER y EMAIL_PASSWORD" -ForegroundColor Yellow
    Write-Host "  3. Para Gmail, usa una contraseña de aplicación" -ForegroundColor Yellow
} else {
    Write-Host "! El archivo .env ya existe, no se sobrescribirá" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✓ Instalación Completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Cyan
Write-Host "  1. Edita el archivo .env con tus credenciales" -ForegroundColor White
Write-Host "  2. Ejecuta: npm run dev-all" -ForegroundColor White
Write-Host "  3. Abre http://localhost:3000 en tu navegador" -ForegroundColor White
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Cyan
Write-Host "  npm run dev-all  - Inicia backend y frontend" -ForegroundColor White
Write-Host "  npm run dev      - Solo backend (puerto 5000)" -ForegroundColor White
Write-Host "  npm run client   - Solo frontend (puerto 3000)" -ForegroundColor White
Write-Host ""
Write-Host "Para más información, consulta el archivo README.md" -ForegroundColor Yellow
Write-Host ""
