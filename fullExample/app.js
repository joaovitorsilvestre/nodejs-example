var express = require('express');
var http = require('http');
var path = require('path')
var bodyParser = require('body-parser');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var socketIO = require('socket.io');
var config = require('./config');

/**
  * Import controllers and middlewares
  */
var chat = require('./controllers/chat');
var accounts = require('./controllers/accounts');

/**
  * Server, app, socket.io and db setup
  */
var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var db = mongoose.connect(config.database);

/**
  * General setup
  */
app.set('views', path.join(__dirname + '/views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
  * Socket io
  */
var chatSpace = io.of('/chat');
chatSpace.on('connection', chat.socketio);

/**
  * Use controllers
  */
app.use('/chat', chat.router);
app.use('/accounts', accounts);

/**
  * error
  */
app.use(function(req, res, next){
    res.render('error', {
        errName: 'Page not found',
        errMessage: 'Check the URL that you did this request'
    });
});

/**
  * Where the magic happens
  */
server.listen(3000, function(){
    console.log('Server is now running at localhost:3000');
});

/**
  * Close connection with database when server is shut down
  */
process.on('SIGINT', function(){
    mongoose.connection.close(function() {
        console.log('\033[32m\Disconnected from mongo database.\033[0m');
        process.exit(0);
    });
});
