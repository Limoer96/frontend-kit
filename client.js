#!/usr/bin/env node

const genModule = require("./lib/scripts/module");

const args = process.argv.slice(2);

const ACTION_MAP = {
  module: genModule,
};

function execFunction(funcOrObject, ...params) {
  const func =
    typeof funcOrObject === "function" ? funcOrObject : funcOrObject.default;
  return func(...params);
}

const [command, ...params] = args;

execFunction(ACTION_MAP[command], ...params);
