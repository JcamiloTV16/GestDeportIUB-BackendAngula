# -*- coding: utf-8 -*-
"""
Bot de Telegram Oficial - GestDeportIUB
Asistente Virtual Deportivo con Inteligencia Artificial (Groq Llama 3),
Conexión en Vivo a PostgreSQL (Neon) y RAG sobre Reglamentos en PDF.
"""

import os
import sys
import re
import json
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import telebot
from groq import Groq
import pypdf

# Forzar UTF-8 en consola de Windows
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Configuración de Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Credenciales y Configuración
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

TELEGRAM_TOKEN = os.getenv('TELEGRAM_TOKEN')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
DB_URL = os.getenv('DATABASE_URL', 'postgresql://neondb_owner:npg_wZv7pWo2bULH@ep-wild-sunset-ai2qrg11-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require')

# Inicializar Clientes
bot = telebot.TeleBot(TELEGRAM_TOKEN, parse_mode=None)
groq_client = Groq(api_key=GROQ_API_KEY)

# ==========================================
# 1. MOTOR DE CONSULTAS SQL (NEON POSTGRES)
# ==========================================

def get_db_connection():
    return psycopg2.connect(DB_URL)

def db_contar_deportistas():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT COUNT(*) AS total_deportistas FROM usuarios;")
            return cur.fetchall()

def db_listar_torneos_activos():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT t.nombre, d.nombre AS deporte, t.estado_torneo, t.lugar, t.fecha_inicio, t.fecha_fin
                FROM torneos t
                JOIN deportes d ON t.deporte_id = d.id
                WHERE t.estado_torneo IN ('En Curso', 'Inscripciones Abiertas')
                ORDER BY t.fecha_inicio;
            """)
            return cur.fetchall()

def db_listar_deportes():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT id, nombre FROM deportes ORDER BY nombre;")
            return cur.fetchall()

def db_inscripciones_por_torneo():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT t.nombre AS torneo, t.estado_torneo, COUNT(it.id) AS total_inscritos
                FROM torneos t
                LEFT JOIN inscripciones_torneo it ON t.id = it.torneo_id
                GROUP BY t.nombre, t.estado_torneo
                ORDER BY total_inscritos DESC;
            """)
            return cur.fetchall()

def db_buscar_torneo_por_nombre(nombre: str):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT nombre, descripcion, estado_torneo, lugar, fecha_inicio, fecha_fin, poblacion_objetivo
                FROM torneos
                WHERE nombre ILIKE %s OR translate(nombre, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU') ILIKE %s;
            """, (f'%{nombre}%', f'%{nombre}%'))
            return cur.fetchall()

def db_deportistas_por_deporte():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT d.nombre AS deporte, COUNT(DISTINCT it.estudiante_id) AS deportistas_inscritos
                FROM deportes d
                LEFT JOIN torneos t ON d.id = t.deporte_id
                LEFT JOIN inscripciones_torneo it ON t.id = it.torneo_id
                GROUP BY d.nombre
                ORDER BY deportistas_inscritos DESC;
            """)
            return cur.fetchall()

