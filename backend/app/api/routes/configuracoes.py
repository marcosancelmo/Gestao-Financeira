from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Configuracao
from app.schemas.schemas import ConfiguracaoOut, ConfiguracaoBase
from app.auth.dependencies import get_current_user, require_supervisor

router = APIRouter(prefix="/api/configuracoes", tags=["Configurações"])


def _get_or_create(db: Session) -> Configuracao:
    cfg = db.query(Configuracao).first()
    if not cfg:
        cfg = Configuracao()
        db.add(cfg)
        db.commit()
        db.refresh(cfg)
    return cfg


@router.get("/", response_model=ConfiguracaoOut)
def obter(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return _get_or_create(db)


@router.put("/", response_model=ConfiguracaoOut)
def atualizar(payload: ConfiguracaoBase, db: Session = Depends(get_db), _=Depends(require_supervisor)):
    cfg = _get_or_create(db)
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(cfg, k, v)
    db.commit()
    db.refresh(cfg)
    return cfg
