#!/usr/bin/env node

var events = require("events"),
    util = require("util");

var Pod = module.exports = function Pod() {
  events.EventEmitter.call(this);

  this.dolphins = Object.create(null);
};
util.inherits(Pod, events.EventEmitter);

Pod.prototype.onConnection = function onConnection(socket) {
  this.emit("log", "info", "got connection", {from: {host: socket.remoteAddress, port: socket.remotePort}});

  var cert = socket.getPeerCertificate();

  if (!cert || !cert.fingerprint) {
    this.emit("log", "warn", "invalid or missing certificate", {from: {host: socket.remoteAddress, port: socket.remotePort}});

    return socket.end();
  }

  var dolphin = new Dolphin(socket, cert.fingerprint);

  this.emit("log", "info", "registered dolphin", {id: dolphin.id});

  this.dolphins[dolphin.id] = dolphin;

  var onEnd = function onEnd() {
    if (typeof this.dolphins[dolphin.id] === "undefined") {
      return;
    }

    this.emit("log", "info", "dolphin disconnected", {id: dolphin.id});

    delete this.dolphins[dolphin.id];
  }.bind(this);

  socket.on("end", onEnd);
  socket.on("error", onEnd);

  dolphin.on("log", this.emit.bind(this, "log"));

  dolphin.on("message", function(to, message) {
    if (typeof this.dolphins[to] === "undefined") {
      return;
    }

    this.dolphins[to].message(dolphin.id, message);
  });
};