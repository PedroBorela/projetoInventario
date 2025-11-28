# Serenity - Gestão de Inventário Pós-Óbito

Este projeto foi refatorado para uma arquitetura moderna utilizando **React** no frontend e **JSON Server** no backend.

## Estrutura do Projeto

- **/client**: Código do frontend (React + Vite + Tailwind CSS).
- **/server**: Código do backend (API REST simulada com JSON Server).

## Como Rodar o Projeto

Você precisará de **dois terminais** abertos simultaneamente.

### 1. Iniciar o Backend (Servidor)

No primeiro terminal, navegue até a pasta `server` e inicie o servidor:

```bash
cd server
npm start
```

O servidor rodará em `http://localhost:3000`.

### 2. Iniciar o Frontend (Cliente)

No segundo terminal, navegue até a pasta `client` e inicie a aplicação React:

```bash
cd client
npm run dev
```

A aplicação abrirá no seu navegador (geralmente em `http://localhost:5173`).

## Funcionalidades

- **Dashboard**: Visão geral do patrimônio.
- **Bens**: Cadastro e gerenciamento de bens.
- **Herdeiros**: Cadastro e gerenciamento de herdeiros.
- **Dívidas**: Cadastro e gerenciamento de dívidas.
- **Inventário**: Cálculo de partilha e geração de relatório PDF.

## Solução de Problemas

Se você encontrar erros relacionados ao caminho do arquivo (ex: `informatica&Sociedade`), os scripts `package.json` já foram ajustados para contornar isso usando caminhos diretos para o `node`.

