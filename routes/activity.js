'use strict';
var util = require('util');

// Deps
const Path = require('path');
const JWT = require(Path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
var util = require('util');
var http = require('https');
var axios = require('axios'); 

exports.logExecuteData = [];

function logData(req) {
    exports.logExecuteData.push({
        body: req.body,
        headers: req.headers,
        trailers: req.trailers,
        method: req.method,
        url: req.url,
        params: req.params,
        query: req.query,
        route: req.route,
        cookies: req.cookies,
        ip: req.ip,
        path: req.path,
        host: req.host,
        fresh: req.fresh,
        stale: req.stale,
        protocol: req.protocol,
        secure: req.secure,
        originalUrl: req.originalUrl
    });
    console.log("body: " + util.inspect(req.body));
    console.log("headers: " + req.headers);
    console.log("trailers: " + req.trailers);
    console.log("method: " + req.method);
    console.log("url: " + req.url);
    console.log("params: " + util.inspect(req.params));
    console.log("query: " + util.inspect(req.query));
    console.log("route: " + req.route);
    console.log("cookies: " + req.cookies);
    console.log("ip: " + req.ip);
    console.log("path: " + req.path);
    console.log("host: " + req.host);
    console.log("fresh: " + req.fresh);
    console.log("stale: " + req.stale);
    console.log("protocol: " + req.protocol);
    console.log("secure: " + req.secure);
    console.log("originalUrl: " + req.originalUrl);
}

/*
 * POST Handler for / route of Activity (this is the edit route).
 */
exports.edit = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Edit');
};

/*
 * POST Handler for /save/ route of Activity.
 */
exports.save = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Save');
};

/*
 * POST Handler for /execute/ route of Activity.
 */
exports.execute = function (req, res) {

    // example on how to decode JWT
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {

        // verification error -> unauthorized request
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            
            // decoded in arguments
            var decodedArgs = decoded.inArguments[0];
            
            logData(req);
            res.send(200, 'Execute');
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};


/*
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Publish');
};

exports.validateDE = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    console.log('validating DataExtension');
    
    var data = JSON.stringify({"grant_type":"client_credentials","client_id":"lrdyhupmuhr4zl7vwj8a3giq","client_secret":"g8EvTsIYGpPFxovz9nKj0cXy","account_id":"514009708"});
    var authToken = '';
    var config = {
      method: 'post',
      url: 'https://mc4f63jqqhfc51yw6d1h0n1ns1-m.auth.marketingcloudapis.com/v2/token',
      headers: { 
        'Content-Type': 'application/json'
      },
      data : data
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
        authToken = response.data.access_token;
        console.log('authToken '+authToken);
    })
    .catch(function (error) {
      console.log(error);
    });
    
    if(authToken != '' && authToken != 'undefined'){
        
        var rawdata = '<?xml version="1.0" encoding="UTF-8"?>\n<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">\n    <s:Header>\n        <a:Action s:mustUnderstand="1">Retrieve</a:Action>\n        <a:To s:mustUnderstand="1">https://.soap.marketingcloudapis.com/Service.asmx</a:To>\n        <fueloauth xmlns="http://exacttarget.com">'+authToken+'</fueloauth>\n    </s:Header>\n    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">\n        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">\n            <RetrieveRequest>\n                <ObjectType>DataExtension</ObjectType>\n                <Properties>ObjectID</Properties>\n                <Properties>CustomerKey</Properties>\n                <Properties>Name</Properties>\n                <Properties>IsSendable</Properties>\n                <Properties>SendableSubscriberField.Name</Properties>\n                <Filter xsi:type="SimpleFilterPart">\n                    <Property>CustomerKey</Property>\n                    <SimpleOperator>equals</SimpleOperator>\n                    <Value>Test_Job_Insert</Value>\n                </Filter>\n            </RetrieveRequest>\n        </RetrieveRequestMsg>\n    </s:Body>\n</s:Envelope>';
        
        var configs = {
          method: 'post',
          url: 'https://mc4f63jqqhfc51yw6d1h0n1ns1-m.soap.marketingcloudapis.com/Service.asmx',
          headers: { 
            'Content-Type': 'text/xml'
          },
          data : rawdata
        };
        
        axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          res.send(200, response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
        
    } else {
        res.send(400, 'Not Authenticated');
    }
    
    //logData(req);
};
/*
 * POST Handler for /validate/ route of Activity.
 */
exports.validate = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Validate');
};
