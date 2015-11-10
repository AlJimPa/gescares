//GET /dishes
exports.index = function(req, res) {
	/*
	var userAgent = req['headers']['user-agent'];
	var isMobile = userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
	*/
	//TODO get dish list from database
	res.render('dishes/index.ejs', {errors: []});
};

//GET /dishes/new //TODO add parameters: new dish object, get types, categories, etc.
exports.new = function(req, res) {
	var dish = {};
	res.render('dishes/new.ejs', {dish: dish, errors: []});
};

//GET /dishes/show //TODO - remove next and move dishId to an autoload function
exports.show = function(req, res) {
	res.render('dishes/show.ejs', {dish: req.dish, dishId: req.params.dishId, errors: []});
};

//POST /dishes/create
exports.create = function(req, res) {
	console.log(req.body);
	//TODO model validation and persistence of data
	res.redirect('/dishes');
};

//GET /dishes/edit
exports.edit = function(req, res) {
	//TODO retrieve data from model and pass it to the next page
	res.render('dishes/edit.ejs', {dish: req.dish, errors: []});
};

//PUT /dishes/update
exports.update = function(req, res) {
	//TODO model validation and persistence of data
	res.redirect('/dishes');
};
