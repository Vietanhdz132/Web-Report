const { render } = require('sass');
const Item = require('../models/Item');
const { multipleMongooseToObject } = require('../../ulti/mongoose')

class ProductsController {
  // [GET] /products
  index(req, res, next) {
    Item.find({})
      .then(items => {
        res.render('products', { items: multipleMongooseToObject(items) })
      })
      .catch(error => next(error));
  }

  
}

module.exports = new ProductsController();
