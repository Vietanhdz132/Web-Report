const express = require('express');
const router = express.Router();
const TramMLLDVTController = require('../../app/controllers/TramMLL/TramMLLDVT');

router.get('/', TramMLLDVTController.getAll);
router.get('/view', TramMLLDVTController.viewAll);

module.exports = router;
