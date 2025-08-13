const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Bot = require('../models/Bot');
const { getRandomHerokuKey } = require('../herokuApiSelector');
const axios = require('axios');

// Get user's bots
router.get('/', authMiddleware, async (req, res) => {
  try {
    const bots = await Bot.find({ userId: req.user._id, status: 'active' });
    res.json(bots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get bot logs
router.get('/:id/logs', authMiddleware, async (req, res) => {
  try {
    const bot = await Bot.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    const HEROKU_API_KEY = getRandomHerokuKey();
    const response = await axios.get(
      `https://api.heroku.com/apps/${bot.appName}/log-sessions`,
      {
        headers: {
          Authorization: `Bearer ${HEROKU_API_KEY}`,
          Accept: 'application/vnd.heroku+json; version=3'
        }
      }
    );
    
    res.json({ logUrl: response.data.logplex_url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update bot config
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { config } = req.body;
    
    const bot = await Bot.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { config },
      { new: true }
    );
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    // Update Heroku config vars
    const HEROKU_API_KEY = getRandomHerokuKey();
    await axios.patch(
      `https://api.heroku.com/apps/${bot.appName}/config-vars`,
      config,
      {
        headers: {
          Authorization: `Bearer ${HEROKU_API_KEY}`,
          Accept: 'application/vnd.heroku+json; version=3',
          'Content-Type': 'application/json'
        }
      }
    );
    
    res.json(bot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete bot
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const bot = await Bot.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });
    
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    
    // Delete from Heroku
    const HEROKU_API_KEY = getRandomHerokuKey();
    try {
      await axios.delete(
        `https://api.heroku.com/apps/${bot.appName}`,
        {
          headers: {
            Authorization: `Bearer ${HEROKU_API_KEY}`,
            Accept: 'application/vnd.heroku+json; version=3'
          }
        }
      );
    } catch (herokuError) {
      console.error('Heroku delete error:', herokuError.message);
    }
    
    // Mark as deleted in database
    bot.status = 'deleted';
    await bot.save();
    
    // Increment user's bot quota
    await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { maxBots: 1 } }
    );
    
    res.json({ message: 'Bot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
