const express = require("express");
const router = express.Router();
// //! import de cloudinary
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../Utils/convertToBase64");

//! import de fileupload
const fileupload = require("express-fileupload");

// //! Fonction de transformation fichier de Buffer en base64
// const convertToBase64 = (file) => {
//   return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
// };

//! Import du middleware isAuthenticated
const isAuthenticated = require("../middlewares/isAuthenticated");

const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileupload(),
  async (req, res) => {
    try {
      const { title, description, price, condition, city, brand, size, color } =
        req.body;

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          { TAILLE: size },
          { ETAT: condition },
          { COULEUR: color },
          { EMPLACEMENT: city },
        ],
        owner: req.user,
        // product_image: result,
      });
      await newOffer.save();
      const offerId = newOffer._id;
      const pictureToUpload = req.files.picture;

      //envoi à Cloudinary du Buffer converti en Base64
      const result = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload),
        {
          folder: `/Vinted/offers/${offerId}`,
        }
      );
      let newOfferToShow = await Offer.findByIdAndUpdate(offerId, {
        product_image: result,
      });
      newOfferToShow = await Offer.findOne({
        _id: offerId,
      }).populate("owner");
      res.json(newOfferToShow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    // title=pantalon&priceMin=10&priceMax=1000&sort=price-asc&page=2

    // const results = await Offer.find({
    //   product_name: /vert/i,
    //   product_price: { $gte: 20, $lte: 200 },
    // })
    //   .sort({ product_price: -1 || 1 })
    //   .select("product_name product_price");

    const { title, description, priceMin, priceMax, sort, page } = req.query;

    const filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      filters.product_price = { $gte: Number(priceMin) };
    }

    if (priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(priceMax);
      } else {
        filters.product_price = { $lte: Number(priceMax) };
      }
    }

    const sortFilter = {};
    if (sort === "price-asc") {
      sortFilter.product_price = "asc";
    } else if (sort === "price-desc") {
      sortFilter.product_price = "desc";
    }

    const limit = 3; // 3 est le nb max d'offres affichées par page
    let numberToSkip = 1;
    if (page) numberToSkip = Number(page);
    const skip = (numberToSkip - 1) * limit;

    const offers = await Offer.find(filters)
      .sort(sortFilter)
      .skip(skip)
      .limit(limit);
    // .populate("owner", "account");
    // .select("product_name product_price -_id");

    const count = await Offer.countDocuments(filters);
    const response = { count: count, offers: offers };
    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id/:name", async (req, res) => {
  try {
    console.log(req.params);
    const offerToShow = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offerToShow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

//udpadate méthode mongoose markModified pour modification et sauvegarde de tableaux
