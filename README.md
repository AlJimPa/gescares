#Gescares

Web application for restaurant menu presentation.

Uses Node, Express, Sequelize, Postgres (or SQLite for local testing) among other middleware.

Application sections include initial page, dish management, menu management, calendar management and credits page. At current stage, menu management and calendar management are not implemented yet.

Other functionality that should be implemented:
  * User management. Authentication and session.
  * Multi language. Current literals on views and sample data are in spanish only.
  * Master table management. Tables such as dish type or dish category have constant data - loaded from sample files. It would be interesting to be able to modify that data from application itself.
  * Currency management. Use a list with defined currency instead of free text; allow different prices based on currency for the same concept.
  * Local image upload. Raw image upload is not a priority, as it might not be usable, for example, in Heroku. Pending to check if database BLOBs or other structures might help.
  * Client command management for internal restaurant use. 

##Application sections

###Dish management
Displays dish list, allows to search in that list, check full dish data, and depending on permissions, create or edit a dish.

Dish list uses CSS media queries, so mobile devices should display an image of that dish instead of details. However, modern devices might allow higher resolutions, so standard view might apply - check for `useJSDeviceDetection` at configuration files to use Javascript detection instead of media queries.

Dish creation/edit form contains:
  * Dish name and description, as text data.
  * Dish type, as a single select control.
  * Dish categories, as a multiple select control.
  * Dish components and allergenics, as a multiple select control. Use upper text control to add new elements; it contains some element hints to allow faster selection. Notice that hints are loaded from sample data, but are not used as foreign keys, so hint management is not a priority.
  * Dish prices. Each price contains three fields: concept, price (as text, allows increment costs like "+0.45" for added components), and currency. Should be improved after currency management gets implemented.
  * Dish gallery. Contains a list of images and a preview area. Each image is composed of an image thumbnail, source URL, target URL and description. This forces to use external image resources, or upload them to public directory - latter won't work with application platforms such as Heroku. Image thumbnails are updated after updating source and changing focus to other control. To switch between images in preview area, click on image thumbnail.

###Menu management
Not implemented yet.

Shall contain different dish compositions, to be used with calendars. Should allow search with filters, or present views by category, type, etc.

###Calendar management
Not implemented yet.

Shall contain different menu compositions, and set availability - week days, holidays, etc.

##Installation and settings

###Installation
Requires node and npm. Steps: 

1. `git clone https://github.com/AlJimPa/gescares`

2. `cd gescares`

3. `npm install`

###Settings
File settings are found at `config` directory. File `config.global.js` has all available settings - some commented if they are not used on common scenarios. 

Notice that some settings are loaded from enviornment variables. An example of environment variables for local tests using sqlite:

`DATABASE_URL=sqlite://:@:/`

`DATABASE_STORAGE=gescares.sqlite`

`NODE_ENV=test`

`NODE_ENV` determines which config file shall be used. Sample config files are `config.production.js` and `config.test.js`. Both require `config.global.js`, and then redefine some settings. To switch between config files, update `NODE_ENV` environment variable; to create a new config file, filename should use `config.<name>.js` sintax.

Most setting variables are self-explanatory by their name; however, be sure to check comments on `config.global.js` for further info.

#####Port
Default port is set to 3000 if no environment variable nor config variable has been set.

#####Logger
This application makes use of a customized version of `log` middleware, originally created by TJ Holowaychuk. It allows simultaneous console and file output with different log levels, useful for local tests. Config variables `consoleLogLevel` and `consoleWriteTimestamp` allow usage of these customized version features.

Logs will be stored under `logs` directory at application root level.
