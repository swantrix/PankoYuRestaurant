var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var options = {
    secret: "Session has not been compromised.",
    resave: false,
    saveUninitialized: true
               };
var path = require('path');
var morgan = require('morgan');
var sqlite3 = require('sqlite3').verbose();
var http = require('http');
var url = require('url');

var router = express.Router();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();



//The database
var fs = require('fs');
var file = "database.db";
var exists = fs.existsSync(file);

var db = new sqlite3.Database(file, (err) => {
    if (err) {
        return console.error(err.message);
    }

    console.log("Connected to the in-memory SQLite database");
});

db.serialize(function() {
    if (!exists) {
        //user data table
        db.run("CREATE TABLE IF NOT EXISTS users (userId INTEGER PRIMARY KEY, firstName TEXT NOT NULL, lastName TEXT NOT NULL, email TEXT NOT NULL UNIQUE, phone TEXT NOT NULL UNIQUE)");
        //session info table, relates session ID's with ueser ID's when logging im, marks user as anonymous by default
        db.run("CREATE TABLE IF NOT EXISTS sessionInfo (sessionId INT PRIMARY KEY NOT NULL, userId INTEGER, userType TEXT DEFAULT 'anonymous', date DATE DEFAULT GETDATE() )");
        //table used when logging orders, uses sessionId as the user type (and ID if logged in) will be defined in the sessionInfo table
        db.run("CREATE TABLE IF NOT EXISTS orders (orderId INTEGER PRIMARY KEY, sessionId INTEGER NOT NULL, foodItem TEXT NOT NULL, itemCount INTEGER NOT NULL)");
        //last table which relates orders to users and logs the date
        db.run("CREATE TABLE IF NOT EXISTS orderHistory (userId INTEGER NOT NULL, orderId INTEGER NOT NULL UNIQUE, date DATE DEFAULT GETDATE(), PRIMARY KEY(userId, date) )");
    }
})

db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Close the database connection.');
  });

/* 
Middleware
- Logger
- Sessions, cookie, etc.
- Serving static files
- Routers
- Error handlers
*/

//Morgan logger
app.use(morgan('tiny'));

//Session
app.use(session(options));

//serving static files
var staticPath = path.join(__dirname, "static");
app.use(express.static(staticPath));

// view engine setup
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//Routers
//app.use('/', indexRouter);
//app.use('/users', usersRouter);

app.get('/', (req, res) => {
    res.render('index');
});

//Error handling
// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  next(createError(404));
});*/

// error handler
/*app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});*/

/*http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    
    res.end();
  }).listen(8018);*/

app.listen(8018);

module.exports = app;
