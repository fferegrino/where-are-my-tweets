var Nightmare = require('nightmare');
var util = require('util');
var moment = require('moment');

const nightmare = Nightmare({ show: true });

var language = 'es';
var searchTerm = "#bitcoin";
var daysToCover = 1;
var dateFrom = moment(new Date(2017, 9, 2));
var dateTo = moment(new Date(2017, 9, 3));

var baseUrl = "https://twitter.com/search?l=%s&q=%s&src=typd";
var query = encodeURIComponent(util.format("%s since:%s until:%s",
    searchTerm,
    dateFrom.format("YYYY-MM-DD"),
    dateTo.format("YYYY-MM-DD")));

var actualUrl = util.format(baseUrl,
    language,
    query);

console.log(actualUrl);

//nightmare
//    .goto('https://twitter.com/search?l=es&q=%23bitcoin%20since%3A2017-09-24%20until%3A2017-09-27&src=typd')
//    .type('input[name=ands]', 'github nightmare')
//    .type('input[name=since]', '2017-10-03')
//    .type('input[name=until]', '2017-10-04')
//    //.click('#search_button_homepage')
//    .wait('#r1-0 a.result__a')
//    .evaluate(() => document.querySelector('#r1-0 a.result__a').href)
//    .end()
//    .then(console.log)
//    .catch((error) => {
//        console.error('Search failed:', error);
//    });