def db_goleadores_y_anotadores(deporte: str = ''):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT t.nombre AS torneo, d.nombre AS deporte, u.nombre AS deportista,
                       et.tipo_estadistica, (et.valor_json->>'cantidad')::numeric AS cantidad
                FROM estadisticas_torneo et
                JOIN torneos t ON et.torneo_id = t.id
                JOIN deportes d ON t.deporte_id = d.id
                LEFT JOIN usuarios u ON et.usuario_id = u.id
                WHERE et.tipo_estadistica IN ('Goles', 'Asistencias', 'Puntos', 'Rebotes', 'Tiempo Final')
                  AND (%s = '' OR d.nombre ILIKE %s OR translate(d.nombre, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU') ILIKE %s)
                ORDER BY et.tipo_estadistica, cantidad DESC;
            """, (deporte, f'%{deporte}%', f'%{deporte}%'))
            return cur.fetchall()

def db_torneos_por_escenario(lugar: str):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT nombre, estado_torneo, lugar, fecha_inicio, fecha_fin, poblacion_objetivo
                FROM torneos
                WHERE lugar ILIKE %s OR translate(lugar, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU') ILIKE %s;
            """, (f'%{lugar}%', f'%{lugar}%'))
            return cur.fetchall()

def db_torneos_por_poblacion(publico: str):
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT nombre, estado_torneo, lugar, fecha_inicio, fecha_fin, poblacion_objetivo
                FROM torneos
                WHERE poblacion_objetivo ILIKE %s OR translate(poblacion_objetivo, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU') ILIKE %s;
            """, (f'%{publico}%', f'%{publico}%'))
            return cur.fetchall()

def db_historial_torneos_finalizados():
    with get_db_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT t.nombre AS torneo, d.nombre AS deporte, t.lugar, t.fecha_fin
                FROM torneos t
                JOIN deportes d ON t.deporte_id = d.id
                WHERE t.estado_torneo = 'Finalizado'
                ORDER BY t.fecha_fin DESC LIMIT 10;
            """)
            return cur.fetchall()

# ==========================================
# 2. MOTOR RAG SOBRE DOCUMENTOS PDF (DOCS/)
# ==========================================

DOCS_DIR = os.path.join(os.path.dirname(__file__), 'docs')
PDF_CHUNKS = []

def index_pdf_documents():
    global PDF_CHUNKS
    PDF_CHUNKS = []
    if not os.path.exists(DOCS_DIR):
        logging.warning('Directorio docs/ no encontrado.')
        return
    for fname in os.listdir(DOCS_DIR):
        if fname.endswith('.pdf'):
            fpath = os.path.join(DOCS_DIR, fname)
            try:
                reader = pypdf.PdfReader(fpath)
                for page_num, page in enumerate(reader.pages):
                    text = page.extract_text() or ''
                    if len(text.strip()) > 30:
                        PDF_CHUNKS.append({
                            'doc': fname,
                            'page': page_num + 1,
                            'text': text
                        })
            except Exception as e:
                logging.error(f'Error leyendo {fname}: {e}')
    logging.info(f'Indexados {len(PDF_CHUNKS)} fragmentos de documentos PDF.')

index_pdf_documents()

def search_pdf_documents(query: str, top_k: int = 3):
    words = re.findall(r'\w+', query.lower())
    if not words:
        return []
    scored = []
    for chunk in PDF_CHUNKS:
        score = sum(chunk['text'].lower().count(w) for w in words if len(w) > 3)
        if score > 0:
            scored.append((score, chunk))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item[1] for item in scored[:top_k]]

# ==========================================
# 3. HERRAMIENTAS PARA EL LLM (GROQ TOOLS)
# ==========================================

TOOLS_SCHEMA = [
    {
        'type': 'function',
        'function': {
            'name': 'contar_deportistas',
            'description': 'Cuenta el total de usuarios o deportistas registrados en el sistema',
            'parameters': {'type': 'object', 'properties': {}, 'required': []}
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'listar_torneos_activos',
            'description': 'Muestra todos los torneos activos o en curso actualmente',
            'parameters': {'type': 'object', 'properties': {}, 'required': []}
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'listar_deportes',
            'description': 'Lista todas las disciplinas y deportes disponibles en la universidad',
            'parameters': {'type': 'object', 'properties': {}, 'required': []}
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'inscripciones_por_torneo',
            'description': 'Calcula la cantidad de participantes inscritos por cada torneo activo',
            'parameters': {'type': 'object', 'properties': {}, 'required': []}
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'buscar_torneo_por_nombre',
            'description': 'Busca un torneo específico por nombre o palabra clave',
            'parameters': {
                'type': 'object',
                'properties': {
                    'nombre': {'type': 'string', 'description': 'Nombre del torneo a buscar'}
                },
                'required': ['nombre']
            }
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'deportistas_por_deporte',
            'description': 'Muestra la cantidad de deportistas inscritos agrupados por deporte',
            'parameters': {'type': 'object', 'properties': {}, 'required': []}
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'goleadores_y_anotadores',
            'description': 'Muestra goleadores de fútbol, anotadores de baloncesto o marcas de tiempo',
            'parameters': {
                'type': 'object',
                'properties': {
                    'deporte': {'type': 'string', 'description': 'Opcional. Deporte como Futbol, Baloncesto, Atletismo'}
                },
                'required': []
            }
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'torneos_por_escenario',
            'description': 'Filtra torneos por cancha, coliseo, pista o lugar',
            'parameters': {
                'type': 'object',
                'properties': {
                    'lugar': {'type': 'string', 'description': 'Nombre del lugar (Coliseo, Cancha, Pista)'}
                },
                'required': ['lugar']
            }
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'torneos_por_poblacion',
            'description': 'Filtra torneos por público objetivo (Estudiantes, Funcionarios, Docentes, Todos)',
            'parameters': {
                'type': 'object',
                'properties': {
                    'publico': {'type': 'string', 'description': 'Público objetivo'}
                },
                'required': ['publico']
            }
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'historial_torneos_finalizados',
            'description': 'Muestra los torneos que finalizaron en años anteriores',
            'parameters': {'type': 'object', 'properties': {}, 'required': []}
        }
    },
    {
        'type': 'function',
        'function': {
            'name': 'consultar_reglamentos_pdf',
            'description': 'Busca en los 8 reglamentos y manuales oficiales en PDF (reglas de juego, sanciones, indumentaria, protocolos de seguridad, primeros auxilios, atención al usuario, derechos y deberes)',
            'parameters': {
                'type': 'object',
                'properties': {
                    'tema': {'type': 'string', 'description': 'Tema o norma a consultar'}
                },
                'required': ['tema']
            }
        }
    }
]

