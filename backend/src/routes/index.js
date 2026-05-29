const express = require("express");
const authRoutes = require("./authRoutes");
const presentationRoutes = require("./presentationRoutes");
const aiRoutes = require("./aiRoutes");
const imageRoutes = require("./imageRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/presentations", presentationRoutes);
router.use("/ai", aiRoutes);
router.use("/images", imageRoutes);

module.exports = router;
