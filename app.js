
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http');

var app = express();

//Demo users array
//Here, i put two example users, but we can use a DB for them.
//The password has been set manually, but we can register one user and use bcrypt.
//However, this example is too simple for install it easyly.

var users = [
    {id: 1, name:"Francisco López", username:"donflopez", password:"asdf", image:"https://twimg0-a.akamaihd.net/profile_images/2556494102/jduiaxwtk114rugdb8ff.jpeg", desc:"Desarrollador de aplicaciones web, estudiante de Grado en ingeniería informática.", twitter:"https://twitter.com/donflopez"}
  , {id: 2, name:"Angelina Jolie", username:"mygirlfriend", password:"ilovedonflopez", image:"http://www.picalls.com/data/media/15/Angelina_Jolie_6.jpg", desc:"Enamorada de Francisco López!"}
];


//Basic auth function without bcrypt function, for add bcrypt we need search
//search the user, get the salt and hash the password, then compare the result.
function basicAuth (username, password, count, cb) {
  if(users[count]){
    if(username==users[count].username){
      if(password==users[count].password){
        console.log('Correctly!');
        cb('Correctly logged in!.', true, users[count]);
      }
      else{
        console.log('Error password!');
        cb('Incorrect password!', false);
      }
    }
    else{
      count++;
      basicAuth(username, password, count, cb);
    }
  }
  else{
    console.log('User not exist!');
    cb('User do not exist.', false);
  }
}


//Configuration express server
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


//Initial route
app.get('/', routes.index);


//get express server for use with socket.io
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


//Socket.io listen server
var io = require('socket.io').listen(server);


//Socket.io logic
io.sockets.on('connection', function(socket){
  socket.on('singOn', function(user){
    basicAuth(user.username, user.password, 0, function(msg, exist, user){
      if(exist){
        //Emit socket with user
        socket.emit('loggedIn', user, msg);
      }
      else{
        //Emit error
        socket.emit('loggedError', msg);
      }
    });
  });
});