"""
Auth routes: signup and login using a simple JSON file store.
Users are persisted in data/users.json for future sign-in.
"""
import os
import json
from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
USERS_FILE = os.path.join(BASE_DIR, 'data', 'users.json')


def _ensure_data_dir():
    """Create data directory and users.json if they don't exist."""
    data_dir = os.path.dirname(USERS_FILE)
    os.makedirs(data_dir, exist_ok=True)
    if not os.path.exists(USERS_FILE):
        _write_users(_get_demo_users())


def _get_demo_users():
    """Return demo users to seed the store."""
    return {
        'arjun.sharma': {
            'password': 'Flood@2024',
            'name': 'Arjun Sharma',
            'type': 'user',
            'district': 'Hyderabad',
            'state': 'Telangana',
        },
        'priya.reddy': {
            'password': 'Urban@5678',
            'name': 'Priya Reddy',
            'type': 'user',
            'district': 'Visakhapatnam',
            'state': 'Andhra Pradesh',
        },
        'kiran.kumar': {
            'password': 'Rain#9012',
            'name': 'Kiran Kumar',
            'type': 'user',
            'district': 'Warangal',
            'state': 'Telangana',
        },
        'planner.ap': {
            'password': 'AP@Admin2024',
            'name': 'AP State Planner',
            'type': 'planner',
            'access': 'Andhra Pradesh',
        },
        'planner.tg': {
            'password': 'TG@Admin2024',
            'name': 'TG State Planner',
            'type': 'planner',
            'access': 'Telangana',
        },
        'admin.floodsense': {
            'password': 'FloodSense@Master',
            'name': 'FloodSense Admin',
            'type': 'planner',
            'access': 'Both States',
        },
    }


def _read_users():
    """Load users from JSON file."""
    _ensure_data_dir()
    with open(USERS_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def _write_users(users):
    """Save users to JSON file."""
    data_dir = os.path.dirname(USERS_FILE)
    os.makedirs(data_dir, exist_ok=True)
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=2, ensure_ascii=False)


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    POST /api/auth/forgot-password
    Body: { userId, newPassword }
    Updates the password for an existing user (user or planner).
    """
    try:
        data = request.get_json()
        user_id = (data.get('userId') or '').strip().lower()
        new_password = data.get('newPassword') or ''

        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        if not new_password:
            return jsonify({'error': 'New password is required'}), 400

        users = _read_users()
        if user_id not in users:
            return jsonify({'error': 'User ID not found'}), 404

        users[user_id]['password'] = new_password
        _write_users(users)

        return jsonify({'success': True}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    POST /api/auth/signup
    Body: { fullName, userId, password, district?, state? }
    Creates a new user and stores in users.json.
    """
    try:
        data = request.get_json()
        full_name = (data.get('fullName') or '').strip()
        user_id = (data.get('userId') or '').strip().lower()
        password = data.get('password') or ''
        # allow explicit type or default to regular user
        user_type = (data.get('type') or 'user').strip().lower()
        # planner accounts require an access field, users can provide district/state
        district = (data.get('district') or 'Hyderabad').strip()
        state = (data.get('state') or 'Telangana').strip()
        access = (data.get('access') or '').strip()

        if not full_name:
            return jsonify({'error': 'Full name is required'}), 400
        if not user_id:
            return jsonify({'error': 'User ID is required'}), 400
        if not password:
            return jsonify({'error': 'Password is required'}), 400
        if user_type not in ('user', 'planner'):
            return jsonify({'error': 'Invalid account type'}), 400
        if user_type == 'planner' and not access:
            return jsonify({'error': 'Planner access value is required'}), 400

        users = _read_users()
        if user_id in users:
            return jsonify({'error': 'Username already taken'}), 400

        # build the record based on user_type
        record = {
            'password': password,
            'name': full_name,
            'type': user_type,
        }
        if user_type == 'planner':
            record['access'] = access
        else:
            record['district'] = district
            record['state'] = state

        users[user_id] = record
        _write_users(users)

        # Return user data for session storage (no password)
        resp_user = {
            'userId': user_id,
            'name': full_name,
            'type': user_type,
        }
        if user_type == 'planner':
            resp_user['access'] = access
        else:
            resp_user['district'] = district
            resp_user['state'] = state

        return jsonify({
            'success': True,
            'user': resp_user,
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    POST /api/auth/login
    Body: { userId, password }
    Verifies credentials and returns user data for session.
    """
    try:
        data = request.get_json()
        user_id = (data.get('userId') or '').strip().lower()
        password = data.get('password') or ''

        if not user_id or not password:
            return jsonify({'error': 'User ID and password are required'}), 400

        users = _read_users()
        user = users.get(user_id)

        if not user:
            return jsonify({'error': 'Invalid User ID'}), 401

        if user['password'] != password:
            return jsonify({'error': 'Incorrect Password'}), 401

        # Build response (no password)
        resp = {
            'userId': user_id,
            'name': user['name'],
            'type': user.get('type', 'user'),
            'district': user.get('district'),
            'state': user.get('state'),
            'access': user.get('access'),
        }
        return jsonify({'success': True, 'user': resp}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
