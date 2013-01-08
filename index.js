var Stream = require('stream').Stream;
var util = require('util');

var Echo = function() {
  Stream.call(this);
  
  this.readable = true;
  this.writable = true;

  this.write = function(buffer) {
    console.log('echo: ' + buffer.toString().trim());
  };
};

util.inherits(Echo, Stream);

var echo = new Echo();

process.stdin.resume();
process.stdin.pipe(echo);
console.log("type happily...\n");
