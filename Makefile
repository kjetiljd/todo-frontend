# Configurable variables
IMAGE ?= todo-frontend:latest
PORT ?= 3000
CONTAINER_NAME ?= todo-frontend

.PHONY: $(shell sed -n -e '/^$$/ { n ; /^[^ .\#][^ ]*:/ { s/:.*$$// ; p ; } ; }' $(MAKEFILE_LIST))

help:
	 @echo "$$(grep -hE '^\S+:.*##' $(MAKEFILE_LIST) | sed -e 's/:.*##\s*/:/' -e 's/^\(.\+\):\(.*\)/\\x1b[36m\1\\x1b[m:\2/' | column -c2 -t -s :)"

build: ## Install dependencies
	npm install

test: build ## Run tests
	npm test

dev: install ## Start development server with hot reload
	npm run dev

dev-mock: install ## Start development server with mock API
	npm run dev:mock

build-prod: install ## Build production bundle with TypeScript checking
	npm run build

build-fast: install ## Build production bundle without TypeScript checking
	npm run build:fast

preview: install ## Preview production build locally
	npm run preview

build-docker: ## Build Docker image
	docker build -t $(IMAGE) .

run-docker: build-docker ## Build and run container
	docker run --rm -p $(PORT):80 --name $(CONTAINER_NAME) $(IMAGE)

run-docker-bg: build-docker ## Build and run container in background
	docker run -d -p $(PORT):80 --name $(CONTAINER_NAME) $(IMAGE)

stop-docker: ## Stop and remove container
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true