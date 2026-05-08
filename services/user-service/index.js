const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const ANALYTICS_URL = process.env.ANALYTICS_SERVICE_URL || 'http://analytics-service:8080';

app.get('/health', (req, res) => res.send('User Service is healthy'));

app.get('/dashboard', async (req, res) => {
  try {
    const response = await axios.get(`${ANALYTICS_URL}/stats`);
    res.json({
      service: 'User Service',
      analytics: response.data
    });
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch stats from analytics service' });
  }
});

app.listen(port, () => console.log(`User service listening on port ${port}`));
