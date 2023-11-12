from flask import Flask, jsonify
import base64
from wasmtime import wat2wasm as Wat2Wasm

app = Flask(__name__)


@app.route('/')
def hello():
    return 'Hello, world'


@app.route('/convert/<wat>')
def convert(wat):
    wat_string = base64.b64decode(wat).decode('utf-8')
    wasm_bytes = Wat2Wasm(wat_string.encode('utf-8'))
    base64_encoded_wasm = base64.b64encode(wasm_bytes).decode('utf-8')
    return base64_encoded_wasm


app.run(port=5000, debug=True)
