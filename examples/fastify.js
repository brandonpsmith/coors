const fastify = require("fastify")();
const Coors = require("../src/main");
const { fastify: coors } = Coors();
fastify.use(coors);
fastify.get("/", (req, res) => res.send("Hello World!"));
fastify.listen(8080);
