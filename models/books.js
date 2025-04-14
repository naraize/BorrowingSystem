'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Books extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Books.belongsTo(models.Categories, {
        foreignKey: 'category_id',
        as: 'category'
      });
  
      Books.hasMany(models.Borrow, {
        foreignKey: 'book_id',
        as: 'borrows'
      });
    }
  }
  Books.init({
    title: DataTypes.STRING,
    author: DataTypes.STRING,
    published_date: DataTypes.STRING,
    category_id: DataTypes.INTEGER,
    is_available: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Books',
  });
  return Books;
};