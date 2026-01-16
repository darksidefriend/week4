
// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const http = require("http");

// const app = express();
// const PORT = process.env.PORT || 3000;

// const CORS = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
//   "Access-Control-Allow-Headers":
//     "x-test,ngrok-skip-browser-warning,Content-Type,Accept,Access-Control-Allow-Headers",
// };

// const s = http.createServer((req, res) => {
//   if (req.url === "/result4/") {
//     let body = "";

//     req.on("data", (chunk) => {
//       body += chunk;
//     });

//     req.on("end", () => {
//       let parsedBody = body;

//       res.writeHead(200, { ...CORS });

//       res.write(
//         JSON.stringify({
//           message: "23886bd5-1b0d-4860-8ed8-d9106051b1a1",
//           "x-result": req.headers["x-test"],
//           "x-body": String(parsedBody),
//         })
//       );

//       res.end();
//     });

//     return;
//   }

//   res.end();
// });

// s.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

const express = require('express');
const https = require('https');
const fs = require('fs');
const { DateTime } = require('luxon');

const app = express();
const PORT = process.env.PORT || 443;

// Маршрут /login
app.get('/login', (req, res) => {
    res.send('23886bd5-1b0d-4860-8ed8-d9106051b1a1');
});

// Маршрут /hour
app.get('/hour', (req, res) => {
    // Получаем текущее время в Московском часовом поясе
    const moscowTime = DateTime.now().setZone('Europe/Moscow');
    const hour = moscowTime.hour.toString().padStart(2, '0');
    res.send(hour);
});

// Опционально: обработка корневого маршрута
app.get('/', (req, res) => {
    res.send('Сервер работает. Доступные маршруты: /login, /hour');
});

// Для HTTPS нужны SSL сертификаты
// В продакшене используйте настоящие сертификаты
const options = {
    key: fs.readFileSync('key.pem'),  // Замените на путь к вашему приватному ключу
    cert: fs.readFileSync('cert.pem')  // Замените на путь к вашему сертификату
};

// Создаем HTTPS сервер
https.listen(PORT, () => {
    console.log(`HTTPS сервер запущен на порту ${PORT}`);
});