require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');
const { setupPassport } = require('./config/passport');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors({
  origin: function (origin, callback) {
    // Allow any origin that is vercel, localhost, or matches CLIENT_URL
    if (!origin || origin.includes('localhost') || origin.includes('vercel.app') || origin === process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(null, true); // Temporarily allow all to prevent CORS blocking login
    }
  },
  credentials: true
}));
app.use(helmet());

setupPassport(app);

app.use('/api', apiLimiter);
app.use('/api', routes);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  await connectRedis();
  app.listen(process.env.PORT || 5000, () =>
    console.log(`Server running on port ${process.env.PORT || 5000}`)
  );
};

start();
