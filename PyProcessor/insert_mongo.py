from os import listdir
from os.path import isfile, join

import json
from pymongo import MongoClient

client = MongoClient('localhost', 27017)
db = client['twitter_db']
collection = db['twitter_bitcoin']

nl = "$numberLong"

input_folder = ""

json_files_to_analyze = [f for
                         f in listdir(input_folder)
                            if isfile(join(input_folder, f)) and f.endswith(".json")]

def clean_user(tweet, title = None):
    if "user" in tweet and tweet["user"] != None:
        if not isinstance(tweet["user"]["id"], int):
            tweet["user"]["id"] = int(tweet["user"]["id"][nl])

def clean_replies(tweet, title= None):
    if "in_reply_to_status_id" in tweet and tweet["in_reply_to_status_id"] != None:
        if not isinstance(tweet["in_reply_to_status_id"], int):
            tweet["in_reply_to_status_id"] = int(tweet["in_reply_to_status_id"][nl])

    if "in_reply_to_user_id" in tweet and tweet["in_reply_to_user_id"] != None:
        if not isinstance(tweet["in_reply_to_user_id"], int):
            tweet["in_reply_to_user_id"] = int(tweet["in_reply_to_user_id"][nl])

def clean_entities(tweet, title = None):
    entities_names = ["entities", "extended_entities"]
    media_names = ["hashtags","urls","user_mentions","symbols","media"]
    id_to_clean = ["id", "source_status_id", "source_user_id"]
    if title is not None:
        print("\tCleaning "+title)
    for entities in entities_names:
        if entities in tweet and tweet[entities] != None:
            for media_name in media_names:
                if media_name in tweet[entities]:
                    for media in tweet[entities][media_name]:
                        for id_clean in id_to_clean:
                            if id_clean in media and not isinstance(media[id_clean], int):
                                media[id_clean] = int(media[id_clean][nl])


ii = 1
iii = 1

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
                print("Now:", tweet["tweetId"])

                collection.insert(tweet)
                ii = ii + 1
            else:
                print("Duplicate", t["tweetId"], t["timestamp"] ) 
                iii = iii + 1

print("Inserted", ii)  
print("Duplicates", iii)