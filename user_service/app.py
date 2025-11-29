import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
# Allow CORS for port 3000
CORS(app, resources={r"/*": {"origins": "*"}})

# READ CONFIG FROM DOCKER ENV
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/mihir_troll_db')
app.config['JWT_SECRET_KEY'] = 'never_gonna_give_you_up'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True)
    password_hash = db.Column(db.String(255))
    wallet_balance = db.Column(db.Numeric(10, 2))
    avatar_meme = db.Column(db.String(100))

@app.route('/api/users/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username taken by another Troll!"}), 400

    hashed = generate_password_hash(data['password'])
    new_user = User(username=username, password_hash=hashed, wallet_balance=420.69)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"msg": "Welcome home, creature."}), 201

@app.route('/api/users/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"msg": "YOU SHALL NOT PASS!"}), 401
    
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "username": user.username, "balance": str(user.wallet_balance)})

@app.route('/api/users/wallet', methods=['GET'])
@jwt_required()
def get_wallet():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    reaction = "panik" if user.wallet_balance < 20 else "kalm"
    if user.wallet_balance > 1000: reaction = "stonks"
    return jsonify({
        "balance": str(user.wallet_balance),
        "reaction": reaction,
        "roast": "Bro is broke" if user.wallet_balance < 10 else "We eatin' good tonight"
    })

@app.route('/api/internal/deduct', methods=['POST'])
def deduct():
    data = request.json
    user = User.query.get(data['user_id'])
    cost = float(data['amount'])
    if user.wallet_balance < cost:
        return jsonify({"success": False}), 400
    user.wallet_balance = float(user.wallet_balance) - cost
    db.session.commit()
    return jsonify({"success": True})

if __name__ == '__main__':
    # CRITICAL: host='0.0.0.0' allows Docker to expose the port
    app.run(host='0.0.0.0', port=5001, debug=True)