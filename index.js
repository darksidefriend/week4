// // index.js
// import express from "express";
// import { createReadStream } from "fs";
// import crypto from "crypto";
// import http from "http";
// import bodyParser from "body-parser";

// import appSrc from "./app.js";

// const app = appSrc(express, bodyParser, createReadStream, crypto, http);

// app.listen(3000);

// index.js
const express = require("express");
const bodyParser = require("body-parser");
const { createReadStream } = require("fs");
const path = require("path");

const { createApp } = require("./app");

const PORT = process.env.PORT || 3000;

const app = createApp(
  express,
  bodyParser,
  createReadStream,
  path.resolve(__filename)
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
