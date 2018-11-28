const express = require("express")();
const Coors = require("../src/main");
const { express: coors } = Coors();
express.use(coors);
express.get("/", (req, res) => res.send("Hello World!"));
express.listen(8080);
