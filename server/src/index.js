const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const requestRoutes = require('./routes/request');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', requestRoutes);

app.get('/', (req, res) => {
  res.send({ message: 'Wallet request API is running' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
