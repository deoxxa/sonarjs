#!/bin/sh

openssl genrsa -out server.key 1024;
while true; do echo; done | openssl req -new -key server.key -out server.csr;
openssl x509 -req -in server.csr -signkey server.key -out server.crt;
openssl pkcs12 -export -password pass: -in server.crt -inkey server.key -certfile server.crt -out server.pfx;
