from sqlalchemy.orm import Session
from app.models.models import Usuario, Categoria, FormaPagamento, Configuracao, RoleEnum, TipoLancamentoEnum
from app.auth.security import hash_senha

CATEGORIAS_ENTRADA = [
    "Recebimento de Serviço", "Venda de Estruturas", "Venda de Portões", "Venda de Grades",
    "Venda de Corrimão", "Sinal de Cliente", "Recebimento de Orçamento", "Outros",
]

CATEGORIAS_SAIDA = [
    "Compra de Aço", "Compra de Tubos", "Compra de Chapas", "Compra de Parafusos",
    "Compra de Tintas", "Compra de Discos de Corte", "Compra de Eletrodos",
    "Compra de Arame MIG", "Compra de Gás MIG", "Compra de EPIs", "Ferramentas",
    "Manutenção de Máquinas", "Combustível", "Frete", "Alimentação da Equipe",
    "Energia Elétrica", "Água", "Internet", "Telefone", "Aluguel",
    "Honorários Contábeis", "Impostos", "Taxas Bancárias", "Outros",
]

FORMAS_PAGAMENTO = ["PIX", "Dinheiro", "Cartão Débito", "Cartão Crédito", "Transferência", "Boleto", "Cheque"]


def seed(db: Session):
    if not db.query(Categoria).first():
        for nome in CATEGORIAS_ENTRADA:
            db.add(Categoria(nome=nome, tipo=TipoLancamentoEnum.entrada))
        for nome in CATEGORIAS_SAIDA:
            db.add(Categoria(nome=nome, tipo=TipoLancamentoEnum.saida))
        db.add(Categoria(nome="Saída Pessoal - Ronaldo", tipo=TipoLancamentoEnum.saida, destaque=True))
        db.commit()

    if not db.query(FormaPagamento).first():
        for nome in FORMAS_PAGAMENTO:
            db.add(FormaPagamento(nome=nome))
        db.commit()

    if not db.query(Configuracao).first():
        db.add(Configuracao(nome_empresa="RM Serralheria"))
        db.commit()

    if not db.query(Usuario).first():
        db.add(Usuario(nome="Ronaldo", username="ronaldo", role=RoleEnum.supervisor,
                        senha_hash=hash_senha("mudar123")))
        db.add(Usuario(nome="Felipe", username="felipe", role=RoleEnum.colaborador,
                        senha_hash=hash_senha("mudar123")))
        db.commit()
