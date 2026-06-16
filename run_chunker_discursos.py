import os
import sys
import logging
import time
import argparse
from dotenv import load_dotenv
from supabase import create_client, Client
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer

from etl.chunker_discursos_camara import executar_pipeline_chunking
from etl.chunker_discursos_senado import executar_pipeline_chunking_senado

logging.Formatter.converter = time.gmtime
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

if not url or not key:
    raise ValueError("Variáveis SUPABASE_URL e SUPABASE_KEY não encontradas no ambiente.")

supabase: Client = create_client(url, key)


def obter_qdrant_client() -> QdrantClient:
    qdrant_url = os.environ.get("QDRANT_URL")
    qdrant_key = os.environ.get("QDRANT_KEY")
    if not qdrant_url or not qdrant_key:
        raise ValueError("Variáveis QDRANT_URL e QDRANT_KEY não encontradas no ambiente.")
    return QdrantClient(url=qdrant_url, api_key=qdrant_key)


def parse_args():
    parser = argparse.ArgumentParser(description="Chunking e vetorização de discursos (Câmara e Senado).")
    parser.add_argument("--casa", type=str, choices=["camara", "senado", "ambas"], default="ambas", help="Qual casa processar.")
    parser.add_argument("--chunk_size", type=int, default=1000, help="Tamanho máximo de cada chunk em caracteres.")
    parser.add_argument("--overlap", type=int, default=200, help="Sobreposição entre chunks consecutivos em caracteres.")
    parser.add_argument("--limite", type=int, default=None, help="Processar no máximo N discursos (útil para testes).")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    logging.info(f"Carregando modelo BAAI/bge-m3 (chunk_size={args.chunk_size}, overlap={args.overlap})...")
    modelo = SentenceTransformer("BAAI/bge-m3")

    logging.info("Iniciando pipeline de chunking incremental...")
    inicio = time.time()
    
    total_camara = 0
    total_senado = 0

    if args.casa in ["camara", "ambas"]:
        logging.info("--- Processando discursos da Câmara ---")
        total_camara = executar_pipeline_chunking(
            supabase=supabase,
            modelo=modelo,
            chunk_size=args.chunk_size,
            chunk_overlap=args.overlap,
            limite=args.limite,
        )

    if args.casa in ["senado", "ambas"]:
        logging.info("--- Processando discursos do Senado (Dual-Write) ---")
        qdrant_client = obter_qdrant_client()
        total_senado = executar_pipeline_chunking_senado(
            supabase_client=supabase,
            qdrant_client=qdrant_client,
            modelo=modelo,
            chunk_size=args.chunk_size,
            chunk_overlap=args.overlap,
            limite=args.limite,
        )

    fim = time.time()
    total = total_camara + total_senado
    logging.info(f"Pipeline geral finalizado: {total} chunk(s) processado(s) em {fim - inicio:.1f}s.")
