const express = require("express");
const server = require("express")();
const routes = require("./routes");

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const library = require("./public/default.json");
console.debug(library);

server.use("/", routes);
server.set("view engine", "pug");
server.set("views", "./views");
server.use(express.static(path.join(__dirname, "public")));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));
server.use(cookieParser);

server.listen(3000);