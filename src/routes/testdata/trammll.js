const express = require('express');
const router = express.Router();
const TramMLLController = require('../../app/controllers/TramMLL/TramMLL');

router.get('/', TramMLLController.getAll);
router.get('/view', TramMLLController.viewAll);

module.exports = router;
