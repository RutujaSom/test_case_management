from flask import Flask, request

app = Flask(__name__)

@app.route('/receive-data', methods=['POST'])
def receive_data():
    data = request.json
    print("Data received from ERPNext:", data)
    return "OK", 200
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

