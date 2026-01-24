
// // app.js
// const fs = require("fs");
// const crypto = require("crypto");
// const http = require("http");

// const CORS_HEADERS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
//   "Access-Control-Allow-Headers": "*",
// };

// const TEXT_PLAIN_HEADER = {
//   "Content-Type": "text/plain; charset=utf-8",
// };

// const SYSTEM_LOGIN = "23886bd5-1b0d-4860-8ed8-d9106051b1a1";

// /** Middleware для CORS */
// function corsMiddleware(req, res, next) {
//   res.set(CORS_HEADERS);
//   if (req.method === "OPTIONS") return res.sendStatus(204);
//   next();
// }

// /** Чтение файла через поток */
// function readFileAsync(filePath, createReadStream) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];
//     const stream = createReadStream(filePath);

//     stream.on("data", (chunk) => chunks.push(chunk));
//     stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
//     stream.on("error", (err) => reject(err));
//   });
// }

// /** Генерация SHA1 хеша */
// function generateSha1Hash(text) {
//   return crypto.createHash("sha1").update(text).digest("hex");
// }

// /** Чтение данных из HTTP-ответа */
// function readHttpResponse(response) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];
//     response.on("data", (chunk) => chunks.push(chunk));
//     response.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
//     response.on("error", (err) => reject(err));
//   });
// }

// /** Универсальная функция для GET-запроса по URL */
// async function fetchUrlData(url) {
//   return new Promise((resolve, reject) => {
//     http.get(url, async (response) => {
//       try {
//         const data = await readHttpResponse(response);
//         resolve(data);
//       } catch (err) {
//         reject(err);
//       }
//     }).on("error", reject);
//   });
// }

// /** Создание Express-приложения */
// function createApp(express, bodyParser, createReadStream, currentFilePath) {
//   const app = express();

//   app.use(bodyParser.urlencoded({ extended: false }));
//   app.use(bodyParser.json());
//   app.use(corsMiddleware);

//   // Возвращает системный логин
//   app.get("/login/", (_req, res) => {
//     res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
//   });

//   // Возвращает содержимое текущего файла
//   app.get("/code/", async (_req, res) => {
//     const fileContent = await readFileAsync(currentFilePath, createReadStream);
//     res.set(TEXT_PLAIN_HEADER).send(fileContent);
//   });

//   // Возвращает SHA1 хеш переданного параметра
//   app.get("/sha1/:input/", (req, res) => {
//     const hash = generateSha1Hash(req.params.input);
//     res.set(TEXT_PLAIN_HEADER).send(hash);
//   });

//   // GET /req/?addr=<url>
//   app.get("/req/", async (req, res) => {
//     try {
//       const data = await fetchUrlData(req.query.addr);
//       res.set(TEXT_PLAIN_HEADER).send(data);
//     } catch (err) {
//       res.status(500).send(err.toString());
//     }
//   });

//   // POST /req/ с JSON { addr: <url> }
//   app.post("/req/", async (req, res) => {
//     try {
//       const data = await fetchUrlData(req.body.addr);
//       res.set(TEXT_PLAIN_HEADER).send(data);
//     } catch (err) {
//       res.status(500).send(err.toString());
//     }
//   });

//   // Любой другой маршрут возвращает системный логин
//   app.all(/.*/, (_req, res) => {
//     res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
//   });

//   return app;
// }

// module.exports = { createApp, SYSTEM_LOGIN };


// app.js
const crypto = require("crypto");
const http = require("http");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
  "Access-Control-Allow-Headers": "*",
};

const TEXT_PLAIN_HEADER = {
  "Content-Type": "text/plain; charset=utf-8",
};

const SYSTEM_LOGIN = "23886bd5-1b0d-4860-8ed8-d9106051b1a1";

function corsMiddleware(req, res, next) {
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
}

function readFileAsync(filePath, createReadStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const stream = createReadStream(filePath);

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf8"))
    );
    stream.on("error", reject);
  });
}

function generateSha1Hash(text) {
  return crypto.createHash("sha1").update(text).digest("hex");
}

function readHttpResponse(response) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    response.on("data", (c) => chunks.push(c));
    response.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf8"))
    );
    response.on("error", reject);
  });
}

function fetchUrlData(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, async (response) => {
        try {
          resolve(await readHttpResponse(response));
        } catch (e) {
          reject(e);
        }
      })
      .on("error", reject);
  });
}

function createApp(express, bodyParser, createReadStream, currentFilePath) {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(corsMiddleware);

  app.get("/login/", (_req, res) => {
    res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
  });

  app.get("/code/", async (_req, res) => {
    const content = await readFileAsync(currentFilePath, createReadStream);
    res.set(TEXT_PLAIN_HEADER).send(content);
  });

  app.get("/sha1/:input/", (req, res) => {
    res
      .set(TEXT_PLAIN_HEADER)
      .send(generateSha1Hash(req.params.input));
  });

  app.get("/req/", async (req, res) => {
    try {
      res.set(TEXT_PLAIN_HEADER).send(
        await fetchUrlData(req.query.addr)
      );
    } catch (e) {
      res.status(500).send(e.toString());
    }
  });

  app.post("/req/", async (req, res) => {
    try {
      res.set(TEXT_PLAIN_HEADER).send(
        await fetchUrlData(req.body.addr)
      );
    } catch (e) {
      res.status(500).send(e.toString());
    }
  });

  app.all(/.*/, (_req, res) => {
  res.set(TEXT_PLAIN_HEADER).send(SYSTEM_LOGIN);
});

  return app;
}

module.exports = { createApp };
