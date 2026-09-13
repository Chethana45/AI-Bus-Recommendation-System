const express = require('express');
const {
  getBuses,
  getBusById,
  createBus,
} = require('../controllers/busController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getBuses);
router.get('/:id', getBusById);
router.post('/', protect, createBus);

module.exports = router;