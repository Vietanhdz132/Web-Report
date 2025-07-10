

class SiteController {

  // [GET] /
  index(req, res, next) {
    try {
        res.render('home', {
            layout: 'homeLayout',
            title: 'Home',

        });
        } catch (err) {
        console.error('Render error:', err);
        res.status(500).render('404', { layout: 'homeLayout' });
        }
  }


  // [GET] /search
  search(req, res) {
    res.render('search');
  }

 
}

module.exports = new SiteController();
