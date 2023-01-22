const express = require("express");
const router = express.Router();
const Offer = require("../models/Offer");

router.get("/offers", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    const regExp = new RegExp(title, "i");

    let numberToSkip = 1;
    numberToSkip = 5 * (page - 1); // 5 est le nb max d'offres affichées par page
    console.log(numberToSkip);

    if (!priceMin && !priceMax) {
      if (sort) {
        const newOffers = await Offer.find({
          product_name: regExp,
        })
          .skip(numberToSkip)
          .limit(5)
          .sort({ product_price: sort.replace("price-", "") })
          .select("product_name product_price -_id");
        const count = await Offer.countDocuments({
          product_name: regExp,
        });
        return res.json({ count: count, offers: newOffers });
      }
      if (!sort) {
        const newOffers = await Offer.find({
          product_name: regExp,
        })
          .skip(numberToSkip)
          .limit(5)
          .select("product_name product_price -_id");

        const count = await Offer.countDocuments({
          product_name: regExp,
        });
        return res.json({ count: count, offers: newOffers });
      }
    }

    if (priceMin && priceMax) {
      if (sort) {
        const newOffersMinMax = await Offer.find({
          product_name: regExp,
          product_price: { $gte: priceMin, $lte: priceMax },
        })
          .skip(numberToSkip)
          .limit(5)
          .sort({ product_price: sort.replace("price-", "") })
          .select("product_name product_price -_id");
        return res.json(newOffersMinMax);
      }
      if (!sort) {
        const newOffersMinMax = await Offer.find({
          product_name: regExp,
          product_price: { $gte: priceMin, $lte: priceMax },
        })
          .skip(numberToSkip)
          .limit(5)
          .select("product_name product_price -_id");
        return res.json(newOffersMinMax);
      }
    }

    if (priceMin && !priceMax) {
      if (sort) {
        const newOffersMin = await Offer.find({
          product_name: regExp,
          product_price: { $gte: priceMin },
        })
          .skip(numberToSkip)
          .limit(5)
          .sort({ product_price: sort.replace("price-", "") })
          .select("product_name product_price -_id");
        return res.json(newOffersMin);
      }
      if (!sort) {
        const newOffersMin = await Offer.find({
          product_name: regExp,
          product_price: { $gte: priceMin },
        })
          .skip(numberToSkip)
          .limit(5)
          .select("product_name product_price -_id");
        return res.json(newOffersMin);
      }
    }
    if (priceMax && !priceMin) {
      if (sort) {
        const newOffersMax = await Offer.find({
          product_name: regExp,
          product_price: { $lte: priceMax },
        })
          .skip(numberToSkip)
          .limit(5)
          .sort({ product_price: sort.replace("price-", "") })
          .select("product_name product_price -_id");
        return res.json(newOffersMax);
      }
      if (!sort) {
        const newOffersMax = await Offer.find({
          product_name: regExp,
          product_price: { $lte: priceMax },
        })
          .skip(numberToSkip)

          .select("product_name product_price -_id");
        return res.json(newOffersMax);
      }
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
