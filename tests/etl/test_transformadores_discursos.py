import pytest
from unittest.mock import patch

# Importação da função que ainda será implementada (esperado falhar com ImportError)
from etl.transformadores_discursos import gerar_hash_discurso, limpar_transcricao, transformar_discurso

def test_gerar_hash_discurso_deterministico():
    """
    Testa o Cenário de UUID: Garante que a geração de hash usando UUID v5
    é estritamente determinística se passarmos a mesma trinca de entradas.
    """
    id_deputado = 74646
    data_hora_inicio = "2023-10-05T11:32"
    fase_evento = "Homenagem"

    hash1 = gerar_hash_discurso(id_deputado, data_hora_inicio, fase_evento)
    hash2 = gerar_hash_discurso(id_deputado, data_hora_inicio, fase_evento)

    assert hash1 == hash2
    assert isinstance(hash1, str)
    assert len(hash1) == 36  # O comprimento padrão de uma string UUID

def test_limpar_transcricao_cenario_ideal():
    """
    Testa o Cenário Ideal de higienização agressiva (Estágios 1, 2 e 3).
    Remove HTML, decodifica entidades, extirpa o cabeçalho protocolar e normaliza os espaços.
    """
    texto_sujo = (
        "<p>O SR. AÉCIO NEVES (Bloco/PSDB - MG. Para discursar. Sem revisão do orador.) - "
        "Sr. Presidente, senhoras e senhores, &#x97; testando HTML e <b>negrito</b>. \n\n  Fim.</p>"
    )
    
    # Note que o '&#x97;' deve virar um travessão '—' e os espaços extras devem sumir
    texto_esperado = "Sr. Presidente, senhoras e senhores, — testando HTML e negrito. Fim."
    
    texto_limpo = limpar_transcricao(texto_sujo)
    
    assert texto_limpo == texto_esperado


def test_limpar_transcricao_cenario_discurso_integra():
    """
    Testa a remoção do cabeçalho alternativo sem travessão, comum em discursos lidos.
    Ex: 'DISCURSO NA ÍNTEGRA ENCAMINHADO PELO SR. DEPUTADO NETO CARLETTO. '
    """
    texto_sujo = "DISCURSO NA ÍNTEGRA ENCAMINHADO PELO SR. DEPUTADO NETO CARLETTO. Sr. Presidente, este é o meu discurso."
    
    # O cabeçalho inútil deve sumir, restando apenas o discurso real
    texto_esperado = "Sr. Presidente, este é o meu discurso."
    
    texto_limpo = limpar_transcricao(texto_sujo)
    
    assert texto_limpo == texto_esperado


def test_limpar_transcricao_cenario_pronuncia_seguinte_discurso():
    """
    Testa a remoção do cabeçalho alternativo onde o orador apenas insere o texto nos anais.
    Ex: 'O SR. DEPUTADO FULANO DE TAL pronuncia o seguinte discurso: '
    """
    texto_sujo = "O SR. DEPUTADO JOÃO DA SILVA (Bloco/PSDB - SP) pronuncia o seguinte discurso: Sr. Presidente, começo aqui minha fala."
    
    # O cabeçalho deve sumir, restando apenas o discurso útil
    texto_esperado = "Sr. Presidente, começo aqui minha fala."
    
    texto_limpo = limpar_transcricao(texto_sujo)
    
    assert texto_limpo == texto_esperado


def test_limpar_transcricao_cenario_sem_travessao_apos_parenteses():
    """
    Testa a remoção do cabeçalho quando não há travessão/hífen após o bloco do partido.
    Ex: 'A SRA. ADRIANA VENTURA (NOVO - SP. Pela ordem. Sem revisão da oradora.) Presidente, ...'
    """
    texto_sujo = "A SRA. ADRIANA VENTURA (NOVO - SP. Pela ordem. Sem revisão da oradora.) Presidente, o NOVO está em oposição."
    
    # O cabeçalho deve sumir inteiramente, sobrando apenas a fala limpa.
    texto_esperado = "Presidente, o NOVO está em oposição."
    
    texto_limpo = limpar_transcricao(texto_sujo)
    
    assert texto_limpo == texto_esperado

@patch("logging.warning")
def test_limpar_transcricao_cenario_fallback(mock_warning):
    """
    Testa o Cenário de Fallback (Completude Soberana): O discurso tem um formato 
    inesperado (sem o travessão clássico). O sistema deve limpar o HTML, manter o 
    texto original inteiro e disparar um log de warning, sem perdas.
    """
    texto_atipico = "<u>Apenas uma fala irregular sem o travessao da camara.</u> Sr. Presidente."
    
    texto_limpo = limpar_transcricao(texto_atipico)
    
    # Garante a retenção de 100% dos dados (mantendo o cabeçalho atípico) + remoção de HTML
    assert texto_limpo == "Apenas uma fala irregular sem o travessao da camara. Sr. Presidente."
    
    # Assert de que o plano B alertou os engenheiros via warning
    mock_warning.assert_called_once()


def test_transformar_discurso_data_contract():
    """
    Testa a transformação de um item do payload de Discurso,
    garantindo que o dicionário de saída adere ESTRITAMENTE ao Schema Estrito / Data Contract acordado.
    """
    id_deputado = 74646
    payload_camara = {
        "dataHoraInicio": "2023-10-05T11:32",
        "faseEvento": {"titulo": "Breves Comunicações"},
        "sumario": "Resumo do discurso.",
        "transcricao": "O SR. DEPUTADO (Partido) - Texto final validado.",
        "urlVideo": "http://camara.gov/video.mp4"
    }
    
    resultado = transformar_discurso(payload_camara, id_deputado)
    
    chaves_esperadas = {
        "id",
        "politico_id",
        "data_discurso",
        "fase_evento",
        "sumario",
        "texto_bruto",
        "url_video"
    }
    
    assert set(resultado.keys()) == chaves_esperadas
    assert resultado["politico_id"] == id_deputado
    assert resultado["fase_evento"] == "Breves Comunicações"
    assert resultado["texto_bruto"] == "Texto final validado."