const https = require('https');
const request = require('request').defaults({ encoding: null });
const config = require('./config.js');
const Twit = require('twit');
const twitter = new Twit(config.twitter_config);

const host = 'api.cognitive.microsoft.com';
const searchPath = '/bing/v7.0/images/search';
const searchTerms = [
    'lol doll', 
    'lol surprise', 
    'lol fashion crush', 
    'lol bigger surprise', 
    'lol biggie pet', 
    'lol doll house', 
    'lol bling series',
    'lol confetti',
    'lol doll cake',
    'lol wave 2'
];

const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

function getDateTime () {
    return `[${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} ${new Date().toLocaleTimeString('en-US', { hour12: false })}]`;
}

function postStatus (obj) {
    return twitter.post('statuses/update', obj, (error, data, response) => {
        if (error) {
            console.error(error);
        } else {
            console.log(`${getDateTime()} posted to twitter`);
        }
    });
}

function postImg (data) {
    return twitter.post('media/upload', { media_data: data }, (error, data, response) => {
        return postStatus({
            status: '#LOL #LOLSurprise',
            media_ids: [data.media_id_string] 
        });
    });
}

function getImg (url) {
    return new Promise((resolve, reject) => {
        request.get(url, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                const buf = Buffer.from(body).toString('base64');
                resolve(buf);
            } else {
                console.error(`${getDateTime()} error getting image: ${error}`);
            }
        });
    })
}



function responseHandler (response) {
    let body = '';

    response.on('data', data => {
        body += data;
    });

    response.on('end', () => {
        const imageResults = JSON.parse(body);
        if (!imageResults.value.length) {
            throw 'error: no images found!';
        }
        const imgArray = imageResults.value;
        const img = imgArray[Math.floor(Math.random() * imgArray.length)];
        const url = img.thumbnailUrl.replace(/https/, 'http');
        console.log(`${getDateTime()} found image: ${url}.jpg`);
        return getImg(url + '.jpg').then(data => {
            return postImg(data);
        });
    });

    response.on('error', error => {
        console.error('error: ' + error.message);
    });

};

function bingImgSearch (term) {
    console.log(`${getDateTime()} search term: ${term}`);
    const params = {
        method : 'GET',
        hostname : host,
        path : searchPath + '?q=' + encodeURIComponent(term),
        headers : { 'Ocp-Apim-Subscription-Key' : config.bing_config.subscriptionKey }
    };
    const req = https.request(params, responseHandler);
    req.end();
}


bingImgSearch(searchTerm);
