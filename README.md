# 🛤️ Trilho API - Documentação do Backend

**Autores:** Thiago Venceslau & Nathan Vinicius  
**Data:** Novembro de 2025  
**Versão:** 1.0.0

---

## 1. Visão Geral do Projeto

O **Trilho** é um aplicativo móvel focado na construção e manutenção de hábitos positivos. O sistema utiliza gamificação através de "streaks" (sequências) para motivar o usuário.

O backend foi desenvolvido com foco em **Arquitetura Limpa**, **Domain-Driven Design (DDD)** e princípios **SOLID**, garantindo que as regras de negócio (como o cálculo de sequências) estejam desacopladas da infraestrutura (banco de dados e servidor web).

---

## 2. Stack Tecnológica

A escolha das tecnologias priorizou a tipagem estática e a escalabilidade:

- **Linguagem:** TypeScript (v5+)
- **Runtime:** Node.js (v18+)
- **Framework Web:** Express.js
- **Banco de Dados:** MongoDB (NoSQL)
- **ODM:** Mongoose
- **Validação de Dados:** Zod
- **Autenticação:** JWT (JSON Web Tokens) & Bcrypt.js
- **Upload de Arquivos:** Multer + Amazon S3 (Configurado)
- **Qualidade de Código:** ESLint + Prettier

---

## 3. Arquitetura de Software

O projeto foge do padrão MVC tradicional em favor de uma arquitetura em camadas mais robusta e testável.

### 3.1. Camadas da Aplicação

1. **Interface (Controllers & Routes)**
   - Ponto de entrada das requisições HTTP.
   - Não contém regras de negócio.
   - Aplica validação de entrada (Zod) e delega para o Serviço.

2. **Aplicação (Services)**
   - Orquestra os fluxos de negócio (casos de uso).
   - *Ex: "Para marcar um hábito, busque no banco, execute a lógica de domínio e salve".*
   - Depende de **Interfaces**, não de implementações concretas (Injeção de Dependência).

3. **Domínio (Entities & Interfaces)**
   - O "coração" do software.
   - **Entidades Ricas:** As classes `Usuario` e `Habito` contêm métodos que protegem suas regras (ex: `calcularSequenciaAtual()`).
   - **Interfaces de Repositório:** Contratos que definem *o que* deve ser salvo, sem dizer *como*.

4. **Infraestrutura (Repositories & Models)**
   - Implementação concreta das interfaces.
   - Traduzem as Entidades de Domínio para Modelos do Mongoose e vice-versa.

### 3.2. Padrões Utilizados

- **Soft Delete:** Exclusão lógica utilizando o campo `isDeleted: boolean`.
- **Rich Domain Model:** A lógica de cálculo de datas reside na entidade, não espalhada pelo código.
- **Adapter Pattern:** Os repositórios funcionam como adaptadores entre o Domínio e o MongoDB.

---

## 4. Estrutura de Pastas
```
src/
├── config/          # Configurações (DB, Env)
├── controllers/     # Controladores (Request/Response)
├── domain/
│   ├── entities/    # Regras de negócio (Entidades Ricas)
│   ├── enums/       # Tipos enumerados (Cores, Ícones)
│   └── repositories/# Interfaces (Contratos)
├── middleware/      # Auth, Zod Validator, Uploads
├── models/          # Schemas do MongoDB
├── repositories/    # Implementações Mongoose
├── routes/          # Definição de endpoints
├── services/        # Casos de uso
├── utils/           # Helpers (JWT)
└── validations/     # Schemas Zod 
```

---

## 5. Especificação da API (Endpoints)

### 5.1. Autenticação & Usuário

| Método | Endpoint | Descrição | Autenticação |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/usuarios/register` | Cadastra um novo usuário | Pública |
| `POST` | `/api/usuarios/login` | Realiza login e retorna Token JWT | Pública |
| `PUT` | `/api/usuarios/perfil` | Atualiza nome e e-mail do usuário | **Bearer Token** |

### 5.2. Gestão de Hábitos

| Método | Endpoint | Descrição | Autenticação |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/habitos` | Cria um novo hábito | **Bearer Token** |
| `GET` | `/api/habitos` | Lista todos os hábitos ativos do usuário | **Bearer Token** |
| `PUT` | `/api/habitos/:id` | Edita um hábito (nome, cor, ícone) | **Bearer Token** |
| `DELETE` | `/api/habitos/:id` | Remove um hábito (Soft Delete) | **Bearer Token** |
| `POST` | `/api/habitos/:id/complete` | Marca o hábito como concluído hoje | **Bearer Token** |

### 5.3. Estatísticas

| Método | Endpoint | Descrição | Autenticação |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/stats/globais` | Retorna dashboard (Totais, Recordes) | **Bearer Token** |
