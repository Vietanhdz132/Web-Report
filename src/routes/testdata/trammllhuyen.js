const express = require('express');
const router = express.Router();
const TramMLLHUYENController = require('../../app/controllers/TramMLL/TramMLLHUYEN');

router.get('/', TramMLLHUYENController.getAll);
router.get('/view', TramMLLHUYENController.viewAll);

module.exports = router;
