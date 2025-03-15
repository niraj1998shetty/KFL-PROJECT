const winston = require('winston');
 
const logger = winston.createLogger({

  level: 'info', // Logging level (error, warn, info, http, verbose, debug, silly)

  format: winston.format.combine(

    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),

    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)

  ),

  transports: [

    new winston.transports.Console(), // Log to console

    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Log only errors

    new winston.transports.File({ filename: 'logs/combined.log' }) // Log all levels

  ]

});
 
module.exports = logger;

 