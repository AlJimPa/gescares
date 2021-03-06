var express = require('express');
var router = express.Router();
//multer - to prevent duplicate namefiles, rename with the date?

//controllers
//var sessionController = require('../controllers/sessionController');
var dishController = require('../controllers/dish_controller');
//var menusController = require('../controllers/menusController');
//var calendarsController = require('../controllers/calendarsController');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Gescares', errors: [] });
});

//Autoload
router.param('dishId', dishController.load);

/*
//Session routes
router.get('/login', sessionController.new);
router.post('/login', sessionController.create);
router.get('/logout', sessionController.destroy);
*/

//Dishes routes
 //TODO add sessionController.loginRequired on index, show; 
 //TODO add sessionController.userIsManager on new, create, edit, update
router.get('/dishes', dishController.index);
router.get('/dishes/new', dishController.new);
router.get('/dishes/:dishId(\\d+)', dishController.show);
router.post('/dishes/create', dishController.create);
router.get('/dishes/:dishId(\\d+)/edit', dishController.edit);
router.put('/dishes/:dishId(\\d+)', dishController.update);

//TODO routes: session, menus, calendars
router.get('/credits', function(req, res){
	res.render('credits', {errors:[]});
});

module.exports = router;
