const axios = require('axios');

const AI_MODULE_URL = process.env.AI_MODULE_URL || 'http://localhost:8000';

const chatWithAI = async (req, res) => {
  try {
    const response = await axios.post(`${AI_MODULE_URL}/chat`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: 'AI chat service unavailable',
      error: error.message,
    });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const response = await axios.post(`${AI_MODULE_URL}/recommend`, req.body);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: 'AI recommendation service unavailable',
      error: error.message,
    });
  }
};

const getPopularRoutes = async (req, res) => {
  try {
    const response = await axios.get(`${AI_MODULE_URL}/routes/popular`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      message: 'AI routes service unavailable',
      error: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
  getRecommendations,
  getPopularRoutes,
};