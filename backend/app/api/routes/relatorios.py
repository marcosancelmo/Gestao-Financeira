from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, extract
from app.database.session import get_db
from app.models.models import Lancamento, TipoLancamentoEnum
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/relatorios", tags=["Relatórios"])


@router.get("/retiradas-pessoais")
def retiradas_pessoais(ano: int = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    ano = ano or date.today().year
    query = db.query(Lancamento).options(joinedload(Lancamento.categoria)).filter(
        Lancamento.destaque == True, Lancamento.excluido == False, extract("year", Lancamento.data) == ano
    ).order_by(Lancamento.data.desc())
    lancamentos = query.all()
    total = sum(l.valor for l in lancamentos)
    return {
        "total": total,
        "lancamentos": [
            {"id": l.id, "data": str(l.data), "valor": l.valor, "descricao": l.descricao}
            for l in lancamentos
        ],
    }


@router.get("/resumo-mensal")
def resumo_mensal(ano: int, mes: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    entradas = db.query(func.coalesce(func.sum(Lancamento.valor), 0)).filter(
        Lancamento.tipo == TipoLancamentoEnum.entrada, Lancamento.excluido == False,
        extract("year", Lancamento.data) == ano, extract("month", Lancamento.data) == mes,
    ).scalar() or 0
    saidas = db.query(func.coalesce(func.sum(Lancamento.valor), 0)).filter(
        Lancamento.tipo == TipoLancamentoEnum.saida, Lancamento.excluido == False,
        extract("year", Lancamento.data) == ano, extract("month", Lancamento.data) == mes,
    ).scalar() or 0
    return {"ano": ano, "mes": mes, "entradas": entradas, "saidas": saidas, "lucro": entradas - saidas}
