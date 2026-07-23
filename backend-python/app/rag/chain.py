"""
Motor RAG: LangChain + ChromaDB + Groq (LLaMA 3.1).
Inicialización lazy – se carga la primera vez que se invoca.
"""

import os

from langchain_chroma import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings

from app.rag.config import rag_settings

# ── Prompt institucional ────────────────────────────────────
PROMPT_TEMPLATE = """Eres el asistente virtual oficial del Departamento de Deportes de la Institución Universitaria de Barranquilla (IUB).
Tu objetivo es ayudar como lo haría una persona amable y bien informada: responde en español claro, natural, cercano y fluido.

Reglas de respuesta:
1. Contesta directamente la pregunta. Empieza por el dato o la acción más útil; no uses introducciones repetitivas como "Según los documentos" o "Con base en el contexto".
2. Explica solo lo necesario y organiza la información con viñetas o pasos cuando realmente facilite la lectura. Mantén los mensajes breves, salvo que la pregunta requiera detalle.
3. Usa un tono cálido, respetuoso y servicial. Puedes cerrar ofreciendo ayuda adicional únicamente cuando resulte natural.
4. Si la respuesta no está en la información disponible, dilo con honestidad y amabilidad. No inventes deportes, reglas, fechas, requisitos ni otros datos.
5. Usa exclusivamente la información disponible para los datos concretos. No menciones documentos, fuentes, páginas, citas ni el proceso de búsqueda.
6. No incluyas enlaces, referencias bibliográficas ni una sección de fuentes al final.

Información disponible:
{context}

Pregunta del usuario: {question}

Respuesta:"""

RAG_PROMPT = PromptTemplate(
    template=PROMPT_TEMPLATE,
    input_variables=["context", "question"],
)


# ── Componentes del pipeline ────────────────────────────────

def _get_embeddings() -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(
        model_name=rag_settings.EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True},
    )


def _get_vector_store(embeddings: HuggingFaceEmbeddings) -> Chroma:
    if not os.path.exists(rag_settings.CHROMA_DB_PATH):
        raise FileNotFoundError(
            f"Base de datos vectorial no encontrada en '{rag_settings.CHROMA_DB_PATH}'. "
            "Ejecuta primero la ingesta de documentos."
        )
    return Chroma(
        persist_directory=rag_settings.CHROMA_DB_PATH,
        embedding_function=embeddings,
        collection_name=rag_settings.CHROMA_COLLECTION_NAME,
    )


def _get_llm() -> ChatGroq:
    return ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=rag_settings.GROQ_API_KEY,
        temperature=0.1,
        max_tokens=512,
    )


def _format_docs(docs) -> str:
    return "\n\n".join(doc.page_content for doc in docs)


# ── Singleton lazy ──────────────────────────────────────────

_retriever = None
_chain = None
_initialized = False


def initialize_chain():
    """Inicializa el pipeline RAG (embeddings → ChromaDB → LLM)."""
    global _retriever, _chain, _initialized
    if _initialized:
        return

    rag_settings.validate()
    print("🤖 Inicializando pipeline RAG...")

    embeddings = _get_embeddings()
    vector_store = _get_vector_store(embeddings)
    llm = _get_llm()

    _retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={"k": rag_settings.RETRIEVER_K},
    )

    _chain = (
        {"context": _retriever | _format_docs, "question": RunnablePassthrough()}
        | RAG_PROMPT
        | llm
        | StrOutputParser()
    )

    _initialized = True
    print("✅ Pipeline RAG listo")


def get_answer(question: str) -> dict:
    """Genera una respuesta RAG para la pregunta dada."""
    if not _initialized:
        initialize_chain()

    source_documents = _retriever.invoke(question)
    answer = _chain.invoke(question)

    sources = [
        {
            "source": doc.metadata.get("source", "Desconocido"),
            "page": doc.metadata.get("page"),
            "content_preview": doc.page_content[:200] + "...",
        }
        for doc in source_documents
    ]

    return {"answer": answer.strip(), "sources": sources}
