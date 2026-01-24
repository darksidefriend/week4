const express = require("express");
const Busboy = require("busboy");
const { privateDecrypt, constants } = require("crypto");

const app = express();

/**
 * /login — просто логин
 */
app.get("/login", (req, res) => {
  res.type("text/plain").send("daniil_savelev");
});

/**
 * /decypher — multipart/form-data
 */
app.post("/decypher", (req, res) => {
  const contentType = req.headers["content-type"];
  if (!contentType || !contentType.includes("multipart/form-data")) {
    res.status(400).type("text/plain").send("Content-Type must be multipart/form-data");
    return;
  }

  const busboy = Busboy({ headers: req.headers });

  let privateKey = null;
  let secretData = null;

  busboy.on("file", (fieldname, file) => {
    const chunks = [];
    file.on("data", chunk => chunks.push(chunk));
    file.on("end", () => {
      const buf = Buffer.concat(chunks);
      if (fieldname === "key") privateKey = buf.toString("utf8");
      if (fieldname === "secret") secretData = buf;
    });
  });

  busboy.on("field", (fieldname, value) => {
    if (fieldname === "key") privateKey = value;
    if (fieldname === "secret") secretData = Buffer.from(value, "utf8");
  });

  busboy.on("finish", () => {
    if (!privateKey || !secretData) {
      res.status(400).type("text/plain").send('Missing fields "key" or "secret"');
      return;
    }

    try {
      // Проверка base64
      const s = secretData.toString("utf8").replace(/\s+/g, "");
      const isBase64 = /^[A-Za-z0-9+/=]+$/.test(s);
      const ciphertext = isBase64 ? Buffer.from(s, "base64") : secretData;

      let decrypted;
      try {
        decrypted = privateDecrypt(
          { key: privateKey, padding: constants.RSA_PKCS1_OAEP_PADDING },
          ciphertext
        );
      } catch {
        decrypted = privateDecrypt(
          { key: privateKey, padding: constants.RSA_PKCS1_PADDING },
          ciphertext
        );
      }

      res.type("text/plain").send(decrypted.toString("utf8"));
    } catch (err) {
      res.status(400).type("text/plain").send("Decryption failed: " + err.message);
    }
  });

  req.pipe(busboy);
});

// Render-compatible порт
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
