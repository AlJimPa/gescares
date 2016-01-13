//Allergenic model definition

module.exports = function(sequelize, DataTypes){
	return sequelize.define('Allergenic', {
		text: {
			type: DataTypes.STRING,
			validation: {notEmpty: {msg: 'Allergenic cannot be null'}}, 
			unique: true
		}
	});
};