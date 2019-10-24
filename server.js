const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

// Define Routes

// Set Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
