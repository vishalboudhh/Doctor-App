// server/server.js
const express = require('express');
const colors = require('colors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require("path")

// dotenv config
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/v1/user', require('./routes/userRoutes.js'));
app.use('/api/v1/admin', require('./routes/adminRoutes.js')); // Enable admin routes
app.use('/api/v1/doctor', require('./routes/doctorRoutes.js'));

//static file
app.use(express.static(path.join(__dirname,'../client/dist')))

app.get('*',function(req,res){
  res.sendFile(path.join(__dirname,'../client/dist/index.html'))
})



// Port configuration
const port = process.env.PORT || 8080;

// Start server
app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_MODE} mode on port ${process.env.PORT}`.bgCyan.white);
});
