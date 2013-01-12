var events = require("events"),
    util = require("util");

var Dolphin = require("./dolphin");

var Superpod = module.exports = function Superpod() {
  events.EventEmitter.call(this);

  this.dolphins = Object.create(null);
};
util.inherits(Superpod, events.EventEmitter);

Superpod.prototype.onConnection = function onConnection(socket) {
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
    this.emit("log", "debug", "got message from dolphin", {from: dolphin.id, to: to, message: message});

    if (typeof this.dolphins[to] === "undefined") {
      this.emit("log", "debug", "trying to send message to nonexistent dolphin", {from: dolphin.id, to: to});
      return;
    }

    this.emit("log", "debug", "found correct target dolphin, sending message", {from: dolphin.id, to: to});

    this.dolphins[to].message(dolphin.id, message);
  }.bind(this));
};
