//Image model definition
//validation as url commented, as elements which removes source/target got errors. rely on view url control
module.exports = function(sequelize, DataTypes){
	return sequelize.define('Image', {
		source: {
			type: DataTypes.STRING/*,
			validate: {isUrl: {
				args: true,
				msg: 'source URL invalid'
			}}*/
		},
		link: {
			type: DataTypes.STRING/*,
			validate: {isUrl: {
				args: true,
				msg: 'link URL invalid'
			}}*/
		},
		description: {
			type: DataTypes.STRING
		}
	});
};