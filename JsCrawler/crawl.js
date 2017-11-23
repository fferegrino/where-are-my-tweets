var nightmare = require("nightmare");
var util = require("util");
var moment = require("moment");
var $ = require("jquery");
var fs = require("fs");
var schedule = require("node-schedule");
var slugify = require('slug');
var ArgumentParser = require('argparse').ArgumentParser;
var path = require('path');


var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'Argparse example'
});

parser.addArgument(
    [ '-s', '--search_term' ],
    {
        help: 'The search term',
        required: true
    }
);

parser.addArgument(
    [ '-l', '--language' ],
    {
        help: 'The language to run the search on',
        required: false,
        defaultValue: 'en'
    }
);

parser.addArgument(
    [ '-from', '--from' ],
    {
        help: 'Date to in yyyy-MM-dd format',
        required: false,
        defaultValue: ''
    }
);

parser.addArgument(
    [ '-to', '--to' ],
    {
        help: 'Date from in yyyy-MM-dd format',
        required: true
    }
);

parser.addArgument(
    [ '-o', '--output_folder' ],
    {
        help: 'Date from in yyyy-MM-dd format',
        required: false,
        defaultValue: "./"
    }
);

var args = parser.parseArgs();

var language = args["language"];
var searchTerm = args["search_term"];

var dateTo = moment(args["to"]);
var dateFrom;
if(args["from"] === '')
    dateFrom  = moment().startOf('day');
else
    dateFrom = moment(args["from"]);

var slug = slugify(searchTerm);


var baseUrl = "https://twitter.com/search?f=tweets&l=%s&q=%s&src=typd";

var job = schedule.scheduleJob("*/5 * * * * *", function () {

    dateFrom.subtract(1, "d");
    var to = moment(dateFrom);
    to.add(1, 'd');

    var query = encodeURIComponent(util.format("%s since:%s until:%s",
        searchTerm,
        dateFrom.format("YYYY-MM-DD"),
        to.format("YYYY-MM-DD")));

    var actualUrl = util.format(baseUrl,
        language,
        query);

    console.log(actualUrl);

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
            file = path.join(args["output_folder"],dateFrom.format("YYYY-MM-DD") + "-" + slug + ".json");
            fs.writeFile(file, JSON.stringify(result), function (err) {
                if (err) {
                    console.log(err);
                } else {
                    //console.log("Data for " + dateFrom.format("YYYY-MM-DD") + " saved!");
                }
            });
        });



    if (dateTo.isAfter(dateFrom)) {
        job.cancel();
    }
});