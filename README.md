# RackMap

Uma aplicação web local para visualizar e gerenciar dados de racks e locais com atualizações dinâmicas. Desenvolvida como solução MVP para mapear infraestrutura de servidores e melhorar a colaboração do time.

> **⚠️ Status:** Este é um projeto em desenvolvimento ativo. Trata-se de um MVP (Minimum Viable Product) criado para validar a solução com o time. Espere encontrar melhorias necessárias em UX, performance e lógica de negócio.

## Stack Técnico

- **Backend**: Node.js + Fastify + Prisma + MariaDB
- **Frontend**: React + Vite
- **Containerização**: Docker + Docker Compose

## Conhecidas Limitações 🚧

### Frontend
- Desenvolvido com auxílio de IA, pode conter bugs visuais e de interação
- Tabelas renderizadas com CSS puro e loops `for` (implementação pode ser pesada)
- Sem otimizações de performance para grandes volumes de dados
- Recomendado para análise antes de deployar em produção

### Backend
- Lógica de negócio em refinamento
- Alguns algoritmos precisam de revisão e otimização
- Estrutura preparada para evoluir com melhorias do time

## Pré-requisitos

- Docker e Docker Compose
- Node.js 22 (opcional, apenas para desenvolvimento local sem containers)

## Quickstart com Docker

Do diretório raiz do projeto:

```bash
docker compose up
```

Para rodar em background:

```bash
docker compose up -d
```

A stack inicia os seguintes serviços:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Frontend | http://localhost:5173 | Vite dev server |
| Backend API | http://localhost:3333 | Fastify API |
| MariaDB | localhost:3306 | Banco de dados |

### Health Check

Verificar se o backend está pronto:

```bash
curl http://localhost:3333/health
```

### Parar a Stack

```bash
docker compose down
```

Para remover também volumes de dados e dependências:

```bash
docker compose down -v
```

## Arquitetura Docker

O arquivo `docker-compose.yml` orquestra:

- **frontend**: Vite dev server na porta `5173`
- **backend**: Fastify API na porta `3333`
- **mysql-db**: MariaDB 11.4, inicializa com `database/database.sql`

O backend aguarda o MariaDB ficar saudável antes de iniciar. O frontend aguarda o healthcheck do backend antes de iniciar.

## Configuração de Ambiente

### Variáveis Backend

```env
DATABASE_URL="mysql://rackmap:rackmap@127.0.0.1:3306/rackmap"
RACKTABLES_API_URL="http://localhost:8000"
RACKTABLES_RACKS_PATH="/v1/racktables/racks/"
RACKTABLES_LOCATIONS_ROWS_PATH="/v1/racktables/locations/rows"
# RACKTABLES_API_TOKEN=""
```

**Com Docker**: `DATABASE_URL` é configurado automaticamente para usar o serviço MariaDB:

```env
mysql://rackmap:rackmap@mysql-db:3306/rackmap
```

O padrão do Compose para `RACKTABLES_API_URL` é `http://host.docker.internal:8000`, permitindo que o backend acesse uma API RackTables rodando na sua máquina host.

### Sobrescrever Variáveis

```bash
RACKTABLES_API_URL=http://host.docker.internal:8000 docker compose up
```

## Desenvolvimento Local (Sem Docker)

### Instalação

```bash
npm install
```

### Gerar Cliente Prisma

```bash
npx prisma generate --schema backend/prisma/schema.prisma
```

### Iniciar Serviços

Terminal 1 - Backend:

```bash
npm run dev
```

Terminal 2 - Frontend:

```bash
npm run dev:frontend
```

O Vite proxia `/v1` e `/health` para `http://localhost:3333` por padrão.

Para usar outro endpoint de backend:

```bash
BACKEND_PROXY_TARGET=http://localhost:3333 npm run dev:frontend
```

## Comandos Úteis

```bash
# Verificar configuração do Compose
docker compose config

# Listar serviços
docker compose ps

# Logs em tempo real
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql-db

# Build do frontend para produção
npm run build:frontend
```

## Próximas Etapas

- [ ] Revisar e otimizar performance do frontend (tabelas virtualizadas, memoização)
- [ ] Validar lógica de negócio do backend com o time
- [ ] Implementar testes unitários e integração
- [ ] Melhorar tratamento de erros e validações
- [ ] Documentar fluxos de dados e APIs

## Contribuindo

Melhorias são bem-vindas! Estamos refinando este projeto para torná-lo uma solução robusta para o time.

## Licença

[Adicionar informação de licença se aplicável]
