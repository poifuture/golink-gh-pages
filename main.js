#!/usr/bin/env node
const main = require("./lib/main")
main
  .default()
  .then(function() {
    console.log("Golink build done.")
  })
  .catch(function(error) {
    console.error(error)
  })
