var JSpit = require("jspit"),
    JSuck = require("jsuck"),
    Steez = require("steez"),
    util = require("util");

function Dolphin(stream, id) {
  Steez.call(this);

  this.stream = stream;
  this.id = id;

  this.stream.pipe(new JSuck()).pipe(this).pipe(new JSpit()).pipe(this.stream);
};
util.inherits(Dolphin, Steez);

Dolphin.prototype.write = function write(data) {
  if (data.command === "message") {
    this.emit("message", data.to, data.message);
  }

  return !this.paused && this.writable;
};

Dolphin.prototype.message = function message(from, message) {
  this.emit("data", {command: "message", from: from, message: message});
};
