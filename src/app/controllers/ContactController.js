const { render } = require('sass');

class NewsController {
  // [GET] /news
  index(red, res) {
    res.render('contact');
  }

  //[GET] /news/:slug
  show(red, res) {
    res.send('New detail!!!');
  }
}

module.exports = new NewsController();
