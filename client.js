#!/usr/bin/env node

const genModule = require('./lib/scripts/genModule')

const args = process.argv.slice(2)

const ACTION_MAP = {
  module: genModule,
}

function execFunction(func, ...params) {
  if (typeof func === 'function') {
    return func(...params)
  }
}

const [command, ...params] = args

execFunction(ACTION_MAP[command], ...params)

