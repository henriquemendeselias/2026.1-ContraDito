import uuid
import re
import html
import logging
from typing import Dict, Any
from bs4 import BeautifulSoup

# Um namespace arbitrário, porém fixo, para garantir que os UUIDs da nossa aplicação
# sejam únicos e não colidam com outras gerações de UUID v5 externas.
NAMESPACE_DISCURSOS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

def gerar_hash_discurso(id_deputado: int, data_hora_inicio: str, fase_evento: str) -> str:
    """
    Gera um UUID v5 sintético e determinístico baseado na trinca que identifica
    de forma única um discurso na API da Câmara dos Deputados.
    """
    # Concatenamos rigidamente as 3 chaves para gerar a string base
    texto_base = f"{id_deputado}_{data_hora_inicio}_{fase_evento}"
    return str(uuid.uuid5(NAMESPACE_DISCURSOS, texto_base))


def limpar_transcricao(texto_bruto: str) -> str:
    """
    Higieniza o texto do discurso em 3 estágios (HTML, Cabeçalho e Espaços).
    """
    if not texto_bruto:
        return ""
        
    # Estágio 1: Remoção de HTML e decodificação de entidades (ex: &#x97; -> —)
    texto = BeautifulSoup(texto_bruto, "html.parser").get_text(separator=" ", strip=True)
    texto = html.unescape(texto)
    
    # Estágio 2: Remoção do cabeçalho protocolar (Regex Agressivo)
    padroes_cabecalho = [
        # Padrão 1: Clássico com travessão. Ex: "O SR. AÉCIO NEVES (Bloco/PSDB - MG...) - "
        re.compile(r"^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\.\s]+(?:\([^)]+\))?\s*[-—]\s*"),
        
        # Padrão 2: Discurso encaminhado. Ex: "DISCURSO NA ÍNTEGRA ENCAMINHADO PELO SR. DEPUTADO FULANO DE TAL. "
        # Como os nomes são em maiúsculo, não usamos IGNORECASE para evitar que letras minúsculas (como em "Sr. Presidente") sejam engolidas.
        re.compile(r"^DISCURSO NA ÍNTEGRA ENCAMINHADO PEL[OA] SR[A]?\. DEPUTAD[OA] [A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\.\s]+\.\s*"),
        
        # Padrão 3: Inserção nos anais. Ex: "O SR. DEPUTADO FULANO (Partido) pronuncia o seguinte discurso: "
        re.compile(r"^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\.\s]+(?:\([^)]+\))?\s*pronuncia o seguinte discurso:\s*"),
        
        # Padrão 4: Clássico sem travessão. Exige o bloco de parênteses para não engolir texto comum.
        # Ex: "A SRA. ADRIANA VENTURA (NOVO - SP. Pela ordem.) Presidente, ..."
        re.compile(r"^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\.\s]+\([^)]+\)\s*")
    ]
    
    encontrou_padrao = False
    for padrao in padroes_cabecalho:
        texto_substituido, substituicoes = padrao.subn("", texto, count=1)
        if substituicoes > 0:
            texto = texto_substituido
            encontrou_padrao = True
            break
            
    if not encontrou_padrao:
        # Plano B: Mantém o texto sujo retido e alerta a engenharia
        trecho = texto[:100].replace('\n', ' ')
        logging.warning(f"Regex falhou. Trecho: {trecho}...")
    
    # Estágio 3: Normalização de espaços duplos e remoção de espaços antes de pontuação deixados pelo HTML
    texto = re.sub(r"\s+", " ", texto)
    texto = re.sub(r"\s+([.,?!;:])", r"\1", texto) # Junta "negrito ." para "negrito."
    texto = texto.strip()
    
    return texto


def transformar_discurso(payload_camara: Dict[str, Any], id_deputado: int) -> Dict[str, Any]:
    """
    Recebe o payload bruto de um discurso da Câmara e o ID do deputado,
    aplica as transformações necessárias e retorna um dicionário aderente
    ao Data Contract (Schema Estrito) acordado.
    """
    data_hora_inicio = payload_camara.get("dataHoraInicio", "")
    
    # Tratamento defensivo pois faseEvento pode vir como dict/objeto em conversões da API
    fase_evento_raw = payload_camara.get("faseEvento", {})
    if isinstance(fase_evento_raw, dict):
        fase_evento = fase_evento_raw.get("titulo", "")
    else:
        fase_evento = str(fase_evento_raw)

    transcricao_limpa = limpar_transcricao(payload_camara.get("transcricao", ""))

    return {
        "id": gerar_hash_discurso(id_deputado, data_hora_inicio, fase_evento),
        "politico_id": id_deputado,
        "data_discurso": data_hora_inicio,
        "fase_evento": fase_evento,
        "sumario": payload_camara.get("sumario"),
        "texto_bruto": transcricao_limpa,
        "url_video": payload_camara.get("urlVideo")
    }