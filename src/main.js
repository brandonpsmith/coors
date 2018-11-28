const isOriginAllowed = (origin, allowOrigin) => {
  if (typeof allowOrigin === "string") {
    return origin === allowOrigin;
  }

  if (allowOrigin instanceof RegExp) {
    return allowOrigin.test(origin);
  }

  if (typeof allowOrigin === "boolean") {
    return allowedOrigin;
  }

  if (Array.isArray(allowOrigin) && allowOrigin.length >= 1) {
    for (const i = 0; i < allowOrigin.length; i++) {
      return isOriginAllowed(origin, allowOrigin[i]);
    }
  }

  return false;
};

const getOrigin = (origin, allowOrigin) => {
  if (allowOrigin === undefined || allowOrigin === null || (typeof allowOrigin === "string" && allowOrigin.trim() === "")) {
    return [{ name: "Access-Control-Allow-Origin", value: "*" }];
  }

  if (typeof allowOrigin === "string") {
    return [{ name: "Access-Control-Allow-Origin", value: allowOrigin }, { name: "Vary", value: "Origin" }];
  }

  if (isOriginAllowed(origin, allowOrigin)) {
    return [{ name: "Access-Control-Allow-Origin", value: origin }, { name: "Vary", value: "Origin" }];
  }

  return [];
};

const getAllowHeaders = (accessControlRequestHeaders, allowHeaders) => {
  const headers = Array.isArray(allowHeaders) && allowHeaders.length >= 1 ? allowHeaders.join(",") : allowHeaders;

  if (typeof headers === "string") {
    return [{ name: "Access-Control-Allow-Headers", value: headers }];
  }

  if (typeof accessControlRequestHeaders === "string") {
    return [{ name: "Access-Control-Allow-Headers", value: accessControlRequestHeaders }, { name: "Vary", value: "Access-Control-Request-Headers" }];
  }

  return [];
};

const getAllowMethods = allowMethods => {
  const value = Array.isArray(allowMethods) && allowMethods.length >= 1 ? allowMethods.map(m => m.toUpperCase()).join(",") : allowMethods;
  return [{ name: "Access-Control-Allow-Methods", value: typeof value === "string" ? value : "GET,POST,PUT,PATCH,DELETE,HEAD" }];
};

const getExposeHeaders = exposeHeaders => {
  const value = Array.isArray(exposeHeaders) && exposeHeaders.length >= 1 ? exposeHeaders.join(",") : exposeHeaders;
  return typeof value === "string" ? [{ name: "Access-Control-Expose-Headers", value }] : [];
};

const getAllowCredentials = allowCredentials => (typeof allowCredentials === "boolean" && allowCredentials === true ? [{ name: "Access-Control-Allow-Credentials", value: "true" }] : []);
const getMaxAge = maxAge => (typeof maxAge === "number" && maxAge >= -1 ? [{ name: "Access-Control-Max-Age", value: maxAge.toString() }] : []);

/**
 * CORS
 *
 * @param {Object} options
 * @param {(boolean|string|RegExp|string[]|RegExp[])} [options.allowOrigin="*"] `Access-Control-Allow-Origin`
 * @param {string|string[]} [options.allowMethods="GET,POST,PUT,PATCH,DELETE,HEAD"] `Access-Control-Allow-Methods`
 * @param {string|string[]} options.allowHeaders `Access-Control-Allow-Headers`
 * @param {string|string[]} options.exposeHeaders `Access-Control-Expose-Headers`
 * @param {boolean} options.allowCredentials `Access-Control-Allow-Credentials`
 * @param {number} options.maxAge `Access-Control-Max-Age` in seconds
 * @param {boolean} [options.preflight=false] OPTIONS request - if false (default) the request is returned immediately. if true the request continues. https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
 * @param {number} [options.statusCode=204] OPTIONS response - status code
 */
module.exports = ({ allowOrigin, allowMethods, allowHeaders, exposeHeaders, allowCredentials, maxAge, preflight, statusCode } = {}) => {
  const getHeaders = (options, origin, accessControlRequestHeaders) => {
    const headers = [];

    headers.push(...getOrigin(origin, allowOrigin));
    headers.push(...getAllowCredentials(allowCredentials));
    headers.push(...getExposeHeaders(exposeHeaders));

    if (options) {
      headers.push(...getAllowMethods(allowMethods));
      headers.push(...getAllowHeaders(accessControlRequestHeaders, allowHeaders));
      headers.push(...getMaxAge(maxAge));
    }

    return headers;
  };

  // Node HTTP https://nodejs.org/api/http.html
  // IncomingMessage https://nodejs.org/api/http.html#http_class_http_incomingmessage
  // ServerResponse https://nodejs.org/api/http.html#http_class_http_serverresponse
  const http = (req, res) => {
    const options = req.method && req.method.toUpperCase() === "OPTIONS";
    const headers = getHeaders(options, req.headers["origin"], req.headers["access-control-request-headers"]);
    headers.forEach(({ name, value }) => res.setHeader(name, value));

    if (options && preflight !== true) {
      res.statusCode = typeof statusCode === "number" ? statusCode : 204;
      res.setHeader("Content-Length", "0");
      res.end();
      return false;
    }

    return true;
  };

  const micro = next => async (req, res) => {
    if (http(req, res)) await next(req, res);
  };

  const fastify = async (req, res, next) => {
    if (http(req, res)) await next();
  };

  const express = async (req, res, next) => {
    if (http(req, res)) await next();
  };

  const koa = async ({ req, res }, next) => {
    if (http(req, res)) await next();
  };

  const hapiHandler = (request, h) => {
    const options = request.method && request.method.toUpperCase() === "OPTIONS";
    const headers = getHeaders(options, request.headers["origin"], request.headers["access-control-request-headers"]);
    const response = request.response.isBoom ? request.response.output : request.response;
    headers.forEach(({ name, value }) => (response.headers[name] = value));

    if (options && preflight === true) {
      response.statusCode = typeof statusCode === "number" ? statusCode : 204;
      response.headers["Content-Length"] = "0";
      return h.close;
    }

    return h.continue;
  };

  const hapiPlugin = {
    pkg: require("../package.json"),
    register: server => {
      server.ext("onPreResponse", hapiHandler);
    }
  };

  return { http, micro, fastify, express, koa, hapi: { handler: hapiHandler, plugin: hapiPlugin } };
};
