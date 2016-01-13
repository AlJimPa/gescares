var config = module.exports = {};

//host config
config.env = 'default';
config.port = 3000;

//routes

//app settings
config.defaultCurrency = 'EUR';
config.modelSamplesDir = './models/samples/';
config.splitSeparator = '_'; //character to be used as delimiter/separator with split function
config.useJSDeviceDetection = false; //use Javascript devide detection instead of media queries
//default database connection
config.dataBaseURL = process.env.DATABASE_URL;
config.dataBaseStorage = process.env.DATABASE_STORAGE;