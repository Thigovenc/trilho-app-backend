import dotenv from 'dotenv'; // 1. Importe o dotenv
dotenv.config();
import express, { Application, Request, Response } from 'express';
import connectDB from './config/database';

// 2. Configure o dotenv
// Isso vai ler seu arquivo .env, processá-lo e adicionar ao 'process.env'


// 1. Conectar ao Banco de Dados
connectDB();

const app: Application = express();

// 2. Configurar Middlewares
// Middleware essencial para o Express entender JSON vindo no corpo das requisições
app.use(express.json()); 

// 3. Rota de Teste (Provisória)
// Vamos garantir que o servidor está respondendo
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API do Projeto Trilho está rodando!' });
});

// 4. Iniciar o Servidor
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});

export default app; // Exportamos 'app' para facilitar testes futuros