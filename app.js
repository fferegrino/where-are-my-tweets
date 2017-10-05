var Nightmare = require('nightmare');
var util = require('util');
var moment = require('moment');
var $ = require("jquery");
var fs = require('fs');
var schedule = require('node-schedule');



var language = 'es';
var searchTerm = "#bitcoin";
var daysToCover = 1;
var dateFrom = moment(new Date(2017, 9, 3));

var baseUrl = "https://twitter.com/search?l=%s&q=%s&src=typd";


var j = schedule.scheduleJob('*/10 * * * * *', function()
{

    console.log(dateFrom.subtract(1, 'd'));
    var to = moment(dateFrom);
    to.add(1, 'd')
    var query = encodeURIComponent(util.format("%s since:%s until:%s",
    searchTerm,
    dateFrom.format("YYYY-MM-DD"),
    to.format("YYYY-MM-DD")));


    var actualUrl = util.format(baseUrl,
        language,
        query);

    console.log(moment());        
    console.log("Executing: " + actualUrl);
    
    var nightmare = Nightmare({ show: false });
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
                var full_name = tweetDiv.find("strong.fullname").text();
                var time_stamp = tweetDiv.find("span._timestamp").attr("data-time");
                var tweet_text = tweetDiv.find("p.tweet-text").text();
                var raw_html = tweetDiv.find("p.tweet-text").html();
                var tweet = 
                { 
                    tweetId: tweet_id, 
                    screenName: screen_name, 
                    fullName: full_name,
                    tweetText: tweet_text,
                    rawHtml: raw_html,
                    timestamp: time_stamp
                };
                tweets.push(tweet);
            }
            return tweets;
        })
        .end()
        .then(function(result){ 
            fs.writeFile(dateFrom.format("YYYY-MM-DD") + "-tweets.json", JSON.stringify(result), function(err) {
                if(err) {
                    console.log(err);
                    return console.log(err);
                }else{
                    console.log("Data for " + dateFrom.format("YYYY-MM-DD") + " saved!");
                }
            }); 
        });
    } );