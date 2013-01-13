var events = require("events"),
    util = require("util");

var Pod = module.exports = function Pod(id) {
  events.EventEmitter.call(this);

  this.id = id;

  this.dolphins = [];
};
util.inherits(Pod, events.EventEmitter);

Pod.prototype.message = function message(to, from, message) {
  this.dolphins.forEach(function(dolphin) {
    dolphin.message(this.id, from, message);
  }.bind(this));
};

Pod.prototype.join = function join(dolphin) {
  this.dolphins.push(dolphin);

  dolphin.on("end", this.part.bind(this, dolphin));
};

Pod.prototype.part = function part(dolphin) {
  var i = this.dolphins.indexOf(dolphin);

  if (i !== -1) {
    this.dolphins.splice(i, 1);
  }
};
