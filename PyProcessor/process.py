from bs4 import BeautifulSoup
from pymongo import MongoClient
from nltk.sentiment import vader
import numpy as np
import pandas as pd
from pandas import DataFrame
import datetime
import math

def date_ms(timestamp):
    return datetime.datetime.utcfromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')


def find_boundaries(timestamp):
    first = math.floor(timestamp / 86400) * 86400
    second = first + ((24 * 60 * 60) - 1)
    return first, second


sia = vader.SentimentIntensityAnalyzer()

def vader_sentiment(text):
    return sia.polarity_scores(text)["compound"]

x = []
values = np.linspace(-1, 1, 21)
for a, b in zip(values[:-1], values[1:]):
   x.append([a, b, a + 0.05])
x = np.array(x)


def get_categorical_value(value):
   if value == -1:
       return -1
   if value == 0:
       return 0
   if value == 1:
       return 1
   filter1 = x[(x[:,0] < value)]
   filter1 = filter1[value <= filter1[:,1]]
   return filter1[0,2]

client = MongoClient('localhost', 27017)
db = client['twitter_db']
collection = db['twitter_bitcoin']

oldest_tweet = collection.find().sort([('timestamp', 1)]).limit(1)[0]
newest_tweet = collection.find().sort([('timestamp', -1)]).limit(1)[0]

start_start, start_end = find_boundaries(oldest_tweet["timestamp"])
end_start, end_end = find_boundaries(newest_tweet["timestamp"])

data = list()
a = 0
while start_start < end_end:
    a = 1+a
    tweets= collection.find({
        "timestamp": { "$gte": start_start, "$lte": start_end}}).sort([('timestamp', 1)])
    tweets = list(tweets)
    sentiments = np.zeros(len(tweets))
    for i, t in enumerate(tweets):
        sentiments[i] = vader_sentiment(t["tweetText"])
    meaned_sentiments= np.mean(sentiments)
    data.append([
        start_start,
        len(tweets),
        meaned_sentiments,
        get_categorical_value(meaned_sentiments)
    ])
    start_start, start_end = find_boundaries(start_end + 1)
aggregates = DataFrame(data)
aggregates.to_csv("out.csv",float_format='%.5f')