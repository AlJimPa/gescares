//Price model definition

module.exports = function(sequelize, DataTypes){
	return sequelize.define('Price', {
	  concept: {
		  type: DataTypes.STRING, 
		  validate: {notEmpty: {msg: 'concept required'}}
	  },
	  price: {
			type: DataTypes.STRING, //allow + - as added/removed ammount respect base prices
			validate: { is: {
				args: /^[+-]?[0-9]+(\.([0-9]*))$/,
				msg: 'Invalid price. Remember to use decimals, for example: 12.45'
			}}
	  }, 
	  currency: { //TODO - create another table and delete this, as it will be a FK
			type: DataTypes.STRING,
			validate: { is: {
				args: /^[a-z]{3}$/i,
				msg: 'Invalid currency. Use international currency code, like EUR or USD'
			}}
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
			fields: ['concept', 'DishId']
		}]
	});
};