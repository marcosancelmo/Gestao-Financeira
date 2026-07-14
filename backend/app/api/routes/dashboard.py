from datetime import datetime, date
from calendar import monthrange
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.database.session import get_db
from app.models.models import Lancamento, ContaReceber, ContaPagar, TipoLancamentoEnum, StatusContaReceberEnum, StatusContaPagarEnum
from app.schemas.schemas import DashboardResumo
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def _soma(db, tipo=None, ano=None, mes=None, destaque=None):
    q = db.query(func.coalesce(func.sum(Lancamento.valor), 0)).filter(Lancamento.excluido == False)
    if tipo:
        q = q.filter(Lancamento.tipo == tipo)
    if ano:
        q = q.filter(extract("year", Lancamento.data) == ano)
    if mes:
        q = q.filter(extract("month", Lancamento.data) == mes)
    if destaque is not None:
        q = q.filter(Lancamento.destaque == destaque)
    return q.scalar() or 0


@router.get("/resumo", response_model=DashboardResumo)
def resumo(db: Session = Depends(get_db), _=Depends(get_current_user)):
    hoje = date.today()
    ano, mes = hoje.year, hoje.month

    entradas_mes = _soma(db, TipoLancamentoEnum.entrada, ano, mes)
    saidas_mes = _soma(db, TipoLancamentoEnum.saida, ano, mes)
    entradas_ano = _soma(db, TipoLancamentoEnum.entrada, ano)
    saidas_ano = _soma(db, TipoLancamentoEnum.saida, ano)

    entradas_total = _soma(db, TipoLancamentoEnum.entrada)
    saidas_total = _soma(db, TipoLancamentoEnum.saida)
    saldo_caixa = entradas_total - saidas_total

    contas_receber = db.query(func.coalesce(func.sum(ContaReceber.valor - ContaReceber.valor_recebido), 0)).filter(
        ContaReceber.status != StatusContaReceberEnum.recebido
    ).scalar() or 0

    contas_pagar = db.query(func.coalesce(func.sum(ContaPagar.valor), 0)).filter(
        ContaPagar.status != StatusContaPagarEnum.pago
    ).scalar() or 0

    retirada_pessoal = _soma(db, None, ano, mes, destaque=True)

    return DashboardResumo(
        entradas_mes=entradas_mes,
        saidas_mes=saidas_mes,
        lucro_liquido=entradas_mes - saidas_mes,
        saldo_caixa=saldo_caixa,
        saldo_bancario=saldo_caixa,
        contas_receber=contas_receber,
        contas_pagar=contas_pagar,
        retirada_pessoal=retirada_pessoal,
        lucro_ano=entradas_ano - saidas_ano,
        ultima_atualizacao=datetime.utcnow(),
    )


@router.get("/entradas-saidas-mensal")
def entradas_saidas_mensal(ano: int = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ano = ano or date.today().year
    resultado = []
    for mes in range(1, 13):
        entradas = _soma(db, TipoLancamentoEnum.entrada, ano, mes)
        saidas = _soma(db, TipoLancamentoEnum.saida, ano, mes)
        resultado.append({"mes": mes, "entradas": entradas, "saidas": saidas, "lucro": entradas - saidas})
    return resultado


@router.get("/despesas-por-categoria")
def despesas_por_categoria(db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.models.models import Categoria
    rows = db.query(Categoria.nome, func.coalesce(func.sum(Lancamento.valor), 0)).join(
        Lancamento, Lancamento.categoria_id == Categoria.id
    ).filter(Lancamento.tipo == TipoLancamentoEnum.saida, Lancamento.excluido == False).group_by(Categoria.nome).all()
    return [{"categoria": r[0], "valor": r[1]} for r in rows]


@router.get("/receitas-por-categoria")
def receitas_por_categoria(db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.models.models import Categoria
    rows = db.query(Categoria.nome, func.coalesce(func.sum(Lancamento.valor), 0)).join(
        Lancamento, Lancamento.categoria_id == Categoria.id
    ).filter(Lancamento.tipo == TipoLancamentoEnum.entrada, Lancamento.excluido == False).group_by(Categoria.nome).all()
    return [{"categoria": r[0], "valor": r[1]} for r in rows]


@router.get("/formas-pagamento-uso")
def formas_pagamento_uso(db: Session = Depends(get_db), _=Depends(get_current_user)):
    from app.models.models import FormaPagamento
    rows = db.query(FormaPagamento.nome, func.coalesce(func.sum(Lancamento.valor), 0)).join(
        Lancamento, Lancamento.forma_pagamento_id == FormaPagamento.id
    ).filter(Lancamento.excluido == False).group_by(FormaPagamento.nome).all()
    return [{"forma": r[0], "valor": r[1]} for r in rows]


@router.get("/comparativo-anual")
def comparativo_anual(db: Session = Depends(get_db), _=Depends(get_current_user)):
    ano_atual = date.today().year
    resultado = []
    for ano in [ano_atual - 1, ano_atual]:
        entradas = _soma(db, TipoLancamentoEnum.entrada, ano)
        saidas = _soma(db, TipoLancamentoEnum.saida, ano)
        resultado.append({"ano": ano, "entradas": entradas, "saidas": saidas, "lucro": entradas - saidas})
    return resultado


@router.get("/fluxo-caixa")
def fluxo_caixa(db: Session = Depends(get_db), _=Depends(get_current_user)):
    hoje = date.today()
    ano, mes = hoje.year, hoje.month
    dias_no_mes = monthrange(ano, mes)[1]
    resultado = []
    saldo_acumulado = 0
    for dia in range(1, dias_no_mes + 1):
        d = date(ano, mes, dia)
        entradas = db.query(func.coalesce(func.sum(Lancamento.valor), 0)).filter(
            Lancamento.tipo == TipoLancamentoEnum.entrada, Lancamento.data == d, Lancamento.excluido == False
        ).scalar() or 0
        saidas = db.query(func.coalesce(func.sum(Lancamento.valor), 0)).filter(
            Lancamento.tipo == TipoLancamentoEnum.saida, Lancamento.data == d, Lancamento.excluido == False
        ).scalar() or 0
        saldo_acumulado += entradas - saidas
        if entradas or saidas:
            resultado.append({"data": str(d), "entradas": entradas, "saidas": saidas, "saldo": saldo_acumulado})
    return resultado
