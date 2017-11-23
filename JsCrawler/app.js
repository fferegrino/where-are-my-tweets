var nightmare = require("nightmare");
var util = require("util");
var moment = require("moment");
var $ = require("jquery");
var fs = require("fs");
var schedule = require("node-schedule");
var slugify = require('slug')
var ArgumentParser = require('argparse').ArgumentParser;

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'Argparse example'
});

// Year, Month (zero based), Day


https://twitter.com/search?vertical=news&q=bitcoin%20since%3A2012-11-13%20until%3A2012-11-14&src=typd
var baseUrl = "https://twitter.com/search?f=tweets&l=%s&q=%s&src=typd";

var job = schedule.scheduleJob("*/5 * * * * *", function () {

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
                var tweetId = tweetDiv.attr("data-tweet-id");
                var screenName = tweetDiv.find("span.username").text();
                var fullName = tweetDiv.find("strong.fullname").text();
                var timeStamp = tweetDiv.find("span._timestamp").attr("data-time");
                var tweetText = tweetDiv.find("p.tweet-text").text();
                var rawHtml = tweetDiv.find("p.tweet-text").html();
                var actionCount = tweetDiv.find(".ProfileTweet-actionCount");
                var replies = $(actionCount[0]).attr("data-tweet-stat-count");
                var retweets = $(actionCount[1]).attr("data-tweet-stat-count");
                var likes = $(actionCount[2]).attr("data-tweet-stat-count");
                var tweet =
                    {
                        tweetId: tweetId,
                        screenName: screenName,
                        fullName: fullName,
                        tweetText: tweetText,
                        rawHtml: rawHtml,
                        timestamp: timeStamp,
                        replies: parseInt(replies),
                        retweets: parseInt(retweets),
                        likes: parseInt(likes)
                    };
                tweets.push(tweet);
            }
            return tweets;
        })
        .end()
        .then(function (result) {
            fs.writeFile("data/" + dateFrom.format("YYYY-MM-DD") + "-" + slug + "-tweets.json", JSON.stringify(result), function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Data for " + dateFrom.format("YYYY-MM-DD") + " saved!");
                }
            });
        });



    if (dateTo.isAfter(dateFrom)) {
        console.log("Trabajo terminado");
        job.cancel();
    }
});