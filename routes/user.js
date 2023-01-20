const express = require("express");
const router = express.Router();
// //! import de cloudinary
const cloudinary = require("cloudinary").v2;
const convertToBase64 = require("../Utils/convertToBase64");

// //! ex d'utilisation de morgan (Middleware de surveillance du port d'utilisation)
// const morgan = require("morgan");
// // app.use(morgan("dev"));
// app.use(morgan("tiny"));

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

//! import de fileupload
const fileupload = require("express-fileupload");

const User = require("../models/User");

router.post("/user/signup", fileupload(), async (req, res) => {
  try {
    //Password
    const password = req.body.password;
    // salt
    const salt = uid2(16);
    // console.log("salt : ", salt);
    // Hash
    const hash = SHA256(salt + password).toString(encBase64);
    // console.log("hash : ", hash);
    //Token
    const token = uid2(64);
    // console.log("token : ", token);

    // J'enregistre en BDD, le mail, le username, le salt, le hash et le token, Je dois répondre au client tout SAUF le salt et le hash
    const { email, newsletter, username } = req.body;
    console.log(req.body, req.files);
    if (
      !username ||
      !email ||
      !password ||
      !newsletter /*typeof newsletter !== "boolean"*/
    ) {
      return res.status(400).json("Merci de saisir tous les critères");
    }
    const emailToVerify = await User.findOne({ email: email });
    if (emailToVerify) {
      return res.status(409).json("email déjà utilisé");
    }

    const newUser = new User({
      account: { username: username },
      email: email,
      newsletter: newsletter,
      salt: salt,
      hash: hash,
      token: token,
      // avatar:,
    });
    await newUser.save();
    const userId = newUser._id;
    const profilePictureToUpload = req.files.picture;
    //envoi à Cloudinary du Buffer converti en Base64
    const result = await cloudinary.uploader.upload(
      convertToBase64(profilePictureToUpload),
      {
        folder: `/Vinted/users/${userId}`,
      }
    );
    let newUserToShow = await User.findByIdAndUpdate(newUser._id, {
      account: { avatar: result },
    });
    // console.log(newUserToShow.avatar);
    res.json(newUserToShow);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// LOGIN
// /user/login
// On va recevoir un email et un password dans req.body
router.post("/user/login", async (req, res) => {
  try {
    const password = req.body.password;
    // console.log(password);
    const email = req.body.email;
    // console.log(email);
    // Aller chercher dans la BDD l'utilisateur dont l'email est celui reçu.
    const userToVerify = await User.findOne({ email: email });
    // console.log(emailToVerify.token);
    if (!userToVerify) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    // génération d'un hash avec le salt du user trouvé en BDD + le password transmis en req.body
    const newHash = SHA256(userToVerify.salt + password).toString(encBase64);
    // comparaison du nouveau newHash avec celui enregistre en BDD pour le user
    if (newHash === userToVerify.hash) {
      return res.json({
        _id: userToVerify._id,
        token: userToVerify.token,
        account: userToVerify.account,
      });
    } else {
      return res.json("Dégage !!");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
