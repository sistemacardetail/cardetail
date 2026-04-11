# Projeto Car Detail

Sistema para digitalizar e otimizar o gerenciamento de empresas de estética automotiva, permitindo o controle de:

- Clientes e seus veículos
- Produtos automotivos e estoque
- Equipamentos utilizados nos serviços
- Serviços e pacotes de serviços
- Orçamentos
- Agendamentos
- Vendas de produtos
- Controle financeiro
- Relatórios gerenciais

---

## Como subir com Docker

### Pré-requisitos
- Docker e Docker Compose instalados

### Passos

```bash
# 1. Copiar o template de variáveis de ambiente
cp .env.example .env

# 2. Editar o .env com seus valores
#    POSTGRES_USER, POSTGRES_PASSWORD, JWT_SECRET (gere com: openssl rand -base64 64)

# 3. Subir todos os serviços
docker compose up -d --build

# 4. Verificar se todos os serviços estão rodando
docker compose ps
```

Após subir, acesse: **http://localhost**

A API fica disponível em `http://localhost/api/` (roteada pelo Nginx para o backend na porta 8080).

### Comandos úteis

```bash
# Ver logs de todos os serviços
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f cardetail_backend

# Parar os serviços
docker compose down

# Parar e remover o volume do banco (apaga os dados)
docker compose down -v

# Rebuildar apenas um serviço
docker compose up -d --build cardetail_backend
```

---

## Desenvolvimento local (sem Docker)

### Frontend
Requer Node.js 22+

```bash
cd web
npm install
npm run start:cardetail
```

### Backend
Requer Java 21 e Gradle

```bash
cd server
./gradlew bootRun
```

---

## Clientes
A tela de clientes permite o cadastro e gerenciamento das pessoas que utilizam os serviços da empresa.

Campos obrigatórios:

- Nome
- Associação de múltiplos telefones
- Associação de múltiplos veículos
- Ativo

Campos opcionais:

- Observação

Funcionalidades adicionais:

- Visualização do histórico completo de orçamentos, agendamentos e produtos consumidos

## Veículos
O gerenciamento de veículos será feito pelo cadastro do cliente, onde serão informados os dados dos automóveis atendidos pela empresa.

Campos obrigatórios:

- Modelo (seleção de modelos pré-cadastrados)
- Cor (seleção de cores pré-cadastradas)
- Placa
- Cliente proprietário
- Ativo

Campos opcionais:

- Observação

Funcionalidades adicionais:

- Visualização do histórico de pacotes e serviços aplicados ao veículo

## Produtos Automotivos
Essa tela controla os produtos usados nos serviços de estética, permitindo o uso de variações de um mesmo produto.

Campos obrigatórios:

- Nome
- Marca (seleção de marcas pré-cadastradas)
- Unidade (seleção de unidades pré-cadastradas)
- Tipo (seleção de tipos pré-cadastrados)

Campos opcionais:

- Descrição

Funcionalidades adicionais:

- Cadastro de variações do produto (ex: tamanhos de embalagens como 500ml, 1000ml, 3000ml)

## Equipamentos
A tela de equipamentos permite o controle de itens utilizados nos serviços, incluindo informações sobre durabilidade e previsão de uso.

Campos obrigatórios:

- Nome
- Tipo (selecionado de tipos pré-cadastrados)
- Duração estimada (em meses)
- Quantidade estimada de veículos atendidos

Funcionalidades adicionais:

- Data de previsão de compra (será calculado pelo sistema com base na última compra e na duração)

Exemplo descritivo de um equipamento:

- Nome: Escova de microfibra angular
- Tipo: Escova
- Duração estimada: 6 meses
- Quantidade de veículos atendidos: 900
- Data de previsão de compra: 01/06/2025
- Descrição: Escova utilizada para limpeza de rodas e partes inferiores do veículo, com cerdas de microfibra que evitam riscos na pintura.
