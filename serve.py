from flask import Flask, request, jsonify
from bson.json_util import dumps, loads
from pymongo import MongoClient

app = Flask(__name__)
client = MongoClient('localhost:27017')
db = client.test

def _get_array_param(param):
    return filter(None, param.split(","))

def _get_restaurants_pipeline(skip, limit, boroughs, cuisines):
    match = {}

    if boroughs:
        match['borough'] = {'$in': boroughs}
    if cuisines:
        match['cuisine'] = {'$in': cuisines}

    pipeline = [
        {'$match': match}
    ] if match else []

    pipeline += [
        {
            '$skip': skip,
        },
        {
            '$limit': limit,
        }
    ]

    return pipeline

def _get_facet_borough(cuisines):
    match = {}

    if cuisines:
        match['cuisine'] = {'$in': cuisines}

    pipeline = [
        {'$match': match}
    ] if match else []

    return pipeline + _get_group_pipeline('borough')

def _get_facet_cuisine(boroughs):
    match = {}

    if boroughs:
        match['borough'] = {'$in': boroughs}

    pipeline = [
        {'$match': match}
    ] if match else []

    return pipeline + _get_group_pipeline('cuisine')

def _get_group_pipeline(group_by):
    return [
        {
            '$group': {
                '_id': '$' + group_by,
                'count': {'$sum': 1},
            }
        },
        {
            '$project': {
                '_id': 0,
                'value': '$_id',
                'type': group_by,
                'count': 1,
            }
        },
        {
            '$sort': {'count': -1}
        },
        {
            '$limit': 5,
        }
    ]

# API
API_ENDPOINT = '/api'

@app.route(API_ENDPOINT + "/restaurants")
def restaurants_and_facets():
    # pagination
    page = int(request.args.get('page', '0'))
    page_size = int(request.args.get('page-size', '50'))
    skip = page * page_size
    limit = min(page_size, 50)

    # filters
    cuisines = _get_array_param(request.args.get('cuisines', ''))
    boroughs = _get_array_param(request.args.get('boroughs', ''))

    facet = {
        'restaurants': _get_restaurants_pipeline(skip, limit, boroughs, cuisines),
        'boroughs': _get_facet_borough(cuisines),
        'cuisines': _get_facet_cuisine(boroughs),
    }

    restaurants_and_facets = loads(dumps(db.restaurants.aggregate([{'$facet': facet}]))).pop()

    for restaurant in restaurants_and_facets['restaurants']: # remove _id, is an ObjectId and is not serializable
        restaurant.pop('_id')
    return jsonify(restaurants_and_facets)

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