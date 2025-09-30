// const multer = require("multer");
// const path = require("path");
// const AppError = require("../utils/appError");
// const fs = require("fs");
import multer from "multer";
import path from "path";
import AppError from "../utils/appError.js";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/avatars/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Chỉ chấp nhận file hình ảnh", 400), false);
  }
};

const uploadAvatar = multer({ storage, fileFilter });

export default uploadAvatar;
