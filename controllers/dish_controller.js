//TODO remove fs once database gets implemented
var fs = require('fs');
var dataDir = global.config.publicDataDir;
var dishDataDir = dataDir + 'dishes/';
//types and categories are constant; check files once, load objects
var types = JSON.parse(fs.readFileSync(dataDir + 'types.json', 'UTF-8'));
var categories = JSON.parse(fs.readFileSync(dataDir + 'categories.json', 'UTF-8'));
var componentHints = JSON.parse(fs.readFileSync(dataDir + 'componentHints.json', 'UTF-8'));
var allergenicHints = JSON.parse(fs.readFileSync(dataDir + 'allergenicHints.json', 'UTF-8'));

//Autoload
exports.load = function(req, res, next, dishId){
	//TEMP filesystem; //TODO implement database autoload
	var fileName = dishDataDir + dishId + '.json';
	fs.readFile(fileName, 'UTF-8', function(err, data){
		if (err !== undefined && err !== null){
			req.dish = null;
			next(new Error('dish file not found: ' + fileName));
		} else {
			req.dish = getDishFromFileData(data);
			next();
		}
	});
}

//GET /dishes
exports.index = function(req, res) {
	/*
	var userAgent = req['headers']['user-agent'];
	var isMobile = userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
	*/
	//TEMP - get data from files. TODO get dish list from database
	var files = fs.readdirSync(dishDataDir);
	var dishes = [];
	for (var i = 0; i < files.length; i++){
		var data = fs.readFileSync(dishDataDir + files[i], 'UTF-8');
		dishes[i] = getDishFromFileData(data);
	}
	res.render('dishes/index.ejs', {dishes: dishes, errors: []});
};

//GET /dishes/new //TODO add parameters: new dish object, get types, categories, etc.
exports.new = function(req, res) {
	var dish = {};
	res.render('dishes/new.ejs', {dish: dish, types: types, categories: categories, componentHints: componentHints, allergenicHints: allergenicHints, errors: []});
};

//GET /dishes/show //TODO - remove next and move dishId to an autoload function
exports.show = function(req, res) {
	//TEMP - get data from file; TODO - use database
	res.render('dishes/show.ejs', {dish: req.dish, errors: []});
};

//POST /dishes/create
exports.create = function(req, res) {
	console.log(req.body);
	//TODO model validation and persistence of data
	writeDishOnDisk(req.body.dish);
	res.redirect('/dishes');
};

//GET /dishes/edit
exports.edit = function(req, res) {	
	//TODO retrieve data from model and pass it to the next page
	res.render('dishes/edit.ejs', {dish: req.dish, types: types, categories: categories, componentHints: componentHints, allergenicHints: allergenicHints, errors: []});
};

//PUT /dishes/update
exports.update = function(req, res) {
	//TODO model validation and persistence of data
	writeDishOnDisk(req.body.dish);
	res.redirect('/dishes');
};


//AUX
function getDishFromFileData(data) {
	var dish = JSON.parse(data);	
	//TEMP simulate join sentence - set type and categories subobjects; will crash if files are not well formed
	dish.Type = {'id': dish.type, 'text': types[dish.type]};
	dish.Categories = [];	
	for (var i = 0; i < dish.categories.length; i++) {
		var categoryId = dish.categories[i];
		dish.Categories.push({'id': categoryId, 'text': categories[categoryId]});
	}
	return dish;
};

function writeDishOnDisk(pDish) {
	var dish = {};
	if (pDish.id !== undefined && pDish.id !== "undefined"){
		dish.id = pDish.id;
	} else {
		//dish.id = # of files at dir
		var files = fs.readdirSync(dishDataDir);
		dish.id = files.length + 1;
	}
	dish.name = pDish.name;
	dish.type = +pDish.type;
	dish.description = pDish.description;
	//TODO check on console a create POST with all data, complete the dish object and uncomment writeFile
	//dish[categories]
	dish.categories = [];
	if (pDish.categories !== undefined){
		if (typeof(pDish.categories) === "string")
			dish.categories.push(pDish.categories);
		else
			dish.categories = pDish.categories; 
		//categories are id's but are contained as strings
		for (var i = 0; i < dish.categories.length; i++){ //cast categories to number
			dish.categories[i] = +dish.categories[i];
		}
	}
	//dish[components]
	dish.components = [];
	if (pDish.components !== undefined) {
		if (typeof(pDish.components) === "string")
			dish.components.push(pDish.components);
		else
			dish.components = pDish.components;
	}
	//dish[allergenics]
	dish.allergenics = [];
	if (pDish.allergenics !== undefined) {
		if (typeof(pDish.allergenics) === "string")
			dish.allergenics.push(pDish.allergenics);
		else
			dish.allergenics = pDish.allergenics;
	}
	//dish[Prices]
	dish.Prices = [];
	if (pDish.Prices !== undefined) {
		console.log(JSON.stringify(pDish.Prices));
		dish.Prices = pDish.Prices;
		//will not cast prices from String to number, as they might combine signs (initial +)
	}
	//dish[Images]
	dish.Images = [];
	if (pDish.Images !== undefined) {
		console.log(JSON.stringify(pDish.Images));
		for (var i = 0; i < pDish.Images.length; i++){
			var image = {};
			image.source = pDish.Images[i].source;
			if (image.link !== '')
				image.link = pDish.Images[i].link;
			else
				image.link = pDish.Images[i].source;
			image.description = pDish.Images[i].description;
			dish.Images.push(image);
		}
		//use first Image as presentation image
		dish.imageSource = dish.Images[0].source;
		dish.imageLink = dish.Images[0].link;
		dish.imageDescription = dish.Images[0].description;
	} else {
		//default data
		dish.imageSource = '';
		dish.imageLink = '';
		dish.imageDescription = 'Imágen no disponible';
	}
	//write or update file
	fs.writeFile(dishDataDir + dish.id + '.json', JSON.stringify(dish), function(err){
		if (err)
			console.log(err);			
	});
};
