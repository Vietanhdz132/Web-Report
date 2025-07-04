

class SiteController {

  // [GET] /
  index(req, res, next) {
  res.render('404', {
    layout: 'homeLayout' 
  });
}


  // [GET] /search
  search(req, res) {
    res.render('search');
  }

  // [GET] /login
  login(req, res) {
    res.render('login');
  }
}

module.exports = new SiteController();
