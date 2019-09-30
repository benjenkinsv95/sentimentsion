import $ from 'jquery';
import handlers from './modules/handlers';
import msg from './modules/msg';
import Sentiment from 'sentiment';


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

console.log('CONTENT SCRIPT WORKS!'); // eslint-disable-line no-console



const showSentiment = node => {
    const text = node.text().trim()
    if (!text) {
        return
    }
    const sentimentResults = sentiment.analyze(text)
    console.log(JSON.stringify(sentimentResults, null, 2))

    const multiplier = 15
    const alpha = (Math.abs(sentimentResults.comparative) / 5) * multiplier
    console.log('alpha', alpha)
    if (sentimentResults.comparative > 0.10) {
        node.css('box-shadow', `inset 0px -2px 4px white, inset 0 -3px 0 rgba(0, 255, 0, ${alpha})`)
    } else if (sentimentResults.comparative < -0.15) {
        node.css('box-shadow', `inset 0px -2px 4px white, inset 0 -3px 0 rgba(255, 0, 0, ${alpha})`)
    }
}

const rebuildRegex = (splitArr, matches) => {
    let rebuiltStr = ""

    splitArr.forEach((text, i) => {
        rebuiltStr += text
        if (i < splitArr.length - 1) {
            rebuiltStr += matches[i]
        }
    })

    return rebuiltStr
}

const splitIntoSentencesAndWords = node => {
    const html = node.html()

    const regex = /[.,;"](?![^<]*>|[^<>]*<\/)/g
    const sentences = html.split(regex)
    const matches = html.match(regex) || []

    const newHtml = '<span>' + rebuildRegex(sentences, matches.map(match => `${match}</span><span>`)) + '</span>'
    node.html(newHtml)
}

const sentiment = new Sentiment();

// Select the node that will be observed for mutations
const targetNode = document.querySelector('body');

// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: true };

// Callback function to execute when mutations are observed
const callback = function(mutationsList, observer) {
    for(let mutation of mutationsList) {
        console.log('A child node has been added or removed.');
        for (let node of mutation.addedNodes) {
            const jQueryNode = $(node)
            console.log(jQueryNode)
            if ('p, h1, h2, h3, h4, h5, h6, div'.split(', ').some(tag => jQueryNode.is(tag))) {
                console.log('about to show new sentiment')
                splitIntoSentencesAndWords(jQueryNode)
            } else if(jQueryNode.is('span')) {
                showSentiment(jQueryNode)
            }
        }
    }
};




chrome.storage.sync.get({
    analysisOnPageLoad: false
}, function({analysisOnPageLoad, analysisEnabled}) {
    if (analysisOnPageLoad) {
        // Create an observer instance linked to the callback function
        const observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(document, config);



        $('p, h1, h2, h3, h4, h5, h6, span').each(function () {
            splitIntoSentencesAndWords($(this))
        })

        $('span').each(function () {
            showSentiment($(this))
        })
    }
})

msg.init('ct', handlers.create('ct'));

console.log('jQuery version:', $().jquery); // eslint-disable-line no-console
