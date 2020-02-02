const axios = require('axios');
const $ = require('cheerio');
var cron = require('node-cron');
const notifier = require('node-notifier');
const fs = require('fs');

const url = 'http://www.traderscockpit.com/?pageView=live-nifty-advance-decline-ratio-chart';

var config = JSON.parse(fs.readFileSync('config.json'));
var cronExpression = config.cron || "*/15 9-15 * * *";
var notificationSound = config.notificationSound || true;


if(!cron.validate(cronExpression)){
    console.error('Cron expression is not valid');
    process.exit();
}


var message = '';
cron.schedule('*/1 9-20 * * *', ()=> {
    axios.get(url).then(response => {
        console.log('Received the response');
        message = getData(response.data);
        notifier.notify({
            'title': 'NSE Advance Decline Ratio',
            'message': message,
            'sound' : notificationSound
          });
    }).catch(error => {
        console.log(error);
    });
});


let getData = html => {

    var data = '';
    var advance = '';
    var decline = '';
    var raio ='';
    $('.advDec', html).each((i, elem) => {
        if($(elem).text().includes('Advanced')){
            advance = $(elem).text().slice(10);
        }
        if($(elem).text().includes('Declined')){
            decline = $(elem).text().slice(10);
        }
        data = data + $(elem).text() + '\n';
    }
    );
    ratio = "Ratio:    " + (advance/decline).toFixed(2);
    data = data + ratio;
    console.log(data);
    return data;
}