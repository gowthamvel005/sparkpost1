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
            console.log('arguments values are '+JSON.stringify(decodedArgs));
            logData(req);
            res.send(200, 'Execute');
        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
};


/*/data/v1/async/dataextensions/key:'+TargetObject+'/rows
 * POST Handler for /publish/ route of Activity.
 */
exports.publish = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    logData(req);
    res.send(200, 'Publish');
};

exports.insertDERows = function (req, res) {
    
    console.log('request DEName is '+JSON.stringify(req.body));
    var xml2js = require('xml2js');
    
    logData(req);
    res.send(200, 'Publish');
};

exports.createFolder = function (req, res) {
    
    console.log('request DEName is '+JSON.stringify(req.body));
    var xml2js = require('xml2js');
    
    let soapMessage = '<?xml version="1.0" encoding="UTF-8"?>'
    +'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'
    +'    <s:Header>'
    +'        <a:Action s:mustUnderstand="1">Retrieve</a:Action>'
    +'        <a:To s:mustUnderstand="1">https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx</a:To>'
    +'        <fueloauth xmlns="http://exacttarget.com">'+req.body.token+'</fueloauth>'
    +'    </s:Header>'
    +'    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
    +'        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">'
    +'            <RetrieveRequest>'
    +'                <ObjectType>DataFolder</ObjectType>'
    +'                <Properties>ID</Properties>'
    +'                <Properties>CustomerKey</Properties>'
    +'                <Properties>Name</Properties>'
    +'                <Properties>ParentFolder.ID</Properties>'
    +'                <Properties>ParentFolder.Name</Properties>'
    +'                <Filter xsi:type="SimpleFilterPart">'
    +'                    <Property>Name</Property>'
    +'                    <SimpleOperator>equals</SimpleOperator>'
    +'                    <Value>Hearsay Integrations</Value>'
    +'                </Filter>'
    +'            </RetrieveRequest>'
    +'        </RetrieveRequestMsg>'
    +'    </s:Body>'
    +'</s:Envelope>';
    
    var dataconfig = {
      method: 'post',
      url: 'https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx',
      headers: { 
        'Content-Type': 'text/xml'
      },
      data : soapMessage
    };
    
    axios(dataconfig)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
        //let rawdata = response.data;
        let rawData = '';
        var parser = new xml2js.Parser();
        
        parser.parseString(response.data, function(err,result){
            //console.log('result res body'+JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
            rawData = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
        });
        
        if(rawData == 'undefined'){
            let folderData = '<?xml version="1.0" encoding="UTF-8"?>'
                +'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'
                +'    <s:Header>'
                +'        <a:Action s:mustUnderstand="1">Retrieve</a:Action>'
                +'        <a:To s:mustUnderstand="1">https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx</a:To>'
                +'        <fueloauth xmlns="http://exacttarget.com">'+req.body.token+'</fueloauth>'
                +'    </s:Header>'
                +'    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
                +'        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">'
                +'            <RetrieveRequest>'
                +'                <ObjectType>DataFolder</ObjectType>'
                +'                <Properties>ID</Properties>'
                +'                <Properties>CustomerKey</Properties>'
                +'                <Properties>Name</Properties>'
                +'                <Properties>ParentFolder.ID</Properties>'
                +'                <Properties>ParentFolder.Name</Properties>'
                +'                <Filter xsi:type="SimpleFilterPart">'
                +'                    <Property>Name</Property>'
                +'                    <SimpleOperator>equals</SimpleOperator>'
                +'                    <Value>Data Extensions</Value>'
                +'                </Filter>'
                +'            </RetrieveRequest>'
                +'        </RetrieveRequestMsg>'
                +'    </s:Body>'
                +'</s:Envelope>';

                var config = {
                    method: 'post',
                    url: 'https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx',
                    headers: { 
                        'Content-Type': 'text/xml'
                    },
                    data : folderData
                 };

                 axios(config)
                 .then(function (response) {
                        var parser = new xml2js.Parser();
                        parser.parseString(response.data, function(err,result){
                          console.log('parentFolder ID '+JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
                          let rawData = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
                          //let parentFolderID;
                          if(rawData){
                                let parentFolderID = rawData[0]['ID'];
                                 let createFolderData = '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
                                 +'<soapenv:Header>';
                                 +'<fueloauth>'+req.body.token+'</fueloauth>'; 
                                 +'</soapenv:Header>';
                                 +'<soapenv:Body>';
                                 +'<CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">';
                                 +'<Options/>';
                                 +'<ns1:Objects xmlns:ns1="http://exacttarget.com/wsdl/partnerAPI" xsi:type="ns1:DataFolder">';
                                 +'<ns1:ModifiedDate xsi:nil="true"/>';
                                 +'<ns1:ObjectID xsi:nil="true"/>';
                                 +'<ns1:CustomerKey>Hearsay Integrations</ns1:CustomerKey>';
                                 +'<ns1:ParentFolder>';
                                 +'<ns1:ModifiedDate xsi:nil="true"/>';
                                 +'<ns1:ID>'+parentFolderID+'</ns1:ID>';
                                 +'<ns1:ObjectID xsi:nil="true"/>';
                                 +'</ns1:ParentFolder>';
                                 +'<ns1:Name>Hearsay Integrations</ns1:Name>';
                                 +'<ns1:Description>Hearsay Integrations Folder</ns1:Description>';
                                 +'<ns1:ContentType>dataextension</ns1:ContentType>';
                                 +'<ns1:IsActive>true</ns1:IsActive>';
                                 +'<ns1:IsEditable>true</ns1:IsEditable>';
                                 +'<ns1:AllowChildren>true</ns1:AllowChildren>';
                                 +'</ns1:Objects>';
                                 +'</CreateRequest>';
                                 +'</soapenv:Body>';
                                 +'</soapenv:Envelope>';
                              
                                 var folderConfig = {
                                    method: 'post',
                                    url: 'https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx',
                                    headers: { 
                                        'Content-Type': 'text/xml'
                                    },
                                    data : createFolderData
                                 };
                              
                                 axios(folderConfig)
                                 .then(function (response) {
                                        var parser = new xml2js.Parser();
                                        parser.parseString(response.data, function(err,result){
                                          console.log('result res body'+JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
                                          let rawData = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
                                          if(rawData){
                                              console.log('Folder creation '+rawData[0]['StatusMessage']);
                                              res.status(rawData[0]['StatusCode']).send(rawData[0]['StatusMessage']);
                                          } else {
                                              console.log('Folder creation Some thing went wrong!');
                                              res.status(400).send('Some thing went wrong!');
                                          }
                                    //res.status(200).send('DataExtension Created!');
                                 })
                                 .catch(function (error) {
                                     res.status(400).send(error);
                                     console.log(error);
                                 });
                          }
                    //res.status(200).send('DataExtension Created!');
                 })
                 .catch(function (error) {
                     res.status(400).send(error);
                     console.log(error);
                 });
          }
    })
    .catch(function (error) {
      console.log(error);
    });
  
};

exports.createDExtension = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    console.log('request DEName is '+JSON.stringify(req.body));
    //var templateName = req.body.name;
    var xml2js = require('xml2js');
    
    let soapMessage = '<?xml version="1.0" encoding="UTF-8"?>'
    +'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'
    +'    <s:Header>'
    +'        <a:Action s:mustUnderstand="1">Retrieve</a:Action>'
    +'        <a:To s:mustUnderstand="1">https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx</a:To>'
    +'        <fueloauth xmlns="http://exacttarget.com">'+req.body.token+'</fueloauth>'
    +'    </s:Header>'
    +'    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
    +'        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">'
    +'            <RetrieveRequest>'
    +'                <ObjectType>DataFolder</ObjectType>'
    +'                <Properties>ID</Properties>'
    +'                <Properties>CustomerKey</Properties>'
    +'                <Properties>Name</Properties>'
    +'                <Properties>ParentFolder.ID</Properties>'
    +'                <Properties>ParentFolder.Name</Properties>'
    +'                <Filter xsi:type="SimpleFilterPart">'
    +'                    <Property>Name</Property>'
    +'                    <SimpleOperator>equals</SimpleOperator>'
    +'                    <Value>Hearsay Integrations</Value>'
    +'                </Filter>'
    +'            </RetrieveRequest>'
    +'        </RetrieveRequestMsg>'
    +'    </s:Body>'
    +'</s:Envelope>';
    
    var dataconfig = {
      method: 'post',
      url: 'https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx',
      headers: { 
        'Content-Type': 'text/xml'
      },
      data : soapMessage
    };
    
    axios(dataconfig)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
        let rawdata = response.data;
        var data = '';
        var parser = new xml2js.Parser();
        
        if(req.body.xmlData) data = req.body.xmlData.replace('{process.env.mcEndpoint}','https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com');
        if(req.body.name) data = data.replace('DEKey', req.body.name+'Key').replace('DEName', req.body.name);
        
        parser.parseString(rawdata, function(err,result){
            //console.log('result res body'+JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
            let rawData = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
            if(rawData){
                let categoryID = rawData[0]['ID'];
                if(categoryID) data = data.replace('cateID',categoryID);
            } else {
                data = data.replace('<CategoryID>cateID</CategoryID>','');
            } 
        });
        
        console.log('data is '+data);
        
        var config = {
            method: 'post',
            url: 'https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx',
            headers: { 
                'Content-Type': 'text/xml'
            },
            data : data
         };

         axios(config)
         .then(function (response) {
                var parser = new xml2js.Parser();
                parser.parseString(response.data, function(err,result){
                  console.log('result res body'+JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
                  let rawData = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
                  if(rawData){
                      res.status(rawData[0]['StatusCode']).send(rawData[0]['StatusMessage']);
                  } else {
                      res.status(400).send('Some thing went wrong!');
                  }
            //res.status(200).send('DataExtension Created!');
         })
         .catch(function (error) {
             res.status(400).send(error);
             console.log(error);
         });
    })
    .catch(function (error) {
      console.log(error);
    });
  
};

exports.DERow = function (req, res) {
    // Data from the req and put it in an array accessible to the main app.
    //console.log( req.body );
    console.log('request DEName is '+JSON.stringify(req.body));
    var templateName = req.body.DEName;
    var authToken = req.body.token;
    var xml2js = require('xml2js');
    
    /*var data = JSON.stringify({"grant_type":"client_credentials","client_id":"lrdyhupmuhr4zl7vwj8a3giq","client_secret":"g8EvTsIYGpPFxovz9nKj0cXy","account_id":"514009708"});
    var authToken;
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
        console.log('authToken '+authToken);*/
        
        let soapMessage = '<?xml version="1.0" encoding="UTF-8"?>'
        +'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'
        +'    <s:Header>'
        +'        <a:Action s:mustUnderstand="1">Retrieve</a:Action>'
        +'        <a:To s:mustUnderstand="1">https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx</a:To>'
        +'        <fueloauth xmlns="http://exacttarget.com">'+authToken+'</fueloauth>'
        +'    </s:Header>'
        +'    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
        +'        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">'
        +'            <RetrieveRequest>'
        +'                <ObjectType>DataExtensionObject[Data Extension Template]</ObjectType>'
        +'                  <Properties>Hearsay Org ID</Properties>'
        +'                  <Properties>Hearsay User Reference ID</Properties>'
        +'                  <Properties>Customer Unique ID</Properties>'
        +'                  <Properties>Hearsay User Reference ID</Properties>'
        +'                  <Properties>Customer Name</Properties>'
        +'                  <Properties>Option 1</Properties>'
        +'                  <Properties>Option 2</Properties>'
        +'                  <Properties>Option 3</Properties>'
        +'                  <Properties>Option 4</Properties>'
        +'                <Filter xsi:type="SimpleFilterPart">'
        +'                  <Property>Template Name</Property>'
        +'                  <SimpleOperator>equals</SimpleOperator>'
        +'                  <Value>'+templateName+'</Value>'
        +'                </Filter>'
        +'            </RetrieveRequest>'
        +'        </RetrieveRequestMsg>'
        +'    </s:Body>'
        +'</s:Envelope>';

        var configs = {
            method: 'post',
            url: 'https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx',
                headers: { 
                'Content-Type': 'text/xml'
             },
             data : soapMessage
         };

         axios(configs)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                //let rawdata = response.data;
             
                var parser = new xml2js.Parser();
                parser.parseString(response.data, function(err,result){
                  console.log('result res body'+JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
                  let rawData = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
                  if(rawData){
                      res.status(200).send(rawData);
                  } else {
                      res.status(301).send('No rows retrieved');
                  } 
                });
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).send(error);
            });
        
    /*})
    .catch(function (error) {
      console.log(error);
    });*/
    //logData(req);
};

exports.retrieveDERows =  function (req, res) {
    console.log('request DEName is '+JSON.stringify(req.body));
    var xml2js = require('xml2js');
    var authToken = req.body.token;
    console.log('variable value '+process.env.mcEndpoint);
    /*var data = JSON.stringify({"grant_type":"client_credentials","client_id":"lrdyhupmuhr4zl7vwj8a3giq","client_secret":"g8EvTsIYGpPFxovz9nKj0cXy","account_id":"514009708"});
    var authToken;
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
        console.log('authToken '+authToken);*/
        
        let soapMessage = '<?xml version="1.0" encoding="UTF-8"?>'
        +'<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">'
        +'    <s:Header>'
        +'        <a:Action s:mustUnderstand="1">Retrieve</a:Action>'
        +'        <a:To s:mustUnderstand="1">https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx</a:To>'
        +'        <fueloauth xmlns="http://exacttarget.com">'+authToken+'</fueloauth>'
        +'    </s:Header>'
        +'    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">'
        +'        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">'
        +'            <RetrieveRequest>'
        +'                <ObjectType>DataExtensionObject[Data Extension Template]</ObjectType>'
        +'      <Properties>Template Name</Properties>'
        +'        <Properties>Hearsay Org ID</Properties>'
        +'        <Properties>Hearsay User Reference ID</Properties>'
        +'            </RetrieveRequest>'
        +'        </RetrieveRequestMsg>'
        +'    </s:Body>'
        +'</s:Envelope>';

        var configs = {
            method: 'post',
            url: 'https://'+process.env.mcEndpoint+'.soap.marketingcloudapis.com/Service.asmx',
                headers: { 
                'Content-Type': 'text/xml'
             },
             data : soapMessage
         };

         axios(configs)
            .then(function (response) {
                console.log(JSON.stringify(response.data));
                let rawdata = response.data;
             
                var parser = new xml2js.Parser();
                parser.parseString(rawdata, function(err,result){
                  console.log('result res body'+JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results']));
                  let rawData = result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'];
                  //var arrayList = [];
                  //for(var x in rawData){
                  //  console.log('data '+JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'][x]['Properties'][0]['Property'][0]['Value']));
                  //  arrayList.push(JSON.stringify(result['soap:Envelope']['soap:Body'][0]['RetrieveResponseMsg'][0]['Results'][x]['Properties'][0]['Property'][0]['Value']));
                 // }
                 // console.log('arrayList '+arrayList);
                  if(rawData){
                     res.status(200).send(rawData);
                  } else {
                      res.status(301).send('No rows retrieved');
                  }
                });
            })
            .catch(function (error) {
                console.log(error);
                res.status(500).send(error);
            });
        
    /*})
    .catch(function (error) {
      console.log(error);
    });*/
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
