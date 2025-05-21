# Documentação do Projeto Repositório Acadêmico de Documentos

## Visão Geral
Este projeto é um sistema de Repositório Acadêmico de Documentos, projetado para gerenciar documentos acadêmicos com funcionalidades como autenticação de usuários, upload de documentos, busca e gerenciamento de metadados. Consiste em um servidor API backend e uma interface frontend.

## Tecnologias Utilizadas
- **Backend:** Node.js com o framework Express
- **Banco de Dados:** SQLite (usando o pacote sqlite3)
- **Autenticação:** JWT (JSON Web Tokens) para autenticação segura de usuários
- **Upload de Arquivos:** Multer para manipulação de uploads de documentos PDF
- **Processamento de PDF:** pdf-parse para extração de texto de arquivos PDF para indexação
- **Frontend:** Arquivos estáticos servidos pelo Express (HTML, CSS, JavaScript)
- **Outros:** Middleware CORS para compartilhamento de recursos entre origens diferentes

## Estrutura e Funcionalidades do Backend

### app.js
- Configura o servidor Express na porta 3000.
- Configura middlewares para CORS, parsing de JSON e dados URL-encoded.
- Serve arquivos estáticos do frontend a partir do diretório `frontend`.
- Serve documentos enviados estaticamente a partir do diretório `storage`.
- Implementa o endpoint de login (`POST /api/login`) que autentica usuários no banco SQLite e gera tokens JWT.
- Middleware `authenticateToken` verifica tokens JWT para rotas protegidas.
- Rotas sob `/api/documents` são protegidas e tratadas pelo roteador `documents`.
- Inicia o servidor e escuta na porta 3000.

### routes/documents.js
- Trata endpoints da API relacionados a documentos.
- Usa Multer para manipular uploads de arquivos PDF, armazenando-os em uma hierarquia de diretórios estruturada baseada em metadados (categoria, disciplina, ano, autor).
- Endpoint de upload (`POST /api/documents/`) permite que usuários com papéis `professor` ou `admin` façam upload de documentos PDF.
- Extrai texto dos PDFs enviados para futura indexação de busca (ainda não totalmente implementado).
- Permite edição dos metadados dos documentos (`PUT /api/documents/:id`).
- Fornece um endpoint de busca (`GET /api/documents/search`) para consultar documentos por palavra-chave e filtros como categoria, disciplina, ano, autor e tipo.

### db.js
- Inicializa e conecta ao banco de dados SQLite `academic_docs.db`.
- Define tabelas:
  - `users`: armazena credenciais e papéis dos usuários.
  - `documents`: armazena metadados dos documentos enviados.
  - `logs`: armazena ações dos usuários relacionadas a documentos.
  - `notifications`: armazena notificações para usuários.
- Garante que as tabelas sejam criadas caso não existam.

## Banco de Dados
- Arquivo do banco SQLite localizado em `backend/academic_docs.db`.
- As tabelas suportam gerenciamento de usuários, metadados de documentos, logs e notificações.

## Armazenamento de Arquivos
- Documentos PDF enviados são armazenados no diretório `storage`.
- Os arquivos são organizados por categoria, disciplina, ano e autor.

## Autenticação e Autorização
- Usuários se autenticam via endpoint `/api/login`.
- Tokens JWT são emitidos e necessários para acessar rotas protegidas de documentos.
- Controle de acesso baseado em papéis restringe upload e edição de documentos aos papéis `professor` e `admin`.

## Resumo
Este projeto fornece um sistema seguro e organizado para gerenciamento de documentos acadêmicos, suportando autenticação de usuários, upload de documentos, gerenciamento de metadados e funcionalidades de busca. O backend é construído com Node.js e Express, usando SQLite para persistência de dados e JWT para autenticação.

