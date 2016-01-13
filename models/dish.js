//Dish model definition

module.exports = function(sequelize, DataTypes){
	return sequelize.define('Dish', {
		name: {
			type: DataTypes.STRING,
			validate: {notEmpty: {msg: '-> name required' }},
			unique: true
		}, 
		description: {
			type: DataTypes.STRING,
			validate: {notEmpty: {msg: '-> description required' }}
		}
	});
};
