"""
Configuración del motor RAG integrado en el backend principal.
Lee las variables de entorno desde el .env del backend-python.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class RAGSettings:
    """Configuración centralizada del sistema RAG."""

    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    HUGGINGFACEHUB_API_TOKEN: str = os.getenv("HUGGINGFACEHUB_API_TOKEN", "")

    # Modelos
    EMBEDDING_MODEL: str = os.getenv(
        "EMBEDDING_MODEL",
        "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
    )

    # ChromaDB
    CHROMA_DB_PATH: str = os.getenv(
        "CHROMA_DB_PATH",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")),
    )
    CHROMA_COLLECTION_NAME: str = os.getenv("CHROMA_COLLECTION_NAME", "rag_documents")

    # Chunking
    CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
    CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "150"))

    # Retrieval
    RETRIEVER_K: int = int(os.getenv("RETRIEVER_K", "6"))

    # Documentos
    DOCS_PATH: str = os.getenv(
        "DOCS_PATH",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "docs")),
    )

    def validate(self):
        """Verifica que las configuraciones críticas estén presentes."""
        missing = []
        if not self.GROQ_API_KEY:
            missing.append("GROQ_API_KEY")
        if not self.HUGGINGFACEHUB_API_TOKEN:
            missing.append("HUGGINGFACEHUB_API_TOKEN")
        if missing:
            raise ValueError(f"Variables de entorno faltantes: {', '.join(missing)}")


rag_settings = RAGSettings()
