define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
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
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        // Disable the next button if a value isn't selected
        $('#select-01').change(function() {
            var message = getMessage();
            console.log('message value '+message);
            if(message != 'CurrentJourney'){
                //reviewPageEnabled = !reviewPageEnabled; // toggle status
                steps[1].active = false;
                steps[2].active = true; // toggle active
                $('#inputField-01').hide();
                connection.trigger('updateSteps', steps);
            } else {
                //reviewPageEnabled = false; // toggle status
                steps[2].active = false;
                steps[1].active = true; // toggle active
                $('#inputField-01').show();
                connection.trigger('updateSteps', steps);
            }
            $('#message').html(message);
        });
    }

    function initialize (data) {
        if (data) {
            payload = data;
        }
        $('#inputField-01').hide();
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
        // console.log(tokens);
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        // console.log(endpoints);
    }

    function onClickedNext () {
        if (currentStep.key === 'step3' || currentStep.key === 'step2') {
            save();
        } else {
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