def execute_tool(tool_name: str, args: dict):
    try:
        if tool_name == 'contar_deportistas':
            return db_contar_deportistas()
        elif tool_name == 'listar_torneos_activos':
            return db_listar_torneos_activos()
        elif tool_name == 'listar_deportes':
            return db_listar_deportes()
        elif tool_name == 'inscripciones_por_torneo':
            return db_inscripciones_por_torneo()
        elif tool_name == 'buscar_torneo_por_nombre':
            return db_buscar_torneo_por_nombre(args.get('nombre', ''))
        elif tool_name == 'deportistas_por_deporte':
            return db_deportistas_por_deporte()
        elif tool_name == 'goleadores_y_anotadores':
            return db_goleadores_y_anotadores(args.get('deporte', ''))
        elif tool_name == 'torneos_por_escenario':
            return db_torneos_por_escenario(args.get('lugar', ''))
        elif tool_name == 'torneos_por_poblacion':
            return db_torneos_por_poblacion(args.get('publico', ''))
        elif tool_name == 'historial_torneos_finalizados':
            return db_historial_torneos_finalizados()
        elif tool_name == 'consultar_reglamentos_pdf':
            chunks = search_pdf_documents(args.get('tema', ''))
            return [{'documento': c['doc'], 'pagina': c['page'], 'texto': c['text'][:800]} for c in chunks]
        else:
            return {'error': 'Herramienta desconocida'}
    except Exception as e:
        logging.error(f'Error ejecutando herramienta {tool_name}: {e}')
        return {'error': str(e)}

# ==========================================
# 4. ORQUESTADOR DE CHAT CON IA
# ==========================================

SYSTEM_PROMPT = """Eres el asistente virtual oficial del sistema deportivo GestDeportIUB de la Institución Universitaria de Barranquilla (IUB).
Tu misión es atender con calidez, claridad y profesionalismo a estudiantes, docentes y funcionarios.
Tienes dos fuentes de información:
1. Base de datos en vivo (Neon PostgreSQL): Para consultar deportistas, torneos activos, inscritos, estadísticas de goleadores y sedes.
2. Reglamentos y Manuales Oficiales en PDF: Para explicar reglas de juego, sanciones por tarjetas, protocolos de seguridad, primeros auxilios, indumentaria y derechos estudiantiles.

Instrucciones:
- Siempre responde en español amigable, elegante, bien estructurado con emojis apropiados y formato limpio.
- Si una consulta no arroja resultados, explica con amabilidad que no se encontraron registros de ese tema en la IUB.
- Nunca muestres código JSON crudo ni errores técnicos al usuario."""

USER_CONVERSATIONS = {}

