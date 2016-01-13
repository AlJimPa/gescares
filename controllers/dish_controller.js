var models = require('../models/models.js');
var splitSeparator = appGlobals.config.splitSeparator;
//console text colors for test/error check purposes
var consoleTextColorRed = '\033[31m';
var consoleTextColorBlack = '\033[0m';

//Autoload
exports.load = function(req, res, next, dishId){
	models.Dish.findById(Number(dishId), {
		include: [
			{model: models.Type, attributes: ["text"]},
			{model: models.Category, attributes: ["id", "text"]},
			{model: models.DishComponent, attributes: ["id", "text"]},
			{model: models.DishAllergenic, attributes: ["id", "text"]},
			{model: models.Price, attributes: ["id", "concept", "price", "currency"]},
			{model: models.Image, attributes: ["id", "source", "link", "description"]}
		],
		order: ['Prices.id', 'Images.id'] //respect price and image order, as later ones might be additions/substracts
	}).then(
		function (result){
			if (result){
				req.dish = result;
				next();
			} else {
				next(new Error("No existe dishId " + dishId));
			}
		}
	).catch(
		function(error){
			next(error);
		}
	);
}

//GET /dishes
exports.index = function(req, res) {
	/*
	var userAgent = req['headers']['user-agent'];
	var isMobile = userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/);
	*/
	var query = {};
	if (req.query.search !== undefined) {
		var strWhere = "%" + req.query.search.replace(' ', '%') + "%";
		query.where = {name: { $like: strWhere}};
		query.order = ['name', 'Images.id'];
	}
	query.include = [
		{model: models.Type, attributes: ["text"]}, 
		{model: models.Category, attributes: ["text"]},
		{model: models.Image, attributes: ["source", "description"]}
	];
	models.Dish.findAll(query).then(
		function(results){
			res.render('dishes/index.ejs', 
					{dishes: results, query: req.query.search, errors: []});
		}
	);
};

//GET /dishes/new
exports.new = function(req, res) {
	newEdit(res, 'dishes/new.ejs', null);
};

//GET /dishes/show
exports.show = function(req, res) {
	res.render('dishes/show.ejs', {dish: req.dish, errors: []});
};

//POST /dishes/create
exports.create = function(req, res) {
	var objDish = responseToDish(req.body.dish);
	var dish = models.Dish.build(objDish);
	dish.sequelize.transaction({autocommit: false}, function(t){
		var dishId;
		//dish
		return models.Dish.create(objDish, {transaction: t}).then(
			function(dbDish){
				dishId = dbDish.id;
				dish = dbDish;
				return objDish.Categories.length;
			}
		).then(function(count){
			//dish[categories]
			return setCategories(dish, objDish, t);
		}).then(function(dbDishCategoryArray){
			//dish[components]
			var dishComponentArray = buildSubElementArray(objDish.DishComponents, dishId);
			return createDishSubElements(models.DishComponent, dishComponentArray, t);
		}).then(function(dbDishComponentArray){
			//dish[allergenics]
			var dishAllergenicArray = buildSubElementArray(objDish.DishAllergenics, dishId);			
			return createDishSubElements(models.DishAllergenic, dishAllergenicArray, t);
		}).then(function(dishAllergenicArray){
			//dish[Prices]
			var priceArray = buildSubElementArray(objDish.Prices, dishId);
			return createDishSubElements(models.Price, priceArray, t);
		}).then(function(priceArray){
			//dish[Images]
			var imageArray = buildSubElementArray(objDish.Images, dishId);
			return createDishSubElements(models.Image, imageArray, t);
		});
	}).then(function (param){
		res.redirect('/dishes');
	}).catch(function (err){
		createUpdateError(res, 'dishes/new.ejs', objDish, err);
	});
};

//GET /dishes/edit
exports.edit = function(req, res) {	
	newEdit(res, 'dishes/edit.ejs', req.dish);
};

