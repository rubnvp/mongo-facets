from flask import Flask, request, jsonify
from pymongo import MongoClient

app = Flask(__name__, static_folder='../client')
client = MongoClient('localhost:27017')
db = client.test
API_ENDPOINT = '/api/v1'

def _get_array_param(param):
    return filter(None, param.split(","))

# API
@app.route(API_ENDPOINT + "/restaurants")
def restaurants():
    # pagination
    page = int(request.args.get('page', '0'))
    page_size = int(request.args.get('page-size', '50'))
    skip = page * page_size
    limit = min(page_size, 50)

    # filters
    search = request.args.get('search', '')
    boroughs = _get_array_param(request.args.get('boroughs', ''))
    cuisines = _get_array_param(request.args.get('cuisines', ''))
    zipcode = _get_array_param(request.args.get('zipcodes', ''))

    find = {}
    if search:
        find['$text'] = {'$search': search}
    if boroughs:
        find['borough'] = {'$in': boroughs}
    if cuisines:
        find['cuisine'] = {'$in': cuisines}
    if zipcode:
        find['address.zipcode'] = {'$in': zipcode}

    response = {
        'restaurants': list(db.restaurants.find(find).skip(skip).limit(limit)),
        'count': db.restaurants.find(find).count()
    }

    for restaurant in response['restaurants']:  # remove _id, is an ObjectId and is not serializable
        del restaurant['_id']
    return jsonify(response)

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