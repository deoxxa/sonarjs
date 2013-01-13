var JSpit = require("jspit"),
    JSuck = require("jsuck"),
    Steez = require("steez"),
    util = require("util");

var Dolphin = module.exports = function Dolphin(stream, id) {
  Steez.call(this);

  this.stream = stream;
  this.id = id;

  this.stream.pipe(new JSuck()).pipe(this).pipe(new JSpit()).pipe(this.stream);
};
util.inherits(Dolphin, Steez);

Dolphin.prototype.write = function write(data) {
  this.emit("log", "debug", "got data", {dolphin: this.id, data: data});

  if (data.command === "message") {
    this.emit("message", data.to, data.message);
  }

  if (data.command === "join") {
    this.emit("join", data.pod);
  }

  if (data.command === "part") {
    this.emit("part", data.pod);
  }

  return !this.paused && this.writable;
};

Dolphin.prototype.message = function message(to, from, message) {
  this.emit("log", "debug", "trying to send message from other source", {dolphin: this.id, to: to, from: from, message: message});

  this.emit("data", {command: "message", to: to, from: from, message: message});
};
