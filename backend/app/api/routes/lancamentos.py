import csv
import io
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from typing import List, Optional
from app.database.session import get_db
from app.models.models import (
    Lancamento, Categoria, Cliente, Obra, FormaPagamento, Anexo,
    TipoLancamentoEnum, StatusLancamentoEnum, ResponsavelEnum
)
from app.schemas.schemas import LancamentoCreate, LancamentoOut, LancamentoUpdate
from app.auth.dependencies import get_current_user
from app.core.config import settings
import os

router = APIRouter(prefix="/api/lancamentos", tags=["Lançamentos"])


def _proximo_numero(db: Session) -> int:
    ultimo = db.query(func.max(Lancamento.numero)).scalar()
    return (ultimo or 0) + 1


def _query_base(db: Session):
    return db.query(Lancamento).options(
        joinedload(Lancamento.categoria),
        joinedload(Lancamento.cliente),
        joinedload(Lancamento.obra),
        joinedload(Lancamento.forma_pagamento),
    ).filter(Lancamento.excluido == False)


@router.get("/", response_model=List[LancamentoOut])
def listar(
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    categoria_id: Optional[int] = None,
    cliente_id: Optional[int] = None,
    obra_id: Optional[int] = None,
    responsavel: Optional[ResponsavelEnum] = None,
    forma_pagamento_id: Optional[int] = None,
    tipo: Optional[TipoLancamentoEnum] = None,
    status: Optional[StatusLancamentoEnum] = None,
    q: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    query = _query_base(db)
    if data_inicio:
        query = query.filter(Lancamento.data >= data_inicio)
    if data_fim:
        query = query.filter(Lancamento.data <= data_fim)
    if categoria_id:
        query = query.filter(Lancamento.categoria_id == categoria_id)
    if cliente_id:
        query = query.filter(Lancamento.cliente_id == cliente_id)
    if obra_id:
        query = query.filter(Lancamento.obra_id == obra_id)
    if responsavel:
        query = query.filter(Lancamento.responsavel == responsavel)
    if forma_pagamento_id:
        query = query.filter(Lancamento.forma_pagamento_id == forma_pagamento_id)
    if tipo:
        query = query.filter(Lancamento.tipo == tipo)
    if status:
        query = query.filter(Lancamento.status == status)
    if q:
        query = query.filter(Lancamento.descricao.ilike(f"%{q}%"))
    return query.order_by(Lancamento.data.desc(), Lancamento.id.desc()).offset(skip).limit(limit).all()


@router.get("/{lancamento_id}", response_model=LancamentoOut)
def obter(lancamento_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    l = _query_base(db).filter(Lancamento.id == lancamento_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    return l


@router.post("/", response_model=LancamentoOut)
def criar(payload: LancamentoCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    categoria = db.query(Categoria).filter(Categoria.id == payload.categoria_id).first()
    if not categoria:
        raise HTTPException(status_code=400, detail="Categoria inválida")
    l = Lancamento(
        **payload.model_dump(),
        numero=_proximo_numero(db),
        destaque=categoria.destaque,
        criado_por=current_user.id,
    )
    db.add(l)
    db.commit()
    db.refresh(l)
    return _query_base(db).filter(Lancamento.id == l.id).first()


@router.put("/{lancamento_id}", response_model=LancamentoOut)
def atualizar(lancamento_id: int, payload: LancamentoUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    l = db.query(Lancamento).filter(Lancamento.id == lancamento_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(l, k, v)
    if "categoria_id" in data:
        categoria = db.query(Categoria).filter(Categoria.id == data["categoria_id"]).first()
        if categoria:
            l.destaque = categoria.destaque
    db.commit()
    db.refresh(l)
    return _query_base(db).filter(Lancamento.id == l.id).first()


@router.delete("/{lancamento_id}")
def excluir(lancamento_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    l = db.query(Lancamento).filter(Lancamento.id == lancamento_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    l.excluido = True
    db.commit()
    return {"ok": True}


@router.post("/{lancamento_id}/anexos")
def upload_anexo(lancamento_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), _=Depends(get_current_user)):
    l = db.query(Lancamento).filter(Lancamento.id == lancamento_id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Lançamento não encontrado")
    ext = (file.filename.split(".")[-1] or "").lower()
    tipo = "imagem" if ext in ["png", "jpg", "jpeg", "gif", "webp"] else ("pdf" if ext == "pdf" else ("xml" if ext == "xml" else "outro"))
    dest_dir = settings.UPLOAD_DIR
    os.makedirs(dest_dir, exist_ok=True)
    dest_path = os.path.join(dest_dir, f"lanc{lancamento_id}_{file.filename}")
    with open(dest_path, "wb") as f:
        f.write(file.file.read())
    anexo = Anexo(lancamento_id=lancamento_id, nome_arquivo=file.filename, caminho=dest_path, tipo=tipo)
    db.add(anexo)
    db.commit()
    db.refresh(anexo)
    return {"id": anexo.id, "nome_arquivo": anexo.nome_arquivo, "tipo": anexo.tipo}


@router.get("/export/csv")
def exportar_csv(db: Session = Depends(get_db), _=Depends(get_current_user)):
    lancamentos = _query_base(db).order_by(Lancamento.data.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Número", "Data", "Tipo", "Categoria", "Valor", "Cliente", "Obra", "Forma Pagamento", "Responsável", "Status", "Descrição"])
    for l in lancamentos:
        writer.writerow([
            l.numero, l.data, l.tipo.value, l.categoria.nome if l.categoria else "", l.valor,
            l.cliente.nome if l.cliente else "", l.obra.nome if l.obra else "",
            l.forma_pagamento.nome if l.forma_pagamento else "", l.responsavel.value,
            l.status.value, l.descricao or "",
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=lancamentos.csv"},
    )
