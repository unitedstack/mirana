'use strict';

var winston = require('winston');
var logConfig = require('../config').log;
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.File)({
      name: 'errorLog',
      filename: logConfig.errorLog,
      level: 'error',
      json: false,
      timestamp: true
    })
  ]
});

module.exports = logger;
