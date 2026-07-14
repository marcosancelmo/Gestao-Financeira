from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import ContaPagar
from app.schemas.schemas import ContaPagarCreate, ContaPagarOut, ContaPagarUpdate
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/contas-pagar", tags=["Contas a Pagar"])


@router.get("/", response_model=List[ContaPagarOut])
def listar(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(ContaPagar).order_by(ContaPagar.vencimento).all()


@router.post("/", response_model=ContaPagarOut)
def criar(payload: ContaPagarCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = ContaPagar(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.put("/{conta_id}", response_model=ContaPagarOut)
def atualizar(conta_id: int, payload: ContaPagarUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{conta_id}")
def excluir(conta_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(ContaPagar).filter(ContaPagar.id == conta_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    db.delete(c)
    db.commit()
    return {"ok": True}
