import handlers from './modules/handlers';
import msg from './modules/msg';
import form from './modules/form';
import runner from './modules/runner';
import $ from 'jquery';

// here we use SHARED message handlers, so all the contexts support the same
// commands. but this is NOT typical messaging system usage, since you usually
// want each context to handle different commands. for this you don't need
// handlers factory as used below. simply create individual `handlers` object
// for each context and pass it to msg.init() call. in case you don't need the
// context to support any commands, but want the context to cooperate with the
// rest of the extension via messaging system (you want to know when new
// instance of given context is created / destroyed, or you want to be able to
// issue command requests from this context), you may simply omit the
// `handlers` parameter for good when invoking msg.init()

console.log('POPUP SCRIPT WORKS!'); // eslint-disable-line no-console

const save = () => {
    console.log('saving')
    chrome.storage.sync.set({
        analysisOnPageLoad: $('#power-off').hasClass('blue-text')
    }, function() {
        const enabled = $('#power-off').hasClass('blue-text')
        $('#status').text(`Analysis ${enabled ? 'enabled!' : 'disabled!'}`)
        setTimeout(function() {
            $('#status').text('')
        }, 2000);
    });
}

chrome.storage.sync.get({
    analysisOnPageLoad: false
}, function({analysisOnPageLoad}) {
    const powerColor = analysisOnPageLoad ? 'blue-text' : 'blue-grey-text'
    const powerOff = $('#power-off')
    powerOff.addClass(powerColor)

    powerOff.on('click', event => {
        if (powerOff.hasClass('blue-text')) {
            powerOff.removeClass('blue-text')
            powerOff.addClass('blue-grey-text')
        } else {
            powerOff.removeClass('blue-grey-text')
            powerOff.addClass('blue-text')
        }
        save()
    })

})

form.init(runner.go.bind(runner, msg.init('popup', handlers.create('popup'))));
