var createError = require('http-errors');
var express = require('express');
const helmet = require('helmet');
var path = require('path');
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var logger = require('morgan');
var formidable = require('formidable');
var form = formidable({
  uploadDir: path.join(__dirname, '/public/incoming'),
  keepExtensions: true,
  encoding: 'utf-8',
  allowEmptyFiles: true,
  minFileSize: 1,
  maxFileSize: 200*1024*1024,
  maxFields: 1000,
  multiples: false
});
var fs = require('fs');

var mongoClient = require('./inc/db');

var indexRouter = require('./routes/index');
var dashbrdRouter = require('./routes/dashbrd');

var app = express();

//IMPORTANT: you need to set the authentication file before first run!
var authsession = fs.readFileSync('path/to/authentication/file.json');
authsession = JSON.parse(authsession);

console.log('\nA2Dlog - Attempting to join session...');

//IMPORTANT: you need to set your connection string before first run!
var sessionStore = new MongoDBStore({
  uri: `mongodb://${authsession['username']}:${authsession['password']}@YOURMONGODBPATH/YOURDATABASE`,  
  collection: authsession['collection']
});

sessionStore.on('error', function(error){
  console.log("A2Dlog - Error while connecting to Mongo via session");
  console.log(error);  
  console.log("\n\n");
});

//IMPORTANT: you need to set your secret string for your cookies before first run!
app.use(session({
  store: sessionStore,
  secret: 'YOUR_SECRET_STRING_HERE',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 15, //15 DAYS
    secure: 'auto'
  },
  resave: true,
  saveUninitialized: false
}));

async function run(){
  try{
    await mongoClient.connect();

    await mongoClient.db().command({ping: 1});    
  }
  finally{    
    console.log("A2Dlog - MongoDB connected successfully!");
  }
}
run().catch(console.dir);

app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(function(req, res, next){
  if(req.method.toLowerCase() === 'post'){   
    form.parse(req, function(err, fields, files){ 
      if(err){
        console.log("\nA2Dlog - Error on the POST route:\n");
        console.log(err);
        req.body = {};
        return;
      }
      req.body = fields;     
      req.fields = fields;
      req.files = files;
      next();
    });    
  }
  else{
    if(typeof req.body === 'undefined'){
      req.body = {};
    }    
    next();
  }  
});


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/dashbrd', dashbrdRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = {};
  res.locals.title = 'Erro';
  res.locals.status = err.status;
  res.locals.desc = 'Aruan Dev&Design - Error page'

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
	