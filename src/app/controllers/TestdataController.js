class TestdataController {
    // [GET] /testdata
    index(req, res) {
        res.render('testdata/testdata', {
            layout: 'testdataLayout', // Dùng layout phụ
            title: 'Testdata Page'
        });
    }
}

module.exports = new TestdataController();
