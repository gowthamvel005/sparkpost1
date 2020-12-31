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
const JWT = require(path.join(__dirname, 'lib', 'jwtDecoder.js'));
var app = express();
// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({type: 'application/jwt'}));
//app.use(bodyParser.urlencoded({ extended: true }));

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
//app.post('/journeybuilder/execute/', activity.execute );
app.post('/journeybuilder/execute/', (req, res) => {			
    // example on how to decode JWT
	console.log('row data Balaji FIrst:-');	
    JWT(req.body, process.env.jwtSecret, (err, decoded) => { 
        // verification error -> unauthorized request		

      console.log('row data Balaji Second:-');		
        if (err) {
            console.error(err);
            return res.status(401).end();
        }
        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {			
		var decodedArgs = decoded.inArguments[0];
		
	
			
		 console.log('row data Balaji Second:-'+decodedArgs);	
		
	   			
            res.send(200, 'Execute');
        } 			
		else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }				
    });
} );


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
