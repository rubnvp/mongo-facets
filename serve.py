from flask import Flask
app = Flask(__name__)

# API
API_ENDPOINT = '/api'

@app.route(API_ENDPOINT + "/hello")
def hello():
    return "Hello from Flask!"

# Statics
@app.route('/')
def root():
  return app.send_static_file('index.html')

@app.route('/<path:path>')
def static_proxy(path):
  # send_static_file will guess the correct MIME type
  return app.send_static_file(path)