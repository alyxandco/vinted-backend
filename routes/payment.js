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
    const response = await stripe.charges.create({
      amount: req.body.amount,
      currency: "eur",
      description: req.body.title,
      source: stripeToken,
    });
    // Si le paiement est effectué, on met à jour l'offre et on renvoie au front le fait que tout s'est bien passé
    console.log(response);
    // Je renvoie au client le status de la réponse de stripe
    res.json(response.status);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
