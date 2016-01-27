var fs = require('fs');
var logDirectory = __dirname + '/../logs/';  
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory); // ensure log directory exists 
var Log = require('./log');
var logger = {};
logger.createLogger = function createLogger(fileName){
	if (!fileName){
		return new Log(appGlobals.config.consoleLogLevel);
	} else {
		stream = fs.createWriteStream(logDirectory + fileName + '.log', {flags: 'a'});
		var consoleParameter = {
			level: appGlobals.config.consoleLogLevel,
			writeTimestamp: appGlobals.config.consoleWriteTimestamp
		};
		return new Log(appGlobals.config.logLevel, stream, consoleParameter);
	}
};

module.exports = logger;