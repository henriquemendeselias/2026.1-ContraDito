import asyncio
import logging

from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

_MODEL = "gemini-2.5-flash-lite"

_SYSTEM = (
    "Você responde APENAS com o texto puro do resumo, em português, sem títulos, "
    "sem markdown, sem negrito, sem listas, sem numeração, sem qualquer formatação. "
    "Somente parágrafos em texto corrido."
)

_PROMPT = """\
Resuma a proposição legislativa abaixo em no máximo 400 tokens, abordando:
o objetivo principal, as principais obrigações criadas e os argumentos centrais \
da justificativa. Linguagem objetiva, sem opiniões pessoais.

PROPOSIÇÃO:
{texto}"""

_PROMPT_CHUNK = """\
Extraia os pontos principais deste trecho de uma proposição legislativa.
Inclua: objetivo do trecho, obrigações mencionadas e argumentos presentes.
Seja conciso (máximo 150 palavras).

TRECHO:
{texto}"""

_PROMPT_REDUCAO = """\
Com base nos pontos extraídos dos trechos abaixo de uma mesma proposição legislativa,
escreva um resumo executivo coeso abordando: o objetivo principal, as principais
obrigações criadas e os argumentos centrais da justificativa.
Linguagem objetiva, sem opiniões pessoais.

PONTOS DOS TRECHOS:
{pontos}"""

_MAX_CHUNK_CHARS = 10_000

_CONFIG = types.GenerateContentConfig(
    system_instruction=_SYSTEM,
    temperature=0.3,
)


def _chunkar_texto(texto: str, max_chars: int = _MAX_CHUNK_CHARS) -> list[str]:
    """Divide o texto em partes de max_chars, quebrando em parágrafos quando possível."""
    if len(texto) <= max_chars:
        return [texto]
    chunks = []
    while texto:
        if len(texto) <= max_chars:
            chunks.append(texto)
            break
        corte = texto.rfind("\n\n", 0, max_chars)
        if corte == -1:
            corte = texto.rfind("\n", 0, max_chars)
        if corte == -1:
            corte = max_chars
        chunks.append(texto[:corte].strip())
        texto = texto[corte:].strip()
    return [c for c in chunks if c]


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
def _chamar_gemini(gemini_client: genai.Client, prompt: str) -> str:
    response = gemini_client.models.generate_content(
        model=_MODEL,
        contents=prompt,
        config=_CONFIG,
    )
    return response.text.strip()


async def gerar_resumo_executivo(texto: str, gemini_client: genai.Client) -> str:
    """
    Gera um resumo executivo via Gemini Flash.
    Textos curtos: uma única chamada. Textos longos: map-reduce (chunk → pontos → resumo final).
    Retorna string vazia se o texto de entrada for vazio.
    """
    if not texto or not texto.strip():
        return ""

    chunks = _chunkar_texto(texto)

    if len(chunks) == 1:
        return await asyncio.to_thread(
            _chamar_gemini, gemini_client, _PROMPT.format(texto=chunks[0])
        )

    # Map: extrai pontos de cada chunk individualmente
    pontos = []
    for chunk in chunks:
        ponto = await asyncio.to_thread(
            _chamar_gemini, gemini_client, _PROMPT_CHUNK.format(texto=chunk)
        )
        pontos.append(ponto)

    # Reduce: combina os pontos num resumo final coeso
    pontos_combinados = "\n\n".join(
        f"[Trecho {i + 1}]\n{p}" for i, p in enumerate(pontos)
    )
    return await asyncio.to_thread(
        _chamar_gemini, gemini_client, _PROMPT_REDUCAO.format(pontos=pontos_combinados)
    )


def criar_cliente_gemini(api_key: str) -> genai.Client:
    return genai.Client(api_key=api_key)
