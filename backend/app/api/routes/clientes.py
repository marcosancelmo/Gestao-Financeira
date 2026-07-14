from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.database.session import get_db
from app.models.models import Cliente
from app.schemas.schemas import ClienteCreate, ClienteOut, ClienteUpdate
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/clientes", tags=["Clientes"])


@router.get("/", response_model=List[ClienteOut])
def listar(q: Optional[str] = Query(None), db: Session = Depends(get_db), _=Depends(get_current_user)):
    query = db.query(Cliente).filter(Cliente.ativo == True)
    if q:
        query = query.filter(or_(Cliente.nome.ilike(f"%{q}%"), Cliente.cpf_cnpj.ilike(f"%{q}%")))
    return query.order_by(Cliente.nome).all()


@router.get("/{cliente_id}", response_model=ClienteOut)
def obter(cliente_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    return c


@router.post("/", response_model=ClienteOut)
def criar(payload: ClienteCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = Cliente(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.put("/{cliente_id}", response_model=ClienteOut)
def atualizar(cliente_id: int, payload: ClienteUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{cliente_id}")
def excluir(cliente_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    c.ativo = False
    db.commit()
    return {"ok": True}
