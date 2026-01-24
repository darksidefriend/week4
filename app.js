export default function createApp(
  express,
  bodyParser,
  createReadStream,
  crypto,
  http
) {
  const app = express();

  const SYSTEM_LOGIN = "23886bd5-1b0d-4860-8ed8-d9106051b1a1";

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,OPTIONS,POST,PUT"
    );
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get("/login/", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(SYSTEM_LOGIN);
  });

  app.get("/code/", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");

    const chunks = [];
    const stream = createReadStream(new URL(import.meta.url));

    stream.on("data", (c) => chunks.push(c));
    stream.on("end", () =>
      res.end(Buffer.concat(chunks).toString("utf8"))
    );
  });

  app.get("/sha1/:input/", (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(
      crypto.createHash("sha1").update(req.params.input).digest("hex")
    );
  });

  function fetchUrl(url) {
    return new Promise((resolve, reject) => {
      http
        .get(url, (response) => {
          const chunks = [];
          response.on("data", (c) => chunks.push(c));
          response.on("end", () =>
            resolve(Buffer.concat(chunks).toString("utf8"))
          );
        })
        .on("error", reject);
    });
  }

  app.get("/req/", async (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    try {
      res.end(await fetchUrl(req.query.addr));
    } catch (e) {
      res.statusCode = 500;
      res.end(e.toString());
    }
  });

  app.post("/req/", async (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    try {
      res.end(await fetchUrl(req.body.addr));
    } catch (e) {
      res.statusCode = 500;
      res.end(e.toString());
    }
  });

  app.all(/.*/, (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end(SYSTEM_LOGIN);
  });

  return app;
}
