.PHONY: help start stop restart logs build clean dev test

help: ## Mostra esta ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

start: ## Inicia todos os containers
	docker compose up -d

stop: ## Para todos os containers
	docker compose down

restart: ## Reinicia todos os containers
	docker compose restart

logs: ## Mostra logs de todos os containers
	docker compose logs -f

logs-server: ## Mostra logs do servidor
	docker compose logs -f server

build: ## Builda todos os containers
	docker compose build

build-server: ## Builda apenas o servidor
	docker compose build server

clean: ## Remove containers, volumes e imagens
	docker compose down -v --rmi all

dev-server: ## Inicia servidor em modo desenvolvimento (local)
	cd server && npm run start:dev

test-server: ## Roda testes do servidor
	cd server && npm test

test-server-watch: ## Roda testes em modo watch
	cd server && npm run test:watch

test-server-e2e: ## Roda testes e2e
	cd server && npm run test:e2e

prisma-studio: ## Abre Prisma Studio
	cd server && npx prisma studio

prisma-migrate: ## Roda migrations
	cd server && npx prisma migrate dev

prisma-generate: ## Gera Prisma Client
	cd server && npx prisma generate

install-server: ## Instala dependências do servidor
	cd server && npm install

setup: install-server prisma-generate ## Configura o projeto

