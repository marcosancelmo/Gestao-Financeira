from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.models.models import Categoria, TipoLancamentoEnum
from app.schemas.schemas import CategoriaCreate, CategoriaOut
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/categorias", tags=["Categorias"])


@router.get("/", response_model=List[CategoriaOut])
def listar(tipo: Optional[TipoLancamentoEnum] = None, db: Session = Depends(get_db), _=Depends(get_current_user)):
    query = db.query(Categoria).filter(Categoria.ativo == True)
    if tipo:
        query = query.filter(Categoria.tipo == tipo)
    return query.order_by(Categoria.nome).all()


@router.post("/", response_model=CategoriaOut)
def criar(payload: CategoriaCreate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    existente = db.query(Categoria).filter(Categoria.nome == payload.nome, Categoria.tipo == payload.tipo).first()
    if existente:
        return existente
    c = Categoria(**payload.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{categoria_id}")
def excluir(categoria_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    c = db.query(Categoria).filter(Categoria.id == categoria_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Categoria não encontrada")
    c.ativo = False
    db.commit()
    return {"ok": True}
