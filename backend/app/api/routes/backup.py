import os
import shutil
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.models import BackupLog
from app.schemas.schemas import BackupLogOut
from app.auth.dependencies import require_supervisor
from app.core.config import settings

router = APIRouter(prefix="/api/backup", tags=["Backup"])


def _caminho_db() -> str:
    url = settings.DATABASE_URL.replace("sqlite:///", "")
    return url


@router.get("/", response_model=List[BackupLogOut])
def listar(db: Session = Depends(get_db), _=Depends(require_supervisor)):
    return db.query(BackupLog).order_by(BackupLog.criado_em.desc()).all()


@router.post("/gerar", response_model=BackupLogOut)
def gerar_backup(db: Session = Depends(get_db), _=Depends(require_supervisor)):
    origem = _caminho_db()
    if not os.path.exists(origem):
        raise HTTPException(status_code=404, detail="Banco de dados não encontrado")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    nome_arquivo = f"backup_{timestamp}.db"
    destino = os.path.join(settings.BACKUP_DIR, nome_arquivo)
    os.makedirs(settings.BACKUP_DIR, exist_ok=True)
    shutil.copy2(origem, destino)
    log = BackupLog(nome_arquivo=nome_arquivo, caminho=destino, tipo="manual")
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/{backup_id}/download")
def baixar_backup(backup_id: int, db: Session = Depends(get_db), _=Depends(require_supervisor)):
    log = db.query(BackupLog).filter(BackupLog.id == backup_id).first()
    if not log or not os.path.exists(log.caminho):
        raise HTTPException(status_code=404, detail="Backup não encontrado")
    return FileResponse(log.caminho, filename=log.nome_arquivo)


@router.post("/{backup_id}/restaurar")
def restaurar_backup(backup_id: int, db: Session = Depends(get_db), _=Depends(require_supervisor)):
    log = db.query(BackupLog).filter(BackupLog.id == backup_id).first()
    if not log or not os.path.exists(log.caminho):
        raise HTTPException(status_code=404, detail="Backup não encontrado")
    destino = _caminho_db()
    shutil.copy2(log.caminho, destino)
    return {"ok": True, "mensagem": "Backup restaurado. Reinicie a aplicação para aplicar as mudanças."}
