const User = require("../models/User");
// const Offer = require("../models/Offer");

const isAuthenticated = async (req, res, next) => {
  try {
    // Le token reçu est dans req.headers.authorization
    // console.log(req.headers.authorization);
    // je vais chercher mon token et j'enlève "Bearer "
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized !" });
    }
    const token = req.headers.authorization.replace("Bearer ", "");
    // console.log(token);

    // Je vais chercher dans ma BDD un user dont le token est celui que j'ai reçu
    // J'en trouve un :
    const user = await User.findOne({ token: token }).select("account");

    // Si je n'en trouve pas ====> erreur
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Si J'en trouve un, je le stocke dans req.user pour le garder sous la main et pouvoir le réutiliser dans ma route
    req.user = user;

    // Je passe au middleware suivant
    next();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = isAuthenticated;
