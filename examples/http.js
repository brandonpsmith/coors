const http = require("http");
const Coors = require("../src/main");
const { http: coors } = Coors();

const server = http.createServer((req, res) => {
  coors(req, res);
  res.end("Hello World!");
});

server.listen(8080);
