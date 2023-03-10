const express = require("express");
const mongoose = require("mongoose");
//! import de cloudinary
const cloudinary = require("cloudinary").v2;
require("dotenv").config(); // Permet d'activer les variables d'environnement qui se trouvent dans le fichier `.env`
const cors = require("cors"); // permet d'autoriser ou non les demandes provenant de l'extérieur

const app = express();
app.use(express.json());

app.use(cors());

mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);

//! ID cloudinary :
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Import de mes fichiers de routes
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const paymentRoutes = require("./routes/payment");

// Je demande à mon serveur d'utiliser les routes importées
app.use(userRoutes);
app.use(offerRoutes);
app.use(paymentRoutes);

// Ceci est une route pour dire bonjour
app.get("/", (req, res) => {
  res.json("Bienvenue sur mon serveur");
});

//  pour gérer les pages introuvables :
app.all("*", (req, res) => {
  res.status(404).json({ message: "wrong route !" });
});

// (après les déclarations des routes) Démarrer le serveur :
// Pour écouter les requêtes du port 3000
app.listen(process.env.PORT || 4000, () => {
  console.log("Server started 🚀");
});
