'use strict';
// Module Dependencies
// -------------------

console.log("app.js called");
var express     = require('express');
var bodyParser  = require('body-parser');
var errorhandler = require('errorhandler');
var http        = require('http');
var path        = require('path');
var request     = require('request');
var routes      = require('./routes');
var activity    = require('./routes/activity');
var app = express();
// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({
  type: ['application/json', 'text/plain', 'text/xml']
}));

//app.use(express.methodOverride());
//app.use(express.favicon());

app.use(express.static(path.join(__dirname, 'public')));

// Express in Development Mode
if ('development' == app.get('env')) {
  app.use(errorhandler());
}

// HubExchange Routes
app.get('/', routes.index );
app.post('/login', routes.login );
app.post('/logout', routes.logout );

// Custom Hello World Activity Routes
app.post('/journeybuilder/save/', activity.save );
app.post('/journeybuilder/validate/', activity.validate );
app.post('/journeybuilder/publish/', activity.publish );
app.post('/journeybuilder/execute/', activity.execute );
app.post('/create/hearsayfolder/', activity.createFolder);
app.post('/create/staticde/', activity.staticDataExtension);
app.post('/dataextension/row/', activity.DERow);
app.post('/retrieve/derows/', activity.retrieveDERows);
app.post('/create/dextension/', activity.createDExtension);
app.post('/insert/derow/', activity.insertDERow);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
