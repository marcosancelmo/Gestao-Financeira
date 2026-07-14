from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import Usuario
from app.schemas.schemas import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.auth.security import hash_senha
from app.auth.dependencies import require_supervisor, get_current_user

router = APIRouter(prefix="/api/usuarios", tags=["Usuários"])


@router.get("/", response_model=List[UsuarioOut])
def listar(db: Session = Depends(get_db), _=Depends(require_supervisor)):
    return db.query(Usuario).all()


@router.post("/", response_model=UsuarioOut)
def criar(payload: UsuarioCreate, db: Session = Depends(get_db), _=Depends(require_supervisor)):
    if db.query(Usuario).filter(Usuario.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Usuário já existe")
    user = Usuario(nome=payload.nome, username=payload.username, role=payload.role,
                    senha_hash=hash_senha(payload.senha))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{usuario_id}", response_model=UsuarioOut)
def atualizar(usuario_id: int, payload: UsuarioUpdate, db: Session = Depends(get_db), _=Depends(require_supervisor)):
    user = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    data = payload.model_dump(exclude_unset=True)
    if "senha" in data:
        senha = data.pop("senha")
        if senha:
            user.senha_hash = hash_senha(senha)
    for k, v in data.items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{usuario_id}")
def desativar(usuario_id: int, db: Session = Depends(get_db), _=Depends(require_supervisor)):
    user = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    user.ativo = False
    db.commit()
    return {"ok": True}
