const Item = require('../models/Item');
const { multipleMongooseToObject } = require('../../ulti/mongoose')

class ItemController {

  // [GET] /course/:slug
  show(req, res) {
    res.send('Course detail');
  }
}

module.exports = new ItemController();
