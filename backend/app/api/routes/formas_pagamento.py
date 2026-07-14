from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import FormaPagamento
from app.schemas.schemas import FormaPagamentoCreate, FormaPagamentoOut
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/formas-pagamento", tags=["Formas de Pagamento"])


@router.get("/", response_model=List[FormaPagamentoOut])
def listar(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(FormaPagamento).filter(FormaPagamento.ativo == True).order_by(FormaPagamento.nome).all()


@router.post("/", response_model=FormaPagamentoOut)
def criar(payload: FormaPagamentoCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    existente = db.query(FormaPagamento).filter(FormaPagamento.nome == payload.nome).first()
    if existente:
        return existente
    f = FormaPagamento(**payload.model_dump())
    db.add(f)
    db.commit()
    db.refresh(f)
    return f


@router.delete("/{forma_id}")
def excluir(forma_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    f = db.query(FormaPagamento).filter(FormaPagamento.id == forma_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Forma de pagamento não encontrada")
    f.ativo = False
    db.commit()
    return {"ok": True}
