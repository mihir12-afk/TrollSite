import os
import requests
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/mihir_troll_db')
app.config['JWT_SECRET_KEY'] = 'never_gonna_give_you_up'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)

USER_SERVICE_URL = os.getenv('USER_SERVICE_URL', 'http://localhost:5001')

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)
    vehicle = db.Column(db.String(50))
    amount = db.Column(db.Numeric(10, 2))
    receipt_ascii = db.Column(db.Text)

@app.route('/api/tolls/pay', methods=['POST'])
@jwt_required()
def pay():
    user_id = get_jwt_identity()
    data = request.json
    amount = 15.69 # Fixed for demo
    
    # Internal communication to User Service
    try:
        # We use the internal docker name 'user_service' here
        deduct_url = f"{USER_SERVICE_URL}/api/internal/deduct"
        resp = requests.post(deduct_url, json={"user_id": user_id, "amount": amount})
        
        if resp.status_code != 200:
            return jsonify({"msg": "Not enough money!"}), 400
            
        new_txn = Transaction(user_id=user_id, vehicle=data.get('vehicle'), amount=amount, receipt_ascii="PAID")
        db.session.add(new_txn)
        db.session.commit()
        
        return jsonify({"status": "success", "receipt": "Paid $15.69"})
    except Exception as e:
        return jsonify({"msg": f"Connection Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)