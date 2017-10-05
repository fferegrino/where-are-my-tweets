var Nightmare = require('nightmare');
var util = require('util');
var moment = require('moment');
var $ = require("jquery");
var fs = require('fs');


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

// console.log(actualUrl);

nightmare
    .goto(actualUrl)
    .wait('.stream-items')
    .evaluate(function(){
        var tweets = [],
        tweetDivs = $("div.tweet");
        for(var i=0; i < tweetDivs.length; i++) {
            var tweetDiv = $(tweetDivs[i]);
            var tweet_id = tweetDivs.attr("data-tweet-id");
            var screen_name = tweetDiv.find("span.username").text();
            var full_name = tweetDiv.find("strongs.fullname").text();
            var tweet_text = tweetDiv.find("p.tweet-text").text();
            var raw_html = tweetDiv.find("p.tweet-text").html();
            var tweet = 
            { 
                tweetId: tweet_id, 
                screenName: screen_name, 
                fullName: full_name,
                tweetText: tweet_text,
                rawHtml: raw_html
            };
            tweets.push(tweet);
        }
        return tweets; /// -- send arr in then as result
    })
    .end()
    .then(function(result){ // <--- its arr in result


        fs.writeFile(dateFrom.format("YYYY-MM-DD") + ".json", JSON.stringify(result), function(err) {
            if(err) {
                return console.log(err);
            }else{
                console.log("Data for " + dateFrom.format("YYYY-MM-DD") + " saved!");
            }
        }); 
        console.log();
    });