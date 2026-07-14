from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import Obra
from app.schemas.schemas import ObraCreate, ObraOut, ObraUpdate
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/obras", tags=["Obras"])


@router.get("/", response_model=List[ObraOut])
def listar(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Obra).filter(Obra.ativo == True).order_by(Obra.criado_em.desc()).all()


@router.post("/", response_model=ObraOut)
def criar(payload: ObraCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    o = Obra(**payload.model_dump())
    db.add(o)
    db.commit()
    db.refresh(o)
    return o


@router.put("/{obra_id}", response_model=ObraOut)
def atualizar(obra_id: int, payload: ObraUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    o = db.query(Obra).filter(Obra.id == obra_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(o, k, v)
    db.commit()
    db.refresh(o)
    return o


@router.delete("/{obra_id}")
def excluir(obra_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    o = db.query(Obra).filter(Obra.id == obra_id).first()
    if not o:
        raise HTTPException(status_code=404, detail="Obra não encontrada")
    o.ativo = False
    db.commit()
    return {"ok": True}
