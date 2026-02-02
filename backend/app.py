from flask import Flask, request, jsonify, abort
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Server logic failed", "message": str(error)}), 500

# expected data structure
# {
# "substrate_concentration": 10.5,
# "cost": 50
# }
@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "No data is provided"}), 400

        s_val = int(data.get("substrate_concentration", 0))
        cost = int(data.get("cost", 1))

        Vmax = 100
        Km = 5

        velocity = (Vmax*s_val)/(Km + s_val)

        efficiency = velocity/cost

        return jsonify({
            "status": "success",
            "velocity": round(velocity, 2),
            "efficiency": round(efficiency, 4)
        }), 200
    except Exception as e:
        print("inside exception===>")
        return jsonify({"status": "error", "message": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)