import uuid
import logging
from langchain_text_splitters import RecursiveCharacterTextSplitter

from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct

from etl.utils import para_timestamp

TEXTO_CORROMPIDO = "[ARQUIVO CORROMPIDO NA ORIGEM]"
_COLLECTION = "chunks_discursos_embeddings"


def dividir_em_chunks(texto: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    if not texto or texto.strip() == TEXTO_CORROMPIDO:
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
    )
    return splitter.split_text(texto)


def _gerar_id_chunk(discurso_id: str, indice: int) -> str:
    """Gera um UUID v5 determinístico, baseado no discurso e na posição do chunk."""
    return str(uuid.uuid5(uuid.NAMESPACE_OID, f"{discurso_id}_{indice}"))


def processar_discurso(
    discurso_id: str,
    politico_id: int,
    data_discurso,
    texto_bruto: str,
    modelo,
    qdrant_client: QdrantClient,
    chunk_size: int,
    chunk_overlap: int,
) -> list[dict]:
    chunks = dividir_em_chunks(texto_bruto, chunk_size, chunk_overlap)
    resultado = []
    qdrant_points = []
    data_discurso_ts = para_timestamp(data_discurso)

    for indice, texto_chunk in enumerate(chunks):
        chunk_id = _gerar_id_chunk(discurso_id, indice)
        embedding = modelo.encode(texto_chunk)
        if hasattr(embedding, "tolist"):
            embedding = embedding.tolist()

        resultado.append({
            "id": chunk_id,
            "discurso_id": discurso_id,
            "texto_chunk": texto_chunk,
        })
        qdrant_points.append(
            PointStruct(
                id=chunk_id,
                payload={
                    "politico_id": politico_id,
                    "discurso_id": discurso_id,
                    "data_discurso": data_discurso_ts,
                },
                vector=embedding,
            )
        )

    if qdrant_points:
        qdrant_client.upsert(
            collection_name=_COLLECTION,
            points=qdrant_points,
        )

    return resultado


def executar_pipeline_chunking(
    supabase,
    modelo,
    qdrant_client: QdrantClient,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
    limite: int | None = None,
) -> int:
    resp = supabase.table("camara_discurso_chunks").select("discurso_id").execute()
    ids_processados = {row["discurso_id"] for row in resp.data}

    query = (
        supabase.table("camara_discursos")
        .select("id, texto_bruto, politico_id, data_discurso")
        .order("data_discurso", desc=True)
    )
    if ids_processados:
        query = query.not_.in_("id", list(ids_processados))
    if limite:
        query = query.limit(limite)
    discursos = query.execute().data

    total = 0
    for discurso in discursos:
        chunks = processar_discurso(
            discurso_id=discurso["id"],
            politico_id=discurso.get("politico_id"),
            data_discurso=discurso.get("data_discurso"),
            texto_bruto=discurso.get("texto_bruto") or "",
            modelo=modelo,
            qdrant_client=qdrant_client,
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )
        if chunks:
            supabase.table("camara_discurso_chunks").insert(chunks).execute()
            total += len(chunks)
            logging.info(f"Discurso {discurso['id']}: {len(chunks)} chunk(s) inserido(s).")

    return total
