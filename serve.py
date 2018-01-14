from flask import Flask, request, jsonify
from bson.json_util import dumps, loads
from pymongo import MongoClient

app = Flask(__name__)
client = MongoClient('localhost:27017')
db = client.test

def _get_array_param(param):
    return filter(None, param.split(",")) if param else []

# API
API_ENDPOINT = '/api'

@app.route(API_ENDPOINT + "/restaurants/")
def restaurants():
    # pagination
    page = int(request.args.get('page', '0'))
    page_size = int(request.args.get('page-size', '50'))
    skip = page * page_size
    limit = min(page_size, 50)

    # filters
    cusines = _get_array_param(request.args.get('cuisines', None))

    filters = {}

    if len(cusines):
        filters['cuisine'] = {
            '$in': cusines
        }

    restaurants = list(db.restaurants.find(filters).skip(skip).limit(limit))

    for restaurant in restaurants: # remove _id, is an ObjectId and is not serializable
        restaurant.pop('_id')
    return jsonify(restaurants)

@app.route(API_ENDPOINT + "/restaurants/count")
def restaurants_count():
    restaurants_count = db.restaurants.find().count()
    return jsonify(restaurants_count)

# Statics
@app.route('/')
def root():
  return app.send_static_file('index.html')

@app.route('/<path:path>')
def static_proxy(path):
  # send_static_file will guess the correct MIME type
  return app.send_static_file(path)

# run the application without flask-cli
if __name__ == "__main__":
    app.run(debug=True)