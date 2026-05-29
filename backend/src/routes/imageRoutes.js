const express = require("express");
const { searchImagesController } = require("../controllers/imageController");

const router = express.Router();

router.get("/search", searchImagesController);

module.exports = router;
