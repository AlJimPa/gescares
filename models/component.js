//Components model definition

module.exports = function(sequelize, DataTypes){
	return sequelize.define('Component', {
		text: {
			type: DataTypes.STRING,
			validation: {notEmpty: {msg: 'Component cannot be null'}},
			unique: true
		}
	});
};