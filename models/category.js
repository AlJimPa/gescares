//Categories model definition

module.exports = function(sequelize, DataTypes){
	return sequelize.define('Category', {
		text: {
			type: DataTypes.STRING,
			validate: {notEmpty: {msg: 'Category cannot be null'}},
			unique: true
		}
	});
};