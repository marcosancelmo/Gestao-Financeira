from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database.session import get_db
from app.models.models import ContaReceber
from app.schemas.schemas import ContaReceberCreate, ContaReceberOut, ContaReceberUpdate
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/contas-receber", tags=["Contas a Receber"])


@router.get("/", response_model=List[ContaReceberOut])
def listar(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(ContaReceber).options(joinedload(ContaReceber.cliente)).order_by(ContaReceber.vencimento).all()


@router.post("/", response_model=ContaReceberOut)
def criar(payload: ContaReceberCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = ContaReceber(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.put("/{conta_id}", response_model=ContaReceberOut)
def atualizar(conta_id: int, payload: ContaReceberUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(ContaReceber).filter(ContaReceber.id == conta_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{conta_id}")
def excluir(conta_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(ContaReceber).filter(ContaReceber.id == conta_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Conta não encontrada")
    db.delete(c)
    db.commit()
    return {"ok": True}
