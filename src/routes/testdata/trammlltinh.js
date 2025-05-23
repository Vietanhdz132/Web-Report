const express = require('express');
const router = express.Router();
const TramMLLTINHController = require('../../app/controllers/TramMLL/TramMLLTINH');

router.get('/', TramMLLTINHController.getAll);
router.get('/view', TramMLLTINHController.viewAll);

module.exports = router;
