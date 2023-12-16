const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const corsOptions = require('./config/corsOptions');
const credentials = require('./middleware/credentials');

const app = express();
const db = process.env.DATABASE_URI;
const PORT = process.env.PORT || 4000;

// Connect Database
connectDB(db);

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

// auth
app.use('/register', require('./routes/register'));
app.use('/auth', require('./routes/auth'));
app.use('/refresh', require('./routes/refresh'));
app.use('/logout', require('./routes/logout'));
// api
app.use('/api/games', require('./routes/api/games'));

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
