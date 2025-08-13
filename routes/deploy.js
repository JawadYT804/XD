const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Bot = require('../models/Bot');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { getRandomHerokuKey } = require('../herokuApiSelector');

const GITHUB_REPO_TARBALL = 'https://github.com/JawadTechXD/KHAN-MD/tarball/main';

router.post('/', authMiddleware, async (req, res) => {
  const { username, session_id, appname, config } = req.body;
  const userId = req.user._id;
  
  try {
    // Check user's bot quota
    const user = await User.findById(userId);
    if (user.maxBots <= 0) {
      return res.status(400).json({ 
        error: 'You have reached your bot limit (3 bots max). Delete a bot to deploy a new one.' 
      });
    }
    
    if (!session_id) {
      return res.status(400).json({ error: 'SESSION_ID is required' });
    }

    const generatedAppName = appname?.trim() 
      ? appname.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
      : `khanmdx-${uuidv4().slice(0, 6)}`;

    // Get random Heroku API key
    const HEROKU_API_KEY = getRandomHerokuKey();
    const herokuHeaders = { 
      Authorization: `Bearer ${HEROKU_API_KEY}`, 
      Accept: 'application/vnd.heroku+json; version=3', 
      'Content-Type': 'application/json' 
    };

    // Step 1: Create Heroku app
    const createAppRes = await axios.post('https://api.heroku.com/apps', 
      { name: generatedAppName }, 
      { headers: herokuHeaders }
    );

    // Step 2: Set all config vars
    const configVars = {};
    for (const [key, value] of Object.entries(config)) {
      configVars[key] = value.value;
    }
    
    await axios.patch(
      `https://api.heroku.com/apps/${generatedAppName}/config-vars`,
      configVars,
      { headers: herokuHeaders }
    );

    // Step 3: Trigger build
    await axios.post(
      `https://api.heroku.com/apps/${generatedAppName}/builds`,
      {
        source_blob: {
          url: GITHUB_REPO_TARBALL
        }
      },
      { headers: herokuHeaders }
    );

    // Save bot to database
    const bot = new Bot({
      userId,
      appName: generatedAppName,
      sessionId: session_id,
      config: configVars
    });
    await bot.save();
    
    // Decrement user's bot quota
    await User.findByIdAndUpdate(
      userId,
      { $inc: { maxBots: -1 } }
    );

    res.json({ 
      message: 'Deployment started successfully! Bot will be ready in 2 minutes.',
      botId: bot._id
    });

  } catch (error) {
    console.error('Deployment error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Deployment failed', 
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router;
