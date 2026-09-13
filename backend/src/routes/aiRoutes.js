const express = require('express');
const {
  chatWithAI,
  getRecommendations,
  getPopularRoutes,
} = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', chatWithAI);
router.post('/recommend', getRecommendations);
router.get('/routes/popular', getPopularRoutes);

module.exports = router;