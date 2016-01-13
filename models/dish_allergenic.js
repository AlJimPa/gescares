//DishAllergenic model definition

module.exports = function(sequelize, DataTypes){
	return sequelize.define('DishAllergenic', {
		text: {
			type: DataTypes.STRING,
			validation: {notEmpty: {msg: 'Allergenic cannot be null'}}
		},
	  DishId: { //foreign key; normally defined at models associations; needed for index
		  type: DataTypes.INTEGER,
		  references: {
			  model: 'Dishes',
			  key: 'id'
		  }
	  }
	},{
		indexes: [{
			unique: true,
			fields: ['text', 'DishId']
		}]
	});
};