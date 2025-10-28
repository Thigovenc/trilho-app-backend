import dotenv from 'dotenv';
dotenv.config();
import express, { Application, Request, Response } from 'express';
import connectDB from './config/database';
import usuarioRoutes from './routes/usuario.routes';
import habitoRoutes from './routes/habito.routes';

connectDB();

const app: Application = express();

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'API do Projeto Trilho está rodando!' });
});

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/habitos', habitoRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escutando na porta ${PORT}`);
});

export default app;
