import mongoose from 'mongoose';

const MONGO_URI = String(process.env.MONGO_URI);

const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      console.error('Database URI not provided');
      return;
    }
    mongoose.connection.once('connected', () => {
      console.info('connect to MongoDB ');
    });
    mongoose.connection?.on('error', (err) => {
      console.info(`error to connect - MongoDB: Error: ${err.message}`);
    });
    await mongoose.connect(MONGO_URI);
  } catch (err: any) {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  }
};

export default connectDB;
