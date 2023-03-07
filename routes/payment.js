const express = require("express");
const router = express.Router();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);

const app = express();
app.use(cors());
app.use(express.json());

router.post("/payment", async (req, res) => {
  try {
    // console.log(req.body);
    // Je reçois un token du front
    const stripeToken = req.body.stripeToken;
    // Je fais une requête à stripe pour créer un paiement
    const responseFromStripe = await stripe.charges.create({
      amount: 200,
      currency: "eur",
      description: "Desciption produit",
      source: stripeToken,
    });
    // Si le paiement est effectué, on met à jour l'offre et on renvoie au front le fait que tout s'est bien passé
    console.log(responseFromStripe);
    // Je renvoie au client le status de la réponse de stripe
    res.json(responseFromStripe.status);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
