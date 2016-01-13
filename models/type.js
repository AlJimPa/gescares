//Types model definition

module.exports = function(sequelize, DataTypes){
	return sequelize.define('Type', {
		text: {
			type: DataTypes.STRING, 
			validate: {notEmpty: {msg: "-> Type missing"}},
			unique: true
		}
	});
};