#!/usr/bin/env node

var fs = require("fs"),
    path = require("path"),
    tls = require("tls"),
    winston = require("winston");

var Superpod = require("../lib/superpod");

var superpod = new Superpod();

superpod.on("log", winston.log.bind(winston));

var options = {
  pfx: fs.readFileSync(path.join(__dirname, "..", "server.pfx")),
  requestCert: true,
};

var server = tls.createServer(options, superpod.onConnection.bind(superpod));

server.listen(40404, function() {
  winston.info("server listening", {address: this.address().address, port: this.address().port});
});
