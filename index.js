const express = require('express');
const app = express();
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const userRouters = require('./routers/userRouters.js');
const staffRouters = require('./routers/staffRouters.js');
const kpiRouters = require('./routers/kpiRouters.js');
const postRouters = require('./routers/postRouters.js');
const postmanRoutes = require('./routers/postmanRouters.js');

require('dotenv').config();
const { PORT, MONGO_URI } = process.env;

// Json and Cors (http and header handlers)
app.use(express.json({extended: false}));
app.use(cors({origin: "*", Credential: true, methods: ["GET", "POST", "PUT", "DELETE"]}));

// Database and server listening
mongoose.connect(MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`The Database was Connected Successfully\nThe Server was Listening\nhttp://localhost:${PORT}`);
        });
    })
    .catch((e) => console.log(e.message));

// Routers Middleware
app.use('/api/user', userRouters);
app.use('/api/staff', staffRouters);
app.use('/api/kpi', kpiRouters);
app.use('/api/post', postRouters);
app.use('/api/postman', postmanRoutes);

// Deployed Link: https://post-seva-server.onrender.com