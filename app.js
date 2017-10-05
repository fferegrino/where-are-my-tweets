var nightmare = require("nightmare");
var util = require("util");
var moment = require("moment");
var $ = require("jquery");
var fs = require("fs");
var schedule = require("node-schedule");

var language = "en";
var searchTerm = "#bitcoin";
var dateFrom = moment(new Date(2017, 9, 3));

var baseUrl = "https://twitter.com/search?l=%s&q=%s&src=typd";

var job = schedule.scheduleJob("*/10 * * * * *", function () {

    var to = moment(dateFrom);
    to.add(1, 'd');
    dateFrom.subtract(1, "d");

    var query = encodeURIComponent(util.format("%s since:%s until:%s",
        searchTerm,
        dateFrom.format("YYYY-MM-DD"),
        to.format("YYYY-MM-DD")));

    var actualUrl = util.format(baseUrl,
        language,
        query);

    var nightmareInstance = nightmare({ show: false });
    nightmareInstance
        .goto(actualUrl)
        .wait(".stream-items")
        .evaluate(function () {
            var tweets = [],
                tweetDivs = $("div.tweet");
            for (var i = 0; i < tweetDivs.length; i++) {
                var tweetDiv = $(tweetDivs[i]);
                var tweetId = tweetDivs.attr("data-tweet-id");
                var screenName = tweetDiv.find("span.username").text();
                var fullName = tweetDiv.find("strong.fullname").text();
                var timeStamp = tweetDiv.find("span._timestamp").attr("data-time");
                var tweetText = tweetDiv.find("p.tweet-text").text();
                var rawHtml = tweetDiv.find("p.tweet-text").html();
                var tweet =
                    {
                        tweetId: tweetId,
                        screenName: screenName,
                        fullName: fullName,
                        tweetText: tweetText,
                        rawHtml: rawHtml,
                        timestamp: timeStamp
                    };
                tweets.push(tweet);
            }
            return tweets;
        })
        .end()
        .then(function (result) {
            fs.writeFile(dateFrom.format("YYYY-MM-DD") + "-tweets.json", JSON.stringify(result), function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Data for " + dateFrom.format("YYYY-MM-DD") + " saved!");
                }
            });
        });
});