var config = module.exports = {};

//host config
config.env = 'default';
config.port = process.env.PORT;

//routes

//app settings
config.defaultCurrency = 'EUR';
config.modelSamplesDir = './models/samples/';
config.splitSeparator = '_'; //character to be used as delimiter/separator with split function
config.useJSDeviceDetection = false; //use Javascript devide detection instead of media queries
//default database connection
config.dataBaseURL = process.env.DATABASE_URL;
config.dataBaseStorage = process.env.DATABASE_STORAGE;
//config.dataBaseUseSSL = true; //use for local test with remote Postgres, like Heroku
//config.dataBaseInitialSequenceId = 1000;//Add this integer to id's specified on sample data, so new elements should not have unique id exceptions (Postgresql, sequence starts at 1). TODO doesn't seem to work, remove after refactoring creation/update functions from controller and using them at database initialization
