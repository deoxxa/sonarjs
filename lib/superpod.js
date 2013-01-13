var events = require("events"),
    util = require("util");

var Dolphin = require("./dolphin"),
    Pod = require("./pod");

var Superpod = module.exports = function Superpod() {
  events.EventEmitter.call(this);

  this.dolphins = Object.create(null);
  this.pods = Object.create(null);
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

    if (typeof this.dolphins[to] === "undefined" && this.pods[to] === "undefined") {
      this.emit("log", "debug", "trying to send message to nonexistent target", {from: dolphin.id, to: to});
      return;
    }

    if (this.dolphins[to]) {
      this.emit("log", "debug", "found correct target dolphin, sending message", {from: dolphin.id, to: to});
      this.dolphins[to].message(to, dolphin.id, message);
    }

    if (this.pods[to]) {
      this.emit("log", "debug", "found correct target pod, sending message", {from: dolphin.id, to: to});
      this.pods[to].message(to, dolphin.id, message);
    }
  }.bind(this));

  dolphin.on("join", function(id) {
    this.emit("log", "debug", "dolphin trying to join pod", {dolphin: dolphin.id, pod: id});

    if (typeof this.pods[id] === "undefined") {
      this.emit("log", "debug", "trying to join nonexistent pod", {dolphin: dolphin.id, pod: id});
      this.pods[id] = new Pod(id);
    }

    this.pods[id].join(dolphin);
  }.bind(this));

  dolphin.on("part", function(id) {
    this.emit("log", "debug", "dolphin trying to part pod", {dolphin: dolphin.id, pod: id});

    if (typeof this.pods[id] === "undefined") {
      this.emit("log", "debug", "trying to part nonexistent pod", {dolphin: dolphin.id, pod: id});
      return;
    }

    this.pods[id].part(dolphin);
  }.bind(this));
};
