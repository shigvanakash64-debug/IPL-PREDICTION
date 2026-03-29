const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const matchRoutes = require('./routes/matches');
const predictionRoutes = require('./routes/predictions');
const { startMatchUpdater } = require('./services/matchUpdater');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/matches', matchRoutes);
app.use('/api/predict', predictionRoutes);

app.get('/', (req, res) => {
  res.send({ message: 'Live IPL Prediction API is running' });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    startMatchUpdater();
  });
};

startServer();
