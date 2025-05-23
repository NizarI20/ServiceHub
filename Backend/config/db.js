import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config();

const connectDB = async () => {
  try {
    // Utiliser MONGO_URI ou MONGODB_URI (pour plus de flexibilité)
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('ERROR: MongoDB URI not found in environment variables.');
      console.error('Please set MONGO_URI or MONGODB_URI in your .env file');
      console.error('Example: MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB...');
    
    // Add connection options with proper writeConcern - fix 'majori' to 'majority'
    const mongooseOptions = {
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 1000
      },
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
    
    await mongoose.connect(mongoUri, mongooseOptions);
    console.log('MongoDB Connected successfully!');
    
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    
    // Ne pas arrêter l'application en cas d'erreur, retourner false pour indiquer l'échec
    return false;
  }
};

export default connectDB;