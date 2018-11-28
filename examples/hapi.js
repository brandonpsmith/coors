const Hapi = require("hapi");
const Coors = require("../src/main");
const { hapi: coors } = Coors();

const server = Hapi.server({ host: "localhost", port: 8080 });

server.route({
  method: "GET",
  path: "/",
  handler: (request, h) => "Hello, World!"
});

(async () => {
  await server.register(coors.plugin);
  await server.start();
})();
