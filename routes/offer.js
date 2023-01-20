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
      // console.log(newOffer._id);
      const pictureToUpload = req.files.picture;
      //envoi à Cloudinary du Buffer converti en Base64
      const result = await cloudinary.uploader.upload(
        convertToBase64(pictureToUpload),
        {
          folder: `/Vinted/offers/${offerId}`,
        }
      );
      let newOfferToShow = await Offer.findByIdAndUpdate(newOffer._id, {
        product_image: result,
      });
      // console.log(newOffer._id);
      newOfferToShow = await Offer.findOne({
        owner: req.user,
      }).populate("owner");
      res.json(newOfferToShow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;

//udpadate méthode mongoose markModified pour modification et sauvegarde de tableaux
