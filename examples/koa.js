const koa = new (require("koa"))();
const Coors = require("../src/main");
const { koa: coors } = Coors();
koa.use(coors);
koa.use(ctx => (ctx.body = "Hello World!"));
koa.listen(8080);
