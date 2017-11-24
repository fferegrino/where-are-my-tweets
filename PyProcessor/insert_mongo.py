from os import listdir
from os.path import isfile, join

import json
from pymongo import MongoClient

# Configure mongo client
client = MongoClient('localhost', 27017)
db = client['twitter_db']
collection = db['twitter_bitcoin']

input_folder = ""

json_files_to_analyze = [f for
                         f in listdir(input_folder)
                            if isfile(join(input_folder, f)) and f.endswith(".json")]

insertion_count = 1
duplicates_count = 1

for j_file in json_files_to_analyze:
    with open(join(input_folder, j_file)) as data_file:
        tweets = json.load(data_file)
        for tweet in tweets:
            tweetId = int(tweet["tweetId"])
            t = collection.find_one({"_id": tweetId})
            if t is None:
                tweet["tweetId"] = tweetId
                tweet["_id"] = tweetId
                tweet["timestamp"] = int(tweet["timestamp"])

                collection.insert(tweet)
                insertion_count = insertion_count + 1
            else:
                duplicates_count = duplicates_count + 1

print("Inserted", insertion_count)
print("Duplicates", duplicates_count)