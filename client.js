#!/usr/bin/env node

const genModule = require('./dist/scripts/genModule')

const args = process.argv.slice(2)

const ACTION_MAP = {
  module: genModule,
}

function execFunction(func, ...params) {
  if (typeof func === 'function') {
    return func(...params)
  }
}

const [commond, ...params] = args

execFunction(ACTION_MAP[commond], ...params)
