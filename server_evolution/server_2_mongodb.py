from pymongo import MongoClient

# connect to database test in localhost
client = MongoClient('localhost:27017')
db = client.test

# read from db
print list(db.restaurants.find({'name': 'Morris Park Bake Shop'}))