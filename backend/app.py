import csv
import io
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
        return jsonify({"status": "error", "message": str(e)}), 400


@app.route("/api/stability", methods=["POST"])
def check_stability():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "No data is provided"}), 400

        temperature = float(data.get("temperature"))

        pH = float(data.get("pH"))

        if pH < 0 or pH > 14:
            return jsonify({"error": "pH value must be between 0 and 14"}), 400

        result = []

        if temperature > 40: 
            result.append("Heat Denaturation")
        if pH < 7.4:
            result.append("Acidic Instabilty")
        if temperature <= 40 and pH >= 7.4:
            result.append("Stable")

        res = " ,".join(result)

        return jsonify({"result" : res}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route("/api/upload_csv", methods=["POST"])
def upload_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
        
    try:
        stream = file.read().decode("utf-8")
        csv_file = io.StringIO(stream)
        csv_reader = csv.DictReader(csv_file)

        results = []

        for row in csv_reader:
            if "substrate_concentration" in row and "cost" in row:
            # if row.get("substrate_concentration") and row.get("cost"):
                try:
                    s = float(row["substrate_concentration"])
                    c = float(row["cost"])

                    efficiency = s*1.5/c

                    results.append({
                        "s": s,
                        "c": c,
                        "eff": round(efficiency, 4)
                    })
                except ValueError:
                    continue #skip bad rows
        
        return jsonify({"results": results}), 200

    except Exception as e:
        return jsonify({"status": "error", "message": str(e) }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)