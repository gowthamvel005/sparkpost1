define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';
	
    var connection = new Postmonger.Session();
    var payload = {};
    var authToken;
    var reviewPageEnabled = false;
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "label": "Template Selection", "key": "step1" },
        { "label": "Map the Template Field", "key": "step2", "active": false},
        { "label": "Review Template Field", "key": "step3", "active": false}
    ];
    var currentStep = steps[0].key;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    function onRender() {
        $('#inputField-01').hide();
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        
        // Disable the next button if a value isn't selected
        $('#select-01').change(function() {
            var message = getMessage();
            console.log('message value '+message);
            if(message == 'CurrentJourney'){
                //reviewPageEnabled = !reviewPageEnabled; // toggle status
                steps[1].active = true;
                steps[2].active = true; // toggle active
                $('#inputField-01').show();
                connection.trigger('updateSteps', steps);
            } else {
                //reviewPageEnabled = false; // toggle status
                steps[2].active = true;
                steps[1].active = false; // toggle active
                $('#inputField-01').hide();
                connection.trigger('updateSteps', steps);
            }
            $('#message').html(message);
        });
    }

    function initialize (data) {
        if (data) {
            payload = data;
        }
        
        var message;
        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        $.each(inArguments, function(index, inArgument) {
            $.each(inArgument, function(key, val) {
                if (key === 'message') {
                    message = val;
                }
            });
        });

        // If there is no message selected, disable the next button
        if (!message) {
            showStep(null, 1);
            connection.trigger('updateButton', { button: 'next', enabled: false });
            // If there is a message, skip to the summary step
        } else {
            $('#select-01').find('option[value='+ message +']').attr('selected', 'selected');
            $('#message').html(message);
            showStep(null, 3);
        }
    }

    function onGetTokens (tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
         console.log(tokens);
	 authToken = tokens.token;
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
         console.log(endpoints);
    }

    function onClickedNext () {
	var selectOption = getMessage();
        if (currentStep.key === 'step3') {
            save();
        } else if(currentStep.key === 'step1' && selectOption == 'CurrentJourney'){
		var input = $('#text-input-id-1')[0];
		var validityState_object = input.validity;
		if (validityState_object.valueMissing){
			
	    		input.setCustomValidity('Must enter your template name!');
	    		input.reportValidity();
			showStep(null, 1);
			connection.trigger('ready');
		} else {
			var myHeaders = new Headers();
			myHeaders.append("Content-Type", "text/xml");
			
			var raw = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<s:Envelope xmlns:s=\"http://www.w3.org/2003/05/soap-envelope\" xmlns:a=\"http://schemas.xmlsoap.org/ws/2004/08/addressing\" xmlns:u=\"http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd\">\n    <s:Header>\n        <a:Action s:mustUnderstand=\"1\">Retrieve</a:Action>\n        <a:To s:mustUnderstand=\"1\">https://.soap.marketingcloudapis.com/Service.asmx</a:To>\n        <fueloauth xmlns=\"http://exacttarget.com\">authToken</fueloauth>\n    </s:Header>\n    <s:Body xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">\n        <RetrieveRequestMsg xmlns=\"http://exacttarget.com/wsdl/partnerAPI\">\n            <RetrieveRequest>\n                <ObjectType>DataExtension</ObjectType>\n                <Properties>ObjectID</Properties>\n                <Properties>CustomerKey</Properties>\n                <Properties>Name</Properties>\n                <Properties>IsSendable</Properties>\n                <Properties>SendableSubscriberField.Name</Properties>\n                <Filter xsi:type=\"SimpleFilterPart\">\n                    <Property>CustomerKey</Property>\n                    <SimpleOperator>equals</SimpleOperator>\n                    <Value>Test_Job_Insert</Value>\n                </Filter>\n            </RetrieveRequest>\n        </RetrieveRequestMsg>\n    </s:Body>\n</s:Envelope>";
			
			fetch('/validate/dataextension/', { method: 'POST', headers: myHeaders,  body: raw }).then(response => response.text()).then(result => console.log(result)).catch(error => console.log('error', error));
	    		//connection.trigger('nextStep');
		}
        } else if(currentStep.key === 'step2'){
		connection.trigger('nextStep');
	}
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex-1];
        }

        currentStep = step;

        $('.step').hide();

         switch(currentStep.key) {
            case 'step1':
                $('#step1').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    enabled: Boolean(getMessage())
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: false
                });
                break;
            case 'step2':
                $('#step2').show();
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'done',
                    visible: true
                });
                break;
            case 'step3':
                $('#step3').show();
                connection.trigger('updateButton', {
                     button: 'back',
                     visible: true
                });
                connection.trigger('updateButton', {
                     button: 'next',
                     text: 'done',
                     visible: true
                });
                break;
        }
    }

    function save() {
        var name = $('#select-01').find('option:selected').html();
        var value = getMessage();

        // 'payload' is initialized on 'initActivity' above.
        // Journey Builder sends an initial payload with defaults
        // set by this activity's config.json file.  Any property
        // may be overridden as desired.
        payload.name = name;

        payload['arguments'].execute.inArguments = [{ "message": value }];

        payload['metaData'].isConfigured = true;

        connection.trigger('updateActivity', payload);
    }

    function getMessage() {
        return $('#select-01').find('option:selected').attr('value').trim();
    }

});
