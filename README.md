# RM Serralheria — Sistema Financeiro

Sistema completo de controle financeiro para a RM Serralheria, com backend em **FastAPI + SQLAlchemy + SQLite**
e frontend em **React + Vite + Tailwind + React Query + Recharts**.

## Estrutura

```
rm-serralheria/
  backend/          FastAPI (API REST + banco SQLite)
  frontend/         React + Vite (interface)
  database/         Arquivo financeiro.db (criado automaticamente)
  backups/          Backups gerados pelo sistema
```

## Papéis de usuário

- **Supervisor** (Ronaldo) — acesso completo: dashboards, relatórios, configurações, backup e usuários.
- **Colaborador** (Felipe) — lança e consulta movimentações, mas não acessa Configurações/Backup/Usuários.

Usuários criados automaticamente no primeiro início (senha `mudar123` — **troque assim que possível**):

| Usuário   | Login     | Papel        |
|-----------|-----------|--------------|
| Ronaldo   | `ronaldo` | supervisor   |
| Felipe    | `felipe`  | colaborador  |

## Como rodar localmente (Windows / PowerShell)

### 1. Backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

O backend cria o banco `database/financeiro.db` automaticamente e popula categorias,
formas de pagamento e os dois usuários iniciais na primeira execução.

A documentação interativa da API fica em `http://127.0.0.1:8000/docs`.

### 2. Frontend

Em outro terminal:

```powershell
cd frontend
npm install
npm run dev
```

Acesse `http://127.0.0.1:5173`. O Vite já está configurado com proxy de `/api` e `/uploads`
para `http://127.0.0.1:8000`, então não é necessário configurar CORS manualmente para o dev.

## Build de produção do frontend

```powershell
cd frontend
npm run build
```

Os arquivos ficam em `frontend/dist` — sirva com qualquer servidor estático (Nginx, IIS, etc.)
apontando as chamadas `/api` para o backend.

## Funcionalidades implementadas

- Dashboard com 10 cards de KPI e 6 gráficos (entradas x saídas, fluxo de caixa, despesas/receitas
  por categoria, forma de pagamento, comparativo anual).
- Novo Lançamento com combobox de categoria (seleção ou digitação livre para criar categoria nova),
  cliente, obra, forma de pagamento, upload de comprovante (imagem/PDF/XML).
- Lançamentos: tabela com filtros (período, categoria, cliente, obra, responsável, forma de
  pagamento, tipo, busca textual) e exportação CSV.
- Fluxo de Caixa diário do mês corrente (gráfico + tabela).
- Contas a Receber / Contas a Pagar (CRUD com status).
- Clientes e Obras (CRUD, obra vinculável a cliente).
- Categorias (entradas/saídas) com a categoria especial **"Saída Pessoal - Ronaldo"** destacada
  em vermelho e contabilizada automaticamente no card "Retirada Pessoal" e no relatório de
  Retiradas Pessoais.
- Formas de Pagamento (CRUD simples).
- Relatórios: retiradas pessoais por ano.
- Resumo Mensal: entradas/saídas/lucro de um mês específico.
- Configurações, Backup (gerar/baixar/restaurar arquivo SQLite) e Usuários — restritos ao Supervisor.
- Autenticação JWT com 2 papéis (supervisor / colaborador) e proteção de rotas no frontend.
- Soft delete em lançamentos e clientes/obras/categorias/formas de pagamento (campo `ativo`/`excluido`).

## Próximos passos sugeridos

- Exportação de relatórios em PDF/Excel (hoje só CSV está implementado).
- Paginação server-side na tabela de Lançamentos (hoje traz até 300 registros por consulta).
- Logs de auditoria (quem criou/editou/excluiu cada lançamento) — o campo `criado_por` já existe
  no modelo, falta a tela de consulta.
- Tema claro (hoje só o escuro está implementado).
- Alertas visuais de contas vencidas na tela de Contas a Receber/Pagar.
