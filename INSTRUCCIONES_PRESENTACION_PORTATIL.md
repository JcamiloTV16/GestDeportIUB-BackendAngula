# 🏅 Guía de Despliegue y Presentación en Portátil - GestDeportIUB

Esta guía contiene todos los pasos necesarios para configurar y encender el ecosistema completo de **GestDeportIUB** (Aplicación Web + Backend API + Asistente Virtual de Telegram con Inteligencia Artificial) en el portátil para la presentación.

---

## ☁️ Información Clave de Arquitectura
- **Base de Datos:** Está alojada en la nube (**Neon PostgreSQL**). **NO** es necesario instalar PostgreSQL localmente.
- **Sin Conflictos de Puertos:** 
  - 🌐 Frontend Angular: Puerto `4200`
  - 🐍 Backend API Web: Puerto `8000`
  - 🤖 Bot de Telegram: Conexión HTTPS directa a Telegram (no ocupa puertos locales).

---

## 📦 FASE 1: Transferencia de Archivos (Hoy)

1. Copia la carpeta del proyecto `GestDeportIUB-BackendAngula-main` en una memoria USB o descarga el ZIP.
2. Pégala en el portátil (ejemplo: en `Escritorio` o `Descargas`).
3. **Verifica que dentro de `backend-python/` se encuentren:**
   - 📄 `bot.py` (Script del Asistente con IA y conexión a Neon DB).
   - 📁 `docs/` (Carpeta con los 8 PDFs oficiales de reglamentos y protocolos).
   - 📄 `requirements.txt` (Dependencias del backend).

---

## ⚙️ FASE 2: Instalación de Dependencias (Se hace una sola vez)

Abre una terminal **PowerShell** en el portátil y ejecuta los siguientes comandos:

### 1. Instalar librerías del Asistente de IA y Telegram:
```powershell
pip install pyTelegramBotAPI groq psycopg2-binary pypdf
```

### 2. Instalar dependencias del Backend Web:
```powershell
cd GestDeportIUB-BackendAngula-main\backend-python
pip install -r requirements.txt
```

### 3. Instalar dependencias del Frontend Angular:
```powershell
cd ..\frontend
npm install
```

---

## 🚀 FASE 3: El Día de la Presentación (Encender 3 Terminales)

El día de la muestra, abre **3 pestañas de terminal**:

### 🔹 Terminal 1: Backend API Web (Puerto 8000)
Ubicación: `GestDeportIUB-BackendAngula-main\backend-python`
```powershell
uvicorn main:app --reload --port 8000
```
> *(O el comando habitual con el que arranquen su API de Python).*

---

### 🔹 Terminal 2: Frontend Angular (Puerto 4200)
Ubicación: `GestDeportIUB-BackendAngula-main\frontend`
```powershell
ng serve
```
> 🌐 Abre el navegador en: **`http://localhost:4200`** para interactuar con la plataforma web.

---

### 🔹 Terminal 3: Asistente Virtual de Telegram (Con IA y RAG)
Ubicación: `GestDeportIUB-BackendAngula-main\backend-python`
```powershell
python bot.py
```
> 📱 Verás en la consola:
> `🚀 Bot de Telegram GestDeportIUB Iniciado con Éxito`
> `📱 Usuario de Telegram: @gestdeport_iub_bot`

---

## 🏆 FASE 4: Guión para la Demostración en Vivo

Durante la sustentación ante el docente o jurados:

### 1. Demostración Web Principal:
- Muestra el login, panel de administración y gestión de torneos en `http://localhost:4200`.

### 2. Demostración del Asistente de IA en Telegram:
- Indícale al profesor que abra Telegram en su celular y busque: **`@gestdeport_iub_bot`** (o enlace: `https://t.me/gestdeport_iub_bot`).
- El profesor le da clic a **"Iniciar"** y puede hacerle preguntas en lenguaje natural:

#### 📊 Consultas a Base de Datos en Vivo (Neon PostgreSQL):
- *"¿Cuáles torneos están activos actualmente y dónde se juegan?"*  
  *(Respuesta: Liga de Fútbol, Abierto de Ajedrez, Torneo de Baloncesto con sedes y fechas).*
- *"¿Quiénes son los máximos goleadores registrados?"*  
  *(Respuesta: René Higuita con 5 goles, Mariana Pajón con 4 goles, Carlos Valderrama con 3 goles).*
- *"¿Cuántos deportistas hay registrados en la institución?"*

#### 📜 Consultas a Reglamentos Oficiales (RAG sobre PDFs):
- *"¿Qué sanciones se aplican por tarjeta roja directa en fútbol?"*  
  *(Respuesta: Expulsión inmediata del partido y suspensión para el siguiente juego según el reglamento oficial).*
- *"¿Qué función tiene el Líbero en voleibol y por qué usa otro uniforme?"*  
  *(Respuesta: Especialista defensivo, prohibido rematar/bloquear, uniforme contrastante).*
- *"¿Qué protocolo de primeros auxilios se sigue si un estudiante se lesiona en un entrenamiento?"*  
  *(Respuesta: Estabilización, reporte a enfermería, no mover al lesionado e informe oficial).*

---

## 🖥️ FASE 5 (OPCIONAL): Demostración en Open WebUI + MCP Toolbox

Si los profesores piden ver específicamente la interfaz gráfica web de **Open WebUI** con la arquitectura **MCP Toolbox**:

### 📁 Archivos a copiar en la memoria USB:
Copia la carpeta completa **`C:\asistente-bd\`** que contiene:
- `toolbox.exe` (Servidor MCP de Base de Datos).
- `tools.yaml` (Definición de las 11 herramientas SQL).
- Pégala en el portátil en la misma ruta: `C:\asistente-bd\`.

### ⚙️ Instalación en el portátil (una sola vez):
```powershell
pip install mcpo open-webui
```

### 🚀 Para encender Open WebUI (3 terminales):

1. **Terminal A (MCP Toolbox en puerto 5000):**
   ```powershell
   cd C:\asistente-bd
   .\toolbox.exe --tools-file tools.yaml
   ```

2. **Terminal B (Puente mcpo en puerto 8001):**
   ```powershell
   mcpo --port 8001 --api-key "clave-secreta" --server-type "streamable-http" -- http://127.0.0.1:5000/mcp
   ```

3. **Terminal C (Servidor Open WebUI en puerto 8080):**
   ```powershell
   open-webui serve
   ```

> 🌐 Abren en el navegador: **`http://localhost:8080`**  
> - En **Admin ➡️ Integraciones**, aseguran la URL de la herramienta: `http://127.0.0.1:8001/openapi.json` con la clave `clave-secreta`.
> - En **Documentos**, suben los 8 PDFs de `docs/` a la colección `#Reglamentos Deportivos IUB`.

---

## 🛠️ Solución de Problemas Rápidos
- **Si el bot no responde en Telegram:** Revisa que la Terminal 3 siga corriendo `python bot.py` y que el portátil tenga conexión a internet.
- **Si el backend dice puerto ocupado:** Cierra cualquier proceso previo en el puerto 8000 o reinicia la terminal.