//PUT /dishes/update
exports.update = function(req, res) {
	var objDish = responseToDish(req.body.dish);
	//console.log(consoleTextColorRed, '	UPDATE' + JSON.stringify(objDish) + consoleTextColorBlack);
	req.dish.sequelize.transaction({autocommit: false}, function(t){
		//dish
		req.dish.name = objDish.name;
		req.dish.description = objDish.description;
		req.dish.TypeId = objDish.TypeId;
		return req.dish.save({transaction: t}).then(function(result){
			//dish[categories]
			return setCategories(req.dish, objDish, t);
		}).then(function(result){
			//dish[components]
			return completeUpdateDishSubElements(models.DishComponent, req.dish.DishComponents, objDish.DishComponents, t, false, ["text", "DishId"]);
		}).then(function(result){
			//dish[allergenics]
			return completeUpdateDishSubElements(models.DishAllergenic, req.dish.DishAllergenics, objDish.DishAllergenics, t, false, ["text", "DishId"]);
		}).then(function(result){
			//dish[Prices]
			return completeUpdateDishSubElements(models.Price, req.dish.Prices, objDish.Prices, t, true, ["concept", "price", "currency", "DishId"]);
		}).then(function(result){
			//dish[Images]
			return completeUpdateDishSubElements(models.Image, req.dish.Images, objDish.Images, t, true, ["source", "link", "description", "DishId"]);
		});
	}).then(function (param){
		res.redirect('/dishes');
	}).catch(function (err){
		createUpdateError(res, 'dishes/edit.ejs', objDish, err);
	});
};


//AUX
/** 
 * Given a dish form, return a database compatible object 
 * @method responseToDish
 * @param {Object} pDish Dish object from dish form
 * @return {Object} Database compatible object, to either return to new/edit page or persist
*/
function responseToDish(pDish) {
	var dish = {};
	if (pDish.id !== undefined)
		dish.id = pDish.id;
	dish.name = pDish.name;
	dish.TypeId = +pDish.TypeId;
	dish.description = pDish.description;
	//dish[Categories] dish.Categories[i].DishCategory.CategoryId
	dish.Categories = [];
	if (pDish.categories !== undefined){
		if (typeof(pDish.categories) === "string")
			//dish.Categories.push(pDish.categories);
			dish.Categories.push({DishCategory: {CategoryId: +pDish.categories}});
		else {
			//dish.Categories = pDish.categories; 
			for (var index in pDish.categories){
				dish.Categories.push({DishCategory: {CategoryId: +pDish.categories[index]}});
			}
		}
	}
	//common to components and allergenics - select values are composed by text and id (if it exists)
	function parseComponent(pComponent){
		var splitComponent = pComponent.split(splitSeparator);
		var component = {text: splitComponent[0]};
		if (splitComponent.length > 1){
			component.id = +splitComponent[1];
		}
		if (dish.id !== undefined)
			component.DishId = dish.id;
		return component;
	}
	//dish[components]
	dish.DishComponents = [];
	if (pDish.components !== undefined) {
		if (typeof(pDish.components) === "string")
			dish.DishComponents.push(parseComponent(pDish.components));
		else {
			for (var index in pDish.components){
				dish.DishComponents.push(parseComponent(pDish.components[index]));
			}
		}
	}
	//dish[allergenics]	
	dish.DishAllergenics = [];
	if (pDish.allergenics !== undefined) {
		if (typeof(pDish.allergenics) === "string")
			dish.DishAllergenics.push(parseComponent(pDish.allergenics));
		else {
			for (var index in pDish.allergenics){
				dish.DishAllergenics.push(parseComponent(pDish.allergenics[index]));
			}
		}
	}
	//dish[Prices]	
	dish.Prices = [];
	if (pDish.Prices !== undefined) {		
		dish.Prices = pDish.Prices;
		//will not cast prices from String to number, as they might combine signs (initial +)
		if (dish.id !== undefined)
			for (var index in dish.Prices)
				dish.Prices[index].DishId = dish.id;
		for (var index in dish.Prices){
			if (dish.Prices[index].id !== undefined)
				dish.Prices[index].id = +dish.Prices[index].id;
		}
	}
	//dish[Images]
	dish.Images = [];
	if (pDish.Images !== undefined) {		
		for (var i = 0; i < pDish.Images.length; i++){
			var image = {};
			if (pDish.Images[i].id !== undefined)
				image.id = +pDish.Images[i].id;			
			image.source = pDish.Images[i].source;
			if (image.link !== '')
				image.link = pDish.Images[i].link;
			else
				image.link = pDish.Images[i].source;
			image.description = pDish.Images[i].description;
			if (dish.id !== undefined)
				image.DishId = dish.id;
			dish.Images.push(image);
		}
	}
	return dish;
};

/**
 * Common function between new and edit: it only varies on route and dish. Prepare objects to render new/edit
 * @method newEdit
 * @param {Object} res Route response object
 * @param {String} route Next view's route
 * @param {Object} dish Database compatible dish, if loaded; if not, a new one will be created
 * @param {Array} errors Error array, optional, to allow error feedback on view
 */
