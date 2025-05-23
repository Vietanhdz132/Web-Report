const express = require('express');
const router = express.Router();
const TramMLLTVTController = require('../../app/controllers/TramMLL/TramMLLTVT');

router.get('/', TramMLLTVTController.getAll);
router.get('/view', TramMLLTVTController.viewAll);

module.exports = router;
