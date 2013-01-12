#!/usr/bin/env node

var fs = require("fs"),
    path = require("path"),
    tls = require("tls"),
    winston = require("winston");

var Pod = require("../lib/pod");

var pod = new Pod();

var options = {
  pfx: fs.readFileSync(path.join(__dirname, "..", "server.pfx")),
  requestCert: true,
};

var server = tls.createServer(options, pod.onConnection.bind(pod));

server.listen(40404, function() {
  winston.info("server listening", {address: this.address().address, port: this.address().port});
});
