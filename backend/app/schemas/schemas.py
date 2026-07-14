from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.models import (
    RoleEnum, TipoLancamentoEnum, StatusLancamentoEnum, ResponsavelEnum,
    SituacaoObraEnum, StatusContaReceberEnum, StatusContaPagarEnum
)


# ---------- Usuario ----------
class UsuarioBase(BaseModel):
    nome: str
    username: str
    role: RoleEnum


class UsuarioCreate(UsuarioBase):
    senha: str


class UsuarioUpdate(BaseModel):
    nome: Optional[str] = None
    role: Optional[RoleEnum] = None
    ativo: Optional[bool] = None
    senha: Optional[str] = None


class UsuarioOut(UsuarioBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ativo: bool
    criado_em: datetime


# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


class LoginRequest(BaseModel):
    username: str
    senha: str


# ---------- Cliente ----------
class ClienteBase(BaseModel):
    nome: str
    cpf_cnpj: Optional[str] = None
    telefone: Optional[str] = None
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    endereco: Optional[str] = None
    cidade: Optional[str] = None
    observacoes: Optional[str] = None


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(ClienteBase):
    nome: Optional[str] = None
    ativo: Optional[bool] = None


class ClienteOut(ClienteBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ativo: bool
    criado_em: datetime


# ---------- Obra ----------
class ObraBase(BaseModel):
    nome: str
    cliente_id: Optional[int] = None
    valor_contratado: float = 0
    data_inicio: Optional[date] = None
    previsao: Optional[date] = None
    situacao: SituacaoObraEnum = SituacaoObraEnum.em_andamento
    lucro_estimado: float = 0
    lucro_realizado: float = 0


class ObraCreate(ObraBase):
    pass


class ObraUpdate(BaseModel):
    nome: Optional[str] = None
    cliente_id: Optional[int] = None
    valor_contratado: Optional[float] = None
    data_inicio: Optional[date] = None
    previsao: Optional[date] = None
    situacao: Optional[SituacaoObraEnum] = None
    lucro_estimado: Optional[float] = None
    lucro_realizado: Optional[float] = None
    ativo: Optional[bool] = None


class ObraOut(ObraBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ativo: bool
    criado_em: datetime


# ---------- Categoria ----------
class CategoriaBase(BaseModel):
    nome: str
    tipo: TipoLancamentoEnum
    destaque: bool = False


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaOut(CategoriaBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ativo: bool


# ---------- Forma Pagamento ----------
class FormaPagamentoBase(BaseModel):
    nome: str


class FormaPagamentoCreate(FormaPagamentoBase):
    pass


class FormaPagamentoOut(FormaPagamentoBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    ativo: bool


# ---------- Lancamento ----------
class LancamentoBase(BaseModel):
    data: date
    tipo: TipoLancamentoEnum
    categoria_id: int
    valor: float
    cliente_id: Optional[int] = None
    obra_id: Optional[int] = None
    forma_pagamento_id: int
    responsavel: ResponsavelEnum
    descricao: Optional[str] = None
    observacoes: Optional[str] = None
    status: StatusLancamentoEnum = StatusLancamentoEnum.pago


class LancamentoCreate(LancamentoBase):
    pass


class LancamentoUpdate(BaseModel):
    data: Optional[date] = None
    tipo: Optional[TipoLancamentoEnum] = None
    categoria_id: Optional[int] = None
    valor: Optional[float] = None
    cliente_id: Optional[int] = None
    obra_id: Optional[int] = None
    forma_pagamento_id: Optional[int] = None
    responsavel: Optional[ResponsavelEnum] = None
    descricao: Optional[str] = None
    observacoes: Optional[str] = None
    status: Optional[StatusLancamentoEnum] = None


class LancamentoOut(LancamentoBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    numero: int
    destaque: bool
    criado_em: datetime
    categoria: Optional[CategoriaOut] = None
    cliente: Optional[ClienteOut] = None
    obra: Optional[ObraOut] = None
    forma_pagamento: Optional[FormaPagamentoOut] = None


# ---------- Conta a Receber ----------
class ContaReceberBase(BaseModel):
    cliente_id: int
    obra_id: Optional[int] = None
    valor: float
    vencimento: date
    status: StatusContaReceberEnum = StatusContaReceberEnum.pendente
    valor_recebido: float = 0
    observacoes: Optional[str] = None


class ContaReceberCreate(ContaReceberBase):
    pass


class ContaReceberUpdate(BaseModel):
    valor: Optional[float] = None
    vencimento: Optional[date] = None
    status: Optional[StatusContaReceberEnum] = None
    valor_recebido: Optional[float] = None
    observacoes: Optional[str] = None


class ContaReceberOut(ContaReceberBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    criado_em: datetime
    cliente: Optional[ClienteOut] = None


# ---------- Conta a Pagar ----------
class ContaPagarBase(BaseModel):
    fornecedor: str
    categoria_id: Optional[int] = None
    valor: float
    vencimento: date
    status: StatusContaPagarEnum = StatusContaPagarEnum.pendente
    observacoes: Optional[str] = None


class ContaPagarCreate(ContaPagarBase):
    pass


class ContaPagarUpdate(BaseModel):
    fornecedor: Optional[str] = None
    categoria_id: Optional[int] = None
    valor: Optional[float] = None
    vencimento: Optional[date] = None
    status: Optional[StatusContaPagarEnum] = None
    observacoes: Optional[str] = None


class ContaPagarOut(ContaPagarBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    criado_em: datetime


# ---------- Configuracao ----------
class ConfiguracaoBase(BaseModel):
    nome_empresa: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    cnpj: Optional[str] = None
    tema: Optional[str] = None
    cor_principal: Optional[str] = None
    backup_automatico: Optional[bool] = None


class ConfiguracaoOut(ConfiguracaoBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    logo_path: Optional[str] = None


# ---------- Dashboard ----------
class DashboardResumo(BaseModel):
    entradas_mes: float
    saidas_mes: float
    lucro_liquido: float
    saldo_caixa: float
    saldo_bancario: float
    contas_receber: float
    contas_pagar: float
    retirada_pessoal: float
    lucro_ano: float
    ultima_atualizacao: datetime


class BackupLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    nome_arquivo: str
    caminho: str
    tipo: str
    criado_em: datetime