function newEdit(res, route, dish, errors){
	var types, categories, componentHints, allergenicHints;
	if (dish === undefined || dish === null){
		dish = models.Dish.build({
			name: 'Nombre',
			description: 'Descripción',
		});
	};
	if (errors === undefined || errors === null){
		errors = [];
	};
	models.Type.findAll().then(
		function (results){
			types = results;
			return models.Category.findAll();
		}
	).then(
		function (results){
			categories = results;
			return models.Component.findAll();
		}
	).then(
		function (results){
			componentHints = results;
			return models.Allergenic.findAll();
		}
	).then(
		function (results){
			allergenicHints = results;
			res.render(route, {
				dish: dish, 
				types: types, 
				categories: categories, 
				componentHints: componentHints, 
				allergenicHints: allergenicHints, 
				errors: errors
			});
		}
	);
};

/** 
 * Error handler for create/update operations, after a Sequelize exception
 * @method createUpdateError
 * @param {Object} res Route response object
 * @param {String} route Next view's route
 * @param {Object} dish Database compatible dish object. Contains user updated data
 * @param {Object} err Error object from an exception
 */
function createUpdateError(res, route, objDish, err){	
	console.log(consoleTextColorRed, '	ERROR', consoleTextColorBlack);
	var errors = [];
	if (err.length){
		if (err[0].record !== undefined){ //sequelize error
			for (var index in err){
				errors.push(err[index].errors);
			}
		} else {
			errors = err;
		}
	} else {
		errors.push(err);			
		if (err.errors !== undefined){
			for (var index in err.errors){
				errors.push(err.errors[index]);
			}
		}
	}
	console.log(err);
	newEdit(res, route, objDish, errors);
};

/** 
 * Given a database dish instance, associate categories
 * @method setCategories
 * @param {Object} dbDish Dish database instance
 * @param {Object} objDish Compatible database dish object
 * @param {Object} transaction Sequelize transaction, to perform create/update operations as a single operation 
 * @return {Promise}
 * */
function setCategories(dbDish, objDish, transaction){
	//dish[categories]
	var categoryIdArray = [];
	for (var index in objDish.Categories){
		categoryIdArray.push(objDish.Categories[index].DishCategory.CategoryId);
	}
	return dbDish.setCategories(categoryIdArray, {transaction: transaction});
};

/**
 * Creates a dish subelement array for a create operation - just adds DishId. 
 * Subject subelements are components, allergenics, prices and images. As responseToDish object has the same namings as instances, this should be generic; for custom properties, create a custom method.
 * Cannot add DishId to every original dish subelement, as in case of error, it would keep DishId, so next submit would reference a non existing DishId
 * @method buildSubElementArray
 * @param {Object} objDish.<subElementArray> Compatible database dish subelement array
 * @param {number} dishId New dish's id
 * @return {Array}
 */
function buildSubElementArray(subElementArray, dishId){
	var newSubElementArray = [];
	for (var index in subElementArray){
		var instance = {DishId: dishId};
		for (var key in subElementArray[index]){
			instance[key] = subElementArray[index][key];
		}
		newSubElementArray.push(instance);
	}
	return newSubElementArray;
};

/**
 * Helper function to provide generic create operation in a single step.
 * Create dish subelements, common to create and update controls
 * @method createDishSubElements
 * @param {Object} model Model to be used in bulkCreate operation
 * @param {Array} newDishSubElementArray Array containing sets composed of dishId and subElement data
 * @param {Object} transaction Sequelize transaction, to perform create/update operations as a single operation 
 * @param {Array} fields Calls from update case require only modified fields and FK
 * @return {Promise}
 */
function createDishSubElements(model, newDishSubElementArray, transaction, fields){
	var options = {transaction: transaction, validate: true};
	if (fields !== undefined){
		options.fields = fields;
	};
	return model.bulkCreate(newDishSubElementArray, options);
};

/**
 * Helper function to provide generic delete operation in a single step.
 * Delete dish subelements, returns subElementCase, same as input parameter. Only used in update route; should be used before create to prevent errors creating same subelement data
 * @method createDishSubElements
 * @param {Object} model Model to be used in destroy operation
 * @param {Object} subElementCase Uses deleteIdArray, used as return value to perform other operations in separate promises if needed
 * @param {Object} transaction Sequelize transaction, to perform operations as a single one 
 * @return {Object}
 */
function deleteDishSubElements(model, subElementCase, transaction){
	//Prevent delete without id's; it's usual to use a create operation afterwards, with this condition create operation cannot be nested promise - use another separate promise/method
	if (!subElementCase.deleteIdArray.length){
		return models.resolvePromise(subElementCase);
	}
	return model.destroy({
		where: {id: {$in: subElementCase.deleteIdArray}},
		transaction: transaction
	}).then(function(result){
		return subElementCase
	});
};

