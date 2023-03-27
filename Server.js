const dotenv = require 'dotenv';
dotenv.config();
const express = require 'express';
const ejs = require 'ejs';
const path = require 'path';
const layout = require 'express-ejs-layouts';
const mongoose = require 'mongoose';
const session = require 'express-session';
const flash = require 'express-flash';
const MongoStore = require 'connect-mongo';
const { initRoutes } = require './routes';
const passport = require 'passport';

const initializingPassport = require './app/config/passport.js';
const Path = require 'path';

const app = express();

global.appRoot = Path.resolve(__dirname);

//mongo atlas connection
mongoose.connect(process.env.DB_URL, { useNewUrlParser:true, useUnifiedTopology:true });
const connection = mongoose.connection;
connection.once('open',()=>{ console.log("Conneted to MongoAtlas Successfully.") })
.on('error',()=>{ console.log("Mongo Atlas Connection Declined") })

// session config
app.use(session({
    secret: process.env.COOKIES_SECRET,
    resave:false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        ttl: 60 * 60 *24
    })
}))

//passport config
initializingPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

app.use(express.urlencoded({extended:false}));
app.use(express.json())
app.use(layout);
app.use(flash());

// static files
app.use(express.static('public'))

// views config
app.set('views', path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')

initRoutes(app);


// global error handler middleware
const errorHandler = (error,req,res,next)=>{
    let status = 500;
    let data = {
        message: 'Internal Server Error',
        original_error: error.message
    }
    res.status(status).json(data);    
}
app.use(errorHandler)

// server config
app.listen(process.env.PORT, ()=>{
    console.log('Server is listening on port ',process.env.PORT);
})