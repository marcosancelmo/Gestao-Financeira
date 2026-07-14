import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date,
    ForeignKey, Text, Enum as SAEnum, UniqueConstraint
)
from sqlalchemy.orm import relationship
from app.database.session import Base


class RoleEnum(str, enum.Enum):
    supervisor = "supervisor"
    colaborador = "colaborador"


class TipoLancamentoEnum(str, enum.Enum):
    entrada = "entrada"
    saida = "saida"


class StatusLancamentoEnum(str, enum.Enum):
    pago = "pago"
    pendente = "pendente"
    cancelado = "cancelado"


class ResponsavelEnum(str, enum.Enum):
    ronaldo = "Ronaldo"
    felipe = "Felipe"
    administrador = "Administrador"


class SituacaoObraEnum(str, enum.Enum):
    em_andamento = "Em andamento"
    concluida = "Concluída"
    cancelada = "Cancelada"


class StatusContaReceberEnum(str, enum.Enum):
    recebido = "Recebido"
    parcial = "Parcial"
    atrasado = "Atrasado"
    pendente = "Pendente"


class StatusContaPagarEnum(str, enum.Enum):
    pago = "Pago"
    pendente = "Pendente"
    atrasado = "Atrasado"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    username = Column(String(60), unique=True, nullable=False, index=True)
    senha_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(RoleEnum), nullable=False, default=RoleEnum.colaborador)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)


class Cliente(Base):
    __tablename__ = "clientes"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    cpf_cnpj = Column(String(20))
    telefone = Column(String(30))
    whatsapp = Column(String(30))
    email = Column(String(120))
    endereco = Column(String(200))
    cidade = Column(String(100))
    observacoes = Column(Text)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    obras = relationship("Obra", back_populates="cliente")
    lancamentos = relationship("Lancamento", back_populates="cliente")


class Obra(Base):
    __tablename__ = "obras"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    valor_contratado = Column(Float, default=0)
    data_inicio = Column(Date)
    previsao = Column(Date)
    situacao = Column(SAEnum(SituacaoObraEnum), default=SituacaoObraEnum.em_andamento)
    lucro_estimado = Column(Float, default=0)
    lucro_realizado = Column(Float, default=0)
    ativo = Column(Boolean, default=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    cliente = relationship("Cliente", back_populates="obras")
    lancamentos = relationship("Lancamento", back_populates="obra")


class Categoria(Base):
    __tablename__ = "categorias"
    __table_args__ = (UniqueConstraint("nome", "tipo", name="uq_categoria_nome_tipo"),)

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    tipo = Column(SAEnum(TipoLancamentoEnum), nullable=False)
    destaque = Column(Boolean, default=False)
    ativo = Column(Boolean, default=True)

    lancamentos = relationship("Lancamento", back_populates="categoria")


class FormaPagamento(Base):
    __tablename__ = "formas_pagamento"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(60), nullable=False, unique=True)
    ativo = Column(Boolean, default=True)

    lancamentos = relationship("Lancamento", back_populates="forma_pagamento")


class Lancamento(Base):
    __tablename__ = "lancamentos"

    id = Column(Integer, primary_key=True, index=True)
    numero = Column(Integer, unique=True, index=True)
    data = Column(Date, nullable=False, default=datetime.utcnow)
    tipo = Column(SAEnum(TipoLancamentoEnum), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"))
    valor = Column(Float, nullable=False)
    cliente_id = Column(Integer, ForeignKey("clientes.id"), nullable=True)
    obra_id = Column(Integer, ForeignKey("obras.id"), nullable=True)
    forma_pagamento_id = Column(Integer, ForeignKey("formas_pagamento.id"))
    responsavel = Column(SAEnum(ResponsavelEnum), nullable=False)
    descricao = Column(String(255))
    observacoes = Column(Text)
    status = Column(SAEnum(StatusLancamentoEnum), default=StatusLancamentoEnum.pago)
    destaque = Column(Boolean, default=False)
    criado_por = Column(Integer, ForeignKey("usuarios.id"))
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    excluido = Column(Boolean, default=False)  # soft delete

    categoria = relationship("Categoria", back_populates="lancamentos")
    cliente = relationship("Cliente", back_populates="lancamentos")
    obra = relationship("Obra", back_populates="lancamentos")
    forma_pagamento = relationship("FormaPagamento", back_populates="lancamentos")
    anexos = relationship("Anexo", back_populates="lancamento")


class Anexo(Base):
    __tablename__ = "anexos"

    id = Column(Integer, primary_key=True, index=True)
    lancamento_id = Column(Integer, ForeignKey("lancamentos.id"))
    nome_arquivo = Column(String(255))
    caminho = Column(String(500))
    tipo = Column(String(20))  # imagem, pdf, xml
    criado_em = Column(DateTime, default=datetime.utcnow)

    lancamento = relationship("Lancamento", back_populates="anexos")


class ContaReceber(Base):
    __tablename__ = "contas_receber"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clientes.id"))
    obra_id = Column(Integer, ForeignKey("obras.id"), nullable=True)
    valor = Column(Float, nullable=False)
    vencimento = Column(Date, nullable=False)
    status = Column(SAEnum(StatusContaReceberEnum), default=StatusContaReceberEnum.pendente)
    valor_recebido = Column(Float, default=0)
    observacoes = Column(Text)
    criado_em = Column(DateTime, default=datetime.utcnow)


class ContaPagar(Base):
    __tablename__ = "contas_pagar"

    id = Column(Integer, primary_key=True, index=True)
    fornecedor = Column(String(150), nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    valor = Column(Float, nullable=False)
    vencimento = Column(Date, nullable=False)
    status = Column(SAEnum(StatusContaPagarEnum), default=StatusContaPagarEnum.pendente)
    observacoes = Column(Text)
    criado_em = Column(DateTime, default=datetime.utcnow)


class Configuracao(Base):
    __tablename__ = "configuracoes"

    id = Column(Integer, primary_key=True, index=True)
    nome_empresa = Column(String(150), default="RM Serralheria")
    logo_path = Column(String(500))
    endereco = Column(String(200))
    telefone = Column(String(30))
    email = Column(String(120))
    cnpj = Column(String(20))
    tema = Column(String(20), default="escuro")
    cor_principal = Column(String(20), default="#c8622f")
    backup_automatico = Column(Boolean, default=False)


class BackupLog(Base):
    __tablename__ = "backup_logs"

    id = Column(Integer, primary_key=True, index=True)
    nome_arquivo = Column(String(255))
    caminho = Column(String(500))
    tipo = Column(String(20))  # manual, automatico
    criado_em = Column(DateTime, default=datetime.utcnow)