/**
 * Helper function to provide generic update operation in a single step
 * Update dish subelements, returns subElementCase, same as input parameter. Only used in update route
 * @method updateDishSubElements
 * @param {Object} model Model to be used in destroy operation
 * @param {Array<Instance>} dbInstanceArray Current database related instances
 * @param {Object} subElementCase Uses deleteIdArray, used as return value to perform other operations in separate promises if needed
 * @param {Object} transaction Sequelize transaction, to perform operations as a single one
 * @param {Array} fields Calls from update case require only modified fields and FK
 * @return {Object}
 */
function updateDishSubElements(model, dbInstanceArray, subElementCase, transaction, fields){
	function updateSubElements(updateArray, index){
		if (index < updateArray.length){
			var updateSubElement = updateArray[index];
			var dbInstance = dbInstanceArray[updateSubElement.existingIdIndex];
			var values = {};
			for (var i in fields){
				values[fields[i]] = updateSubElement[fields[i]];
			}
			return dbInstance.update(
				values, {transaction: transaction}
			).then(function(result){
				return updateSubElements(updateArray, index + 1);
			});
		} else {
			return models.resolvePromise(subElementCase);
		}
	}
	return updateSubElements(subElementCase.updateArray, 0);
};

/** 
 * Split dish subelements into three arrays, containing subelements to create, subelements to update, or ids to delete. Will not return subelements without changes
 * @method buildSubElementCase
 * @param {Object} dbInstanceArray Array containing current database dish subelements
 * @param {Object} subElementArray Array containing dish form subelements
 * @param {boolean} isUpdateAllowed Specifies if control admits update; if not, no update checks needs to be done
 * @return {Object} {newArray, updateArray, deleteIdArray}
 */
function buildSubElementCase(dbInstanceArray, subElementArray, isUpdateAllowed){
	//get existing id's
	var existingIds = [];
	for (var index in dbInstanceArray){
		existingIds.push(dbInstanceArray[index].id);
	}
	//define which elements should be created, which updated and which deleted
	var newSubElementArray = [];
	var updateSubElementArray = [];
	for (var index in subElementArray){
		if (subElementArray[index].id !== undefined){
			var existingIdIndex = existingIds.indexOf(subElementArray[index].id);
			if (existingIdIndex === -1){
				newSubElementArray.push(subElementArray[index]);
			} else {
				if (isUpdateAllowed){
					var dbInstance = dbInstanceArray[existingIdIndex];
					if (!dbInstance.objectEquals(subElementArray[index])){
						subElementArray[index].existingIdIndex = existingIdIndex;
						updateSubElementArray.push(subElementArray[index]);
					}
				}
				delete existingIds[existingIdIndex];
			}
		} else {
			newSubElementArray.push(subElementArray[index]);
		}
	}
	var idsToDeleteArray = [];
	for (var index in existingIds){
		idsToDeleteArray.push(existingIds[index]);
	}
	var subElementCaseArray = {newArray: newSubElementArray, updateArray: updateSubElementArray, deleteIdArray: idsToDeleteArray};
	return subElementCaseArray;
};

/** 
 * On update route, determines which elements from the form shall be created, updated, or deleted, and operates accordingly. Uses helper functions for each step.
 * @method  completeUpdateDishSubElements
 * @param {Object} model Model to be used in destroy operation
 * @param {Array<Instance>} dbInstanceArray Current database related instances
 * @param {Object} subElementArray Array containing dish form subelements
 * @param {Object} transaction Sequelize transaction, to perform operations as a single one
 * @param {boolean} isUpdateAllowed Specifies if control admits update; if not, no update checks/operations needs to be done
 * @param {Array} fields Calls from update case require only modified fields and FK
 */
function completeUpdateDishSubElements(model, dbInstanceArray, subElementArray, transaction, isUpdateAllowed, fields){
	var subElementCase = buildSubElementCase(dbInstanceArray, subElementArray, isUpdateAllowed);
	return deleteDishSubElements(model, subElementCase, transaction
	).then(function(deleteResult){
		subElementCase.deleteResult = deleteResult;
		if (isUpdateAllowed){
			return updateDishSubElements(model, dbInstanceArray, subElementCase, transaction, fields);
		} else {
			return null;
		}
	}).then(function(updateResult){
		subElementCase.updateResult = updateResult;
		return createDishSubElements(model, subElementCase.newArray, transaction, fields);
	}).then(function(createResult){
		subElementCase.createResult = createResult;
		return subElementCase;
	});
};
