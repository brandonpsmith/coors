<img src="https://raw.githubusercontent.com/brandonpsmith/art/master/coors/logo.png" width="50"/>

_**Coors**_ — Install and grab a cold one. CORS support for ...

[http](https://nodejs.org/api/http.html) | [micro](https://github.com/zeit/micro) | [fastify](https://github.com/fastify/fastify) | [express](https://github.com/expressjs/express/) | [koa](https://github.com/koajs/koa) | [hapi](https://github.com/hapijs/hapi)

## Installation

```bash
npm install --save coors
```

## Usage

```js
const Coors = require("coors");
const coors = Coors();
```

#### http

```js
const http = require("http");

const server = http.createServer((req, res) => {
  coors.http(req, res);
  res.end("Hello World!");
});

server.listen(8080);
```

#### micro

```js
const { send } = (micro = require("micro"));
const server = micro(coors.micro((req, res) => send(res, 200, "Hello World!")));
server.listen(8080);
```

#### fastify

```js
const fastify = require("fastify")();
fastify.use(coors.fastify);
fastify.get("/", (req, res) => res.send("Hello World!"));
fastify.listen(8080);
```

#### express

```js
const express = require("express")();
express.use(coors.express);
express.get("/", (req, res) => res.send("Hello World!"));
express.listen(8080);
```

#### koa

```js
const koa = new (require("koa"))();
koa.use(coors.koa);
koa.use(ctx => (ctx.body = "Hello World!"));
koa.listen(8080);
```

#### hapi

```js
const Hapi = require("hapi");
const server = Hapi.server({ host: "localhost", port: 8080 });

server.route({
  method: "GET",
  path: "/",
  handler: (request, h) => "Hello, World!"
});

(async () => {
  await server.register(coors.hapi.plugin);
  await server.start();
})();
```

## Options

- `allowOrigin`: Configures the **Access-Control-Allow-Origin** CORS header. Possible values:
  - `boolean` - set `allowOrigin` to `true` to reflect the [request origin](http://tools.ietf.org/html/draft-abarth-origin-09), as defined by the `Origin` header or set it to `false` to disable CORS.
  - `string` - set `allowOrigin` to a specific origin. For example if you set it to `"http://example.com"` only requests from "http://example.com" will be allowed.
  - `RegExp` - set `allowOrigin` to a regular expression pattern which will be used to test the request origin. If it's a match, the request origin will be reflected. For example the pattern `/example\.com$/` will reflect any request that is coming from an origin ending with "example.com".
  - `Array` - set `allowOrigin` to an array of valid origins. Each origin can be a `string` or a `RegExp`. For example `["http://example1.com", /\.example2\.com$/]` will accept any request from "http://example1.com" or from a subdomain of "example2.com".
- `allowMethods`: Configures the **Access-Control-Allow-Methods** CORS header. Expects a comma-delimited string (ex: "GET,PUT,POST") or an array (ex: `["GET", "PUT", "POST"]`).
- `allowedHeaders`: Configures the **Access-Control-Allow-Headers** CORS header. Expects a comma-delimited string (ex: 'Content-Type,Authorization') or an array (ex: `['Content-Type', 'Authorization']`). If not specified, defaults to the request's **Access-Control-Request-Headers** header.
- `exposedHeaders`: Configures the **Access-Control-Expose-Headers** CORS header. Expects a comma-delimited string (ex: 'Content-Range,X-Content-Range') or an array (ex: `['Content-Range', 'X-Content-Range']`). If not specified, no custom headers are exposed.
- `allowCredentials`: Configures the **Access-Control-Allow-Credentials** CORS header. Set to `true` to pass the header, otherwise it is omitted.
- `maxAge`: Configures the **Access-Control-Max-Age** CORS header. Set to an integer in seconds to pass the header, otherwise it is omitted.
- `preflight`: Pass the CORS preflight response to the next handler.
- `statusCode`: Provides a status code to use for successful `OPTIONS` requests, since some legacy browsers (IE11, various SmartTVs) choke on `204`.