def process_user_query(chat_id: int, user_text: str):
    history = USER_CONVERSATIONS.get(chat_id, [])[-4:]
    messages = [{'role': 'system', 'content': SYSTEM_PROMPT}] + history + [{'role': 'user', 'content': user_text}]
    
    # Intentar con 70b, si no cambiar a 8b
    model_to_use = 'llama-3.3-70b-versatile'
    try:
        response = groq_client.chat.completions.create(
            model=model_to_use,
            messages=messages,
            tools=TOOLS_SCHEMA,
            tool_choice='auto',
            temperature=0.3
        )
    except Exception as e:
        logging.warning(f'Fallo con 70b ({e}), cambiando a 8b-instant...')
        model_to_use = 'llama-3.1-8b-instant'
        response = groq_client.chat.completions.create(
            model=model_to_use,
            messages=messages,
            tools=TOOLS_SCHEMA,
            tool_choice='auto',
            temperature=0.3
        )
    
    msg = response.choices[0].message
    
    if msg.tool_calls:
        messages.append(msg)
        for tcall in msg.tool_calls:
            tname = tcall.function.name
            try:
                targs = json.loads(tcall.function.arguments) if tcall.function.arguments else {}
            except:
                targs = {}
            tresult = execute_tool(tname, targs)
            messages.append({
                'role': 'tool',
                'tool_call_id': tcall.id,
                'content': json.dumps(tresult, default=str)
            })
        
        # Segunda llamada para generar la respuesta final redactada
        try:
            final_resp = groq_client.chat.completions.create(
                model=model_to_use,
                messages=messages,
                temperature=0.3
            )
            final_content = final_resp.choices[0].message.content
        except Exception as e:
            final_resp = groq_client.chat.completions.create(
                model='llama-3.1-8b-instant',
                messages=messages,
                temperature=0.3
            )
            final_content = final_resp.choices[0].message.content
    else:
        final_content = msg.content
    
    # Guardar en memoria de conversación
    if chat_id not in USER_CONVERSATIONS:
        USER_CONVERSATIONS[chat_id] = []
    USER_CONVERSATIONS[chat_id].append({'role': 'user', 'content': user_text})
    USER_CONVERSATIONS[chat_id].append({'role': 'assistant', 'content': final_content})
    if len(USER_CONVERSATIONS[chat_id]) > 6:
        USER_CONVERSATIONS[chat_id] = USER_CONVERSATIONS[chat_id][-6:]
        
    return final_content

# ==========================================
# 5. CONTROLADORES DE TELEGRAM
# ==========================================

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    USER_CONVERSATIONS[message.chat.id] = []
    welcome_text = (
        "👋 ¡Hola! Bienvenido al Asistente Virtual Oficial de GestDeportIUB 🏅\n\n"
        "Estoy aquí para ayudarte con toda la información deportiva de la Institución Universitaria de Barranquilla (IUB).\n\n"
        "📌 ¿Qué puedes preguntarme?\n"
        "⚽ Torneos y Goleadores: ¿Cuáles torneos están activos? o ¿Quién es el goleador de fútbol?\n"
        "🏀 Estadísticas: ¿Quién lidera en puntos de baloncesto?\n"
        "🏟️ Escenarios: ¿Qué actividades hay en el Coliseo o en la Pista?\n"
        "📖 Reglamentos: ¿Qué sanciones hay por tarjeta roja directa? o ¿Cuáles son las posiciones de voleibol?\n"
        "🏥 Seguridad: ¿Cuál es el protocolo de primeros auxilios ante lesiones?\n\n"
        "¡Escríbeme cualquier pregunta y con gusto te atenderé! 🚀"
    )
    bot.reply_to(message, welcome_text)

@bot.message_handler(func=lambda message: True)
def handle_all_messages(message):
    bot.send_chat_action(message.chat.id, 'typing')
    try:
        reply = process_user_query(message.chat.id, message.text)
        bot.reply_to(message, reply)
    except Exception as e:
        logging.error(f'Error procesando mensaje: {e}')
        bot.reply_to(message, "Lo siento, ocurrió un pequeño error procesando tu consulta. Por favor inténtalo de nuevo en unos segundos.")

if __name__ == '__main__':
    print('==================================================')
    print('🚀 Bot de Telegram GestDeportIUB Iniciado con Éxito')
    print('📱 Usuario de Telegram: @gestdeport_iub_bot')
    print('🟢 Escuchando mensajes en vivo...')
    print('==================================================')
    bot.infinity_polling()
