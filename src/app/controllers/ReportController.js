class ReportController {
    // [GET] /testdata
    index(req, res) {
        res.render('report', {
            layout: 'reportLayout', // Dùng layout phụ
            title: 'Report Page'
        });
    }
}

module.exports = new ReportController();
