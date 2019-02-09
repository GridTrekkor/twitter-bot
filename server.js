const https = require('https');
const request = require('request').defaults({ encoding: null });
const Twit = require('twit');
const config = require('./config.js');
const twitter = new Twit(config.twitter_config);

function postStatus (obj) {
    return twitter.post('statuses/update', obj, (err, data, response) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`posted to twitter`);
        }
    });
}

function postImg (data) {
    return twitter.post('media/upload', { media_data: data }, (err, data, response) => {
        return postStatus({
            status: '#LOL #LOLSurprise',
            media_ids: [data.media_id_string] 
        });
    });
}const

function getImg (url) {
    return new Promise((resolve, reject) => {
        request.get(url, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                const buf = Buffer.from(body).toString('base64');
                resolve(buf);
            } else {
                console.error(`error getting image: ${error}`);
            }
        });
    })
}

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
        console.log(`found image: ${url}.jpg`);
        return getImg(url + '.jpg').then(data => {
            return postImg(data);
        });
    });

    response.on('error', err => {
        console.error('error: ' + err.message);
    });

};

function bingImgSearch (term) {
    console.log('search term: ' + term);
    let params = {
        method : 'GET',
        hostname : host,
        path : searchPath + '?q=' + encodeURIComponent(term),
        headers : { 'Ocp-Apim-Subscription-Key' : config.bing_config.subscriptionKey }
    };
    let req = https.request(params, responseHandler);
    req.end();
}

const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];

bingImgSearch(searchTerm);
