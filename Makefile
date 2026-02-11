.PHONY: up down build test lint

env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo ".env created from .env.example"; \
	fi

up: env
	docker compose up -d

up-build: env
	docker compose up --build -d

down:
	docker compose down

down-clean:
	docker compose down -v

logs:
	docker compose logs -f

test:
	dotnet test --verbosity normal

lint:
	cd frontend && npm run lint
