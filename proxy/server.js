#!/usr/bin/env node

var http = require("http")

var golinkHost = process.env.GOLINKHOST

var server = http.createServer(function(req, res) {
  res.writeHead(301, { Location: golinkHost + req.url })
  res.end()
})

server.listen(80)
