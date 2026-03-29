const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const questionRoutes = require('./routes/questions');
const voteRoutes = require('./routes/votes');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/questions', questionRoutes);
app.use('/api', voteRoutes);

app.get('/', (req, res) => {
  res.send({ message: 'Binary Prediction API is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
