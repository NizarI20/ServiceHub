import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  try {
    // Vérifier si le token existe dans l'en-tête Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];
    
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_for_dev');
    
    // Ajouter l'utilisateur à la requête
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(401).json({ message: 'Accès non autorisé. Token invalide.' });
  }
};

export default authMiddleware;