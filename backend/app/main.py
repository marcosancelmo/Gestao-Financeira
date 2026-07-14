from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import Base, engine, SessionLocal
from app.utils.seed_data import seed
from app.models import models  # noqa: ensures models are registered

from app.api.routes import (
    auth, usuarios, clientes, obras, categorias, formas_pagamento,
    lancamentos, contas_receber, contas_pagar, dashboard, relatorios,
    configuracoes, backup,
)

app = FastAPI(title="RM Serralheria - Sistema Financeiro", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()


app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(clientes.router)
app.include_router(obras.router)
app.include_router(categorias.router)
app.include_router(formas_pagamento.router)
app.include_router(lancamentos.router)
app.include_router(contas_receber.router)
app.include_router(contas_pagar.router)
app.include_router(dashboard.router)
app.include_router(relatorios.router)
app.include_router(configuracoes.router)
app.include_router(backup.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
