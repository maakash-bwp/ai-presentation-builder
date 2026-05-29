const crypto = require("crypto");

const generateOtpCode = (length = 6) => {
  const max = 10 ** length;
  const min = 10 ** (length - 1);
  return String(Math.floor(Math.random() * (max - min)) + min);
};

const hashOtpCode = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

module.exports = {
  generateOtpCode,
  hashOtpCode
};
