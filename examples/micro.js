const { send } = (micro = require("micro"));
const Coors = require("../src/main");
const { micro: coors } = Coors();
const server = micro(coors((req, res) => send(res, 200, "Hello World!")));
server.listen(8080);
