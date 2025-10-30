from flask import Flask, request, jsonify, send_from_directory
import sqlite3
import os
from flask_cors import CORS
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__, static_folder="../dist", static_url_path="/")
# SOLUTION COMPLÈTE CORS - TOUTES LES SOLUTIONS STACK OVERFLOW APPLIQUÉES
from flask_cors import CORS
# Configuration CORS complète - Solution Stack Overflow #1
CORS(app, resources={
    r"/*": {
        "origins": ["*"],  # Allow all origins explicitly
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        "allow_headers": ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers", "X-Admin-Request"],
        "supports_credentials": False,  # Important pour éviter les conflits
        "expose_headers": ["Content-Type", "Authorization"],
        "max_age": 86400
    }
})

# Solution Stack Overflow #2 - Headers manuels complets
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, X-Admin-Request'
    response.headers['Access-Control-Allow-Credentials'] = 'false'
    response.headers['Access-Control-Max-Age'] = '86400'
    response.headers['Access-Control-Expose-Headers'] = 'Content-Type, Authorization'
    # Additional headers for better CORS support
    response.headers['Access-Control-Allow-Private-Network'] = 'true'
    response.headers['Cross-Origin-Embedder-Policy'] = 'unsafe-none'
    response.headers['Cross-Origin-Opener-Policy'] = 'unsafe-none'
    return response

# Solution Stack Overflow #3 - Gestion OPTIONS explicite
@app.route('/<path:path>', methods=['OPTIONS'])
def handle_options(path):
    response = jsonify({'status': 'ok'})
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, X-Admin-Request'
    response.headers['Access-Control-Max-Age'] = '86400'
    response.headers['Access-Control-Allow-Private-Network'] = 'true'
    return response, 200

# Solution Stack Overflow #4 - Route OPTIONS globale
@app.before_request
def handle_preflight_request():
    if request.method == 'OPTIONS':
        response = app.make_response('')
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers, X-Admin-Request'
        response.headers['Access-Control-Max-Age'] = '86400'
        response.headers['Access-Control-Allow-Private-Network'] = 'true'
        return response, 200

# Database configuration - supports both SQLite (local) and PostgreSQL (production)
USE_POSTGRESQL = os.environ.get('USE_POSTGRESQL', 'false').lower() == 'true'

if USE_POSTGRESQL:
    # PostgreSQL configuration for production
    DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/tracksite')
else:
    # SQLite fallback for local development
    DATABASE = os.environ.get('DATABASE_PATH', 'database.db')

def get_db():
    if USE_POSTGRESQL:
        # PostgreSQL connection
        conn = psycopg2.connect(DATABASE_URL)
        conn.cursor_factory = RealDictCursor
        return conn
    else:
        # SQLite connection (fallback)
        db = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
        return db

def init_db():
    with app.app_context():
        db = get_db()
        if USE_POSTGRESQL:
            # PostgreSQL table creation - use cursor
            cursor = db.cursor()
            cursor.execute('''CREATE TABLE IF NOT EXISTS locations (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                country TEXT NOT NULL
            )''')
        else:
            # SQLite table creation
            db.execute('''CREATE TABLE IF NOT EXISTS locations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                country TEXT NOT NULL
            )''')

        # Zones table
        if USE_POSTGRESQL:
            cursor.execute('''CREATE TABLE IF NOT EXISTS zones (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                locations TEXT NOT NULL,
                description TEXT
            )''')
        else:
            db.execute('''CREATE TABLE IF NOT EXISTS zones (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                locations TEXT NOT NULL,
                description TEXT
            )''')

        # Shipping rates table
        if USE_POSTGRESQL:
            cursor.execute('''CREATE TABLE IF NOT EXISTS shipping_rates (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('flat', 'weight')),
                min_weight REAL NOT NULL DEFAULT 0,
                max_weight REAL NOT NULL DEFAULT 0,
                rate REAL NOT NULL,
                insurance REAL NOT NULL DEFAULT 0,
                description TEXT
            )''')
        else:
            db.execute('''CREATE TABLE IF NOT EXISTS shipping_rates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('flat', 'weight')),
                min_weight REAL NOT NULL DEFAULT 0,
                max_weight REAL NOT NULL DEFAULT 0,
                rate REAL NOT NULL,
                insurance REAL NOT NULL DEFAULT 0,
                description TEXT
            )''')

        # Pickup rates table
        if USE_POSTGRESQL:
            cursor.execute('''CREATE TABLE IF NOT EXISTS pickup_rates (
                id SERIAL PRIMARY KEY,
                zone TEXT NOT NULL,
                min_weight REAL NOT NULL DEFAULT 0,
                max_weight REAL NOT NULL DEFAULT 0,
                rate REAL NOT NULL,
                description TEXT
            )''')
        else:
            db.execute('''CREATE TABLE IF NOT EXISTS pickup_rates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                zone TEXT NOT NULL,
                min_weight REAL NOT NULL DEFAULT 0,
                max_weight REAL NOT NULL DEFAULT 0,
                rate REAL NOT NULL,
                description TEXT
            )''')

        # Shipments table
        if USE_POSTGRESQL:
            cursor.execute('''CREATE TABLE IF NOT EXISTS shipments (
                id SERIAL PRIMARY KEY,
                tracking_number TEXT UNIQUE,
                shipper_name TEXT NOT NULL,
                shipper_address TEXT NOT NULL,
                shipper_phone TEXT NOT NULL,
                shipper_email TEXT NOT NULL,
                receiver_name TEXT NOT NULL,
                receiver_address TEXT NOT NULL,
                receiver_phone TEXT NOT NULL,
                receiver_email TEXT NOT NULL,
                origin TEXT NOT NULL,
                destination TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('pending_confirmation', 'processing', 'picked_up', 'in_transit', 'delivered', 'delayed', 'rejected', 'cancelled')),
                packages INTEGER NOT NULL DEFAULT 1,
                total_weight REAL NOT NULL,
                product TEXT,
                quantity INTEGER DEFAULT 1,
                payment_mode TEXT DEFAULT 'Cash',
                total_freight REAL DEFAULT 0,
                expected_delivery TEXT,
                departure_time TEXT,
                pickup_date TEXT,
                pickup_time TEXT,
                comments TEXT,
                date_created TEXT NOT NULL
            )''')
        else:
            db.execute('''CREATE TABLE IF NOT EXISTS shipments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tracking_number TEXT UNIQUE,
                shipper_name TEXT NOT NULL,
                shipper_address TEXT NOT NULL,
                shipper_phone TEXT NOT NULL,
                shipper_email TEXT NOT NULL,
                receiver_name TEXT NOT NULL,
                receiver_address TEXT NOT NULL,
                receiver_phone TEXT NOT NULL,
                receiver_email TEXT NOT NULL,
                origin TEXT NOT NULL,
                destination TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('pending_confirmation', 'processing', 'picked_up', 'in_transit', 'delivered', 'delayed', 'rejected', 'cancelled')),
                packages INTEGER NOT NULL DEFAULT 1,
                total_weight REAL NOT NULL,
                product TEXT,
                quantity INTEGER DEFAULT 1,
                payment_mode TEXT DEFAULT 'Cash',
                total_freight REAL DEFAULT 0,
                expected_delivery TEXT,
                departure_time TEXT,
                pickup_date TEXT,
                pickup_time TEXT,
                comments TEXT,
                date_created TEXT NOT NULL
            )''')

        # Tracking history table
        if USE_POSTGRESQL:
            cursor.execute('''CREATE TABLE IF NOT EXISTS tracking_history (
                id SERIAL PRIMARY KEY,
                shipment_id INTEGER NOT NULL,
                date_time TEXT NOT NULL,
                location TEXT NOT NULL,
                status TEXT NOT NULL,
                description TEXT,
                latitude REAL,
                longitude REAL,
                FOREIGN KEY (shipment_id) REFERENCES shipments (id) ON DELETE CASCADE
            )''')
        else:
            db.execute('''CREATE TABLE IF NOT EXISTS tracking_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shipment_id INTEGER NOT NULL,
                date_time TEXT NOT NULL,
                location TEXT NOT NULL,
                status TEXT NOT NULL,
                description TEXT,
                latitude REAL,
                longitude REAL,
                FOREIGN KEY (shipment_id) REFERENCES shipments (id) ON DELETE CASCADE
            )''')

        # Users table
        if USE_POSTGRESQL:
            cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                branch TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                last_login TEXT,
                created_at TEXT NOT NULL
            )''')
        else:
            db.execute('''CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                branch TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                last_login TEXT,
                created_at TEXT NOT NULL
            )''')

        db.commit()

        # Insert default data
        insert_default_data(db)

def insert_default_data(db):
    # Default locations
    locations = [
        ('Paris', 'paris', 'France'),
        ('Lyon', 'lyon', 'France'),
        ('Marseille', 'marseille', 'France'),
        ('Toulouse', 'toulouse', 'France'),
        ('Nice', 'nice', 'France'),
        ('Nantes', 'nantes', 'France'),
        ('Strasbourg', 'strasbourg', 'France'),
        ('Montpellier', 'montpellier', 'France'),
        ('Bordeaux', 'bordeaux', 'France'),
        ('Lille', 'lille', 'France')
    ]

    for loc in locations:
        try:
            db.execute('INSERT OR IGNORE INTO locations (name, slug, country) VALUES (?, ?, ?)', loc)
        except sqlite3.IntegrityError:
            pass

    # Default zones
    zones = [
        ('France North', 'france-north', 'Paris,Lille,Strasbourg', 'Northern regions of France'),
        ('France South', 'france-south', 'Marseille,Nice,Toulouse,Montpellier', 'Southern regions of France'),
        ('France West', 'france-west', 'Nantes,Bordeaux,Rennes', 'Western regions of France'),
        ('France Central', 'france-central', 'Lyon,Clermont-Ferrand', 'Central regions of France')
    ]

    for zone in zones:
        try:
            db.execute('INSERT OR IGNORE INTO zones (name, slug, locations, description) VALUES (?, ?, ?, ?)', zone)
        except sqlite3.IntegrityError:
            pass

    # Default shipping rates
    shipping_rates = [
        ('Standard Shipping', 'weight', 0, 5, 12.5, 2.0, 'Standard shipping for small packages'),
        ('Express Air', 'weight', 0, 10, 25.0, 5.0, 'Fast air shipping for urgent deliveries'),
        ('Sea Shipping', 'weight', 5, 100, 8.75, 1.5, 'Economic sea shipping for heavy items'),
        ('Door to Door', 'flat', 0, 20, 35.0, 7.5, 'Premium door to door delivery service')
    ]

    for rate in shipping_rates:
        try:
            db.execute('INSERT OR IGNORE INTO shipping_rates (name, type, min_weight, max_weight, rate, insurance, description) VALUES (?, ?, ?, ?, ?, ?, ?)', rate)
        except sqlite3.IntegrityError:
            pass

    # Default pickup rates
    pickup_rates = [
        ('France North', 0, 5, 8.5, 'Standard pickup for small packages in Northern France'),
        ('France South', 0, 5, 9.5, 'Standard pickup for small packages in Southern France'),
        ('France North', 5, 20, 15.75, 'Medium package pickup in Northern France'),
        ('France South', 5, 20, 17.25, 'Medium package pickup in Southern France'),
        ('France West', 0, 10, 12.0, 'Standard pickup in Western France')
    ]

    for rate in pickup_rates:
        try:
            db.execute('INSERT OR IGNORE INTO pickup_rates (zone, min_weight, max_weight, rate, description) VALUES (?, ?, ?, ?, ?)', rate)
        except sqlite3.IntegrityError:
            pass

    # Default users
    users = [
        ('Jean Dupont', 'jean.dupont@colisselect.com', 'password123', 'admin', 'Paris HQ', 'active', '2023-05-18 14:30', '2023-01-01'),
        ('Marie Laurent', 'marie.laurent@colisselect.com', 'password123', 'manager', 'Lyon Branch', 'active', '2023-05-17 09:15', '2023-01-02'),
        ('Pierre Martin', 'pierre.martin@colisselect.com', 'password123', 'agent', 'Marseille Branch', 'active', '2023-05-18 11:45', '2023-01-03'),
        ('Sophie Bernard', 'sophie.bernard@colisselect.com', 'password123', 'agent', 'Paris HQ', 'inactive', '2023-05-10 16:20', '2023-01-04'),
        ('Thomas Petit', 'thomas.petit@colisselect.com', 'password123', 'manager', 'Toulouse Branch', 'active', '2023-05-18 08:05', '2023-01-05')
    ]

    for user in users:
        try:
            db.execute('INSERT OR IGNORE INTO users (name, email, password, role, branch, status, last_login, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', user)
        except sqlite3.IntegrityError:
            pass

    db.commit()

# API Routes

@app.route('/api/locations', methods=['GET', 'POST', 'OPTIONS'])
def handle_locations():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'GET':
        return get_locations()
    elif request.method == 'POST':
        return create_location()

def get_locations():
    db = get_db()
    locations = db.execute('SELECT * FROM locations ORDER BY name').fetchall()
    return jsonify([dict(row) for row in locations])

def create_location():
    data = request.get_json()
    name = data.get('name')
    country = data.get('country')
    slug = data.get('slug') or name.lower().replace(' ', '-')

    if not name or not country:
        return jsonify({'error': 'Name and country are required'}), 400

    db = get_db()
    try:
        cursor = db.execute('INSERT INTO locations (name, slug, country) VALUES (?, ?, ?)', (name, slug, country))
        db.commit()
        return jsonify({'id': cursor.lastrowid, 'name': name, 'slug': slug, 'country': country})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Location with this slug already exists'}), 400

@app.route('/api/locations/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_location(id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'PUT':
        return update_location(id)
    elif request.method == 'DELETE':
        return delete_location(id)

def update_location(id):
    data = request.get_json()
    db = get_db()
    db.execute('UPDATE locations SET name = ?, slug = ?, country = ? WHERE id = ?',
               (data['name'], data['slug'], data['country'], id))
    db.commit()
    return jsonify({'message': 'Location updated'})

def delete_location(id):
    db = get_db()
    db.execute('DELETE FROM locations WHERE id = ?', (id,))
    db.commit()
    return jsonify({'message': 'Location deleted'})

@app.route('/api/zones', methods=['GET', 'POST', 'OPTIONS'])
def handle_zones():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'GET':
        return get_zones()
    elif request.method == 'POST':
        return create_zone()

def get_zones():
    db = get_db()
    zones = db.execute('SELECT * FROM zones ORDER BY name').fetchall()
    return jsonify([dict(row) for row in zones])

def create_zone():
    data = request.get_json()
    name = data.get('name')
    locations = data.get('locations')
    slug = data.get('slug') or name.lower().replace(' ', '-')
    description = data.get('description')

    if not name or not locations:
        return jsonify({'error': 'Name and locations are required'}), 400

    db = get_db()
    try:
        cursor = db.execute('INSERT INTO zones (name, slug, locations, description) VALUES (?, ?, ?, ?)',
                           (name, slug, locations, description))
        db.commit()
        return jsonify({'id': cursor.lastrowid, 'name': name, 'slug': slug, 'locations': locations, 'description': description})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Zone with this slug already exists'}), 400

@app.route('/api/zones/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_zone(id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'PUT':
        return update_zone(id)
    elif request.method == 'DELETE':
        return delete_zone(id)

def update_zone(id):
    data = request.get_json()
    db = get_db()
    db.execute('UPDATE zones SET name = ?, slug = ?, locations = ?, description = ? WHERE id = ?',
               (data['name'], data['slug'], data['locations'], data['description'], id))
    db.commit()
    return jsonify({'message': 'Zone updated'})

def delete_zone(id):
    db = get_db()
    db.execute('DELETE FROM zones WHERE id = ?', (id,))
    db.commit()
    return jsonify({'message': 'Zone deleted'})

@app.route('/api/shipping-rates', methods=['GET', 'POST', 'OPTIONS'])
def handle_shipping_rates():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'GET':
        return get_shipping_rates()
    elif request.method == 'POST':
        return create_shipping_rate()

def get_shipping_rates():
    db = get_db()
    rates = db.execute('SELECT * FROM shipping_rates ORDER BY name').fetchall()
    return jsonify([dict(row) for row in rates])

def create_shipping_rate():
    data = request.get_json()
    name = data.get('name')
    rate = data.get('rate')

    if not name or not rate:
        return jsonify({'error': 'Name and rate are required'}), 400

    db = get_db()
    cursor = db.execute('INSERT INTO shipping_rates (name, type, min_weight, max_weight, rate, insurance, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
                       (name, data.get('type', 'flat'), data.get('min_weight', 0), data.get('max_weight', 0), rate, data.get('insurance', 0), data.get('description')))
    db.commit()
    return jsonify({'id': cursor.lastrowid, 'name': name, 'type': data.get('type', 'flat'), 'min_weight': data.get('min_weight', 0), 'max_weight': data.get('max_weight', 0), 'rate': rate, 'insurance': data.get('insurance', 0), 'description': data.get('description')})

@app.route('/api/shipping-rates/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_shipping_rate(id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'PUT':
        return update_shipping_rate(id)
    elif request.method == 'DELETE':
        return delete_shipping_rate(id)

def update_shipping_rate(id):
    data = request.get_json()
    db = get_db()
    db.execute('UPDATE shipping_rates SET name = ?, type = ?, min_weight = ?, max_weight = ?, rate = ?, insurance = ?, description = ? WHERE id = ?',
               (data['name'], data['type'], data['min_weight'], data['max_weight'], data['rate'], data['insurance'], data['description'], id))
    if USE_POSTGRESQL:
        db.commit()
    else:
        db.commit()
    return jsonify({'message': 'Shipping rate updated'})

def delete_shipping_rate(id):
    db = get_db()
    db.execute('DELETE FROM shipping_rates WHERE id = ?', (id,))
    db.commit()
    return jsonify({'message': 'Shipping rate deleted'})

@app.route('/api/pickup-rates', methods=['GET', 'POST', 'OPTIONS'])
def handle_pickup_rates():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'GET':
        return get_pickup_rates()
    elif request.method == 'POST':
        return create_pickup_rate()

def get_pickup_rates():
    db = get_db()
    rates = db.execute('SELECT * FROM pickup_rates ORDER BY zone').fetchall()
    return jsonify([dict(row) for row in rates])

def create_pickup_rate():
    data = request.get_json()
    zone = data.get('zone')
    rate = data.get('rate')

    if not zone or not rate:
        return jsonify({'error': 'Zone and rate are required'}), 400

    db = get_db()
    cursor = db.execute('INSERT INTO pickup_rates (zone, min_weight, max_weight, rate, description) VALUES (?, ?, ?, ?, ?)',
                       (zone, data.get('min_weight', 0), data.get('max_weight', 0), rate, data.get('description')))
    db.commit()
    return jsonify({'id': cursor.lastrowid, 'zone': zone, 'min_weight': data.get('min_weight', 0), 'max_weight': data.get('max_weight', 0), 'rate': rate, 'description': data.get('description')})

@app.route('/api/pickup-rates/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_pickup_rate(id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'PUT':
        return update_pickup_rate(id)
    elif request.method == 'DELETE':
        return delete_pickup_rate(id)

def update_pickup_rate(id):
    data = request.get_json()
    db = get_db()
    db.execute('UPDATE pickup_rates SET zone = ?, min_weight = ?, max_weight = ?, rate = ?, description = ? WHERE id = ?',
               (data['zone'], data['min_weight'], data['max_weight'], data['rate'], data['description'], id))
    db.commit()
    return jsonify({'message': 'Pickup rate updated'})

def delete_pickup_rate(id):
    db = get_db()
    db.execute('DELETE FROM pickup_rates WHERE id = ?', (id,))
    db.commit()
    return jsonify({'message': 'Pickup rate deleted'})

@app.route('/api/shipments', methods=['GET', 'POST', 'OPTIONS'])
def handle_shipments():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'GET':
        return get_shipments()
    elif request.method == 'POST':
        return create_shipment()

def get_shipments():
    status = request.args.get('status')
    db = get_db()
    if status and status != 'all':
        shipments = db.execute('SELECT * FROM shipments WHERE status = ? ORDER BY date_created DESC', (status,)).fetchall()
    else:
        shipments = db.execute('SELECT * FROM shipments ORDER BY date_created DESC').fetchall()
    return jsonify([dict(row) for row in shipments])

def create_shipment():
    data = request.get_json()

    required_fields = ['shipper_name', 'shipper_email', 'shipper_phone', 'receiver_name', 'origin', 'destination']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'{field} is required'}), 400

    is_admin_request = request.headers.get('X-Admin-Request', 'false').lower() == 'true'

    if is_admin_request:
        status = 'processing'
        import random
        tracking_number = f'SHIP{random.randint(100000000000, 999999999999)}-COLISSELECT'
    else:
        status = 'pending_confirmation'
        tracking_number = None

    db = get_db()
    cursor = db.execute('''INSERT INTO shipments (
        tracking_number, shipper_name, shipper_address, shipper_phone, shipper_email,
        receiver_name, receiver_address, receiver_phone, receiver_email,
        origin, destination, status, packages, total_weight, product, quantity,
        payment_mode, total_freight, expected_delivery, departure_time,
        pickup_date, pickup_time, comments, date_created
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
    (
        tracking_number, data['shipper_name'], data.get('shipper_address', ''), data.get('shipper_phone', ''), data.get('shipper_email', ''),
        data['receiver_name'], data.get('receiver_address', ''), data.get('receiver_phone', ''), data.get('receiver_email', ''),
        data['origin'], data.get('destination', ''), status, data.get('packages', 1), data.get('total_weight', 0), data.get('product', ''),
        data.get('quantity', 1), data.get('payment_mode', 'Cash'), data.get('total_freight', 0), data.get('expected_delivery', ''),
        data.get('departure_time', ''), data.get('pickup_date', ''), data.get('pickup_time', ''), data.get('comments', ''),
        datetime.now().strftime('%Y-%m-%d')
    ))

    shipment_id = cursor.lastrowid
    db.commit()

    if is_admin_request:
        db.execute('INSERT INTO tracking_history (shipment_id, date_time, location, status, description, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
                   (shipment_id, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Admin Office', 'processing', 'Shipment created by admin and ready for processing', 48.8566, 2.3522))
    else:
        db.execute('INSERT INTO tracking_history (shipment_id, date_time, location, status, description, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
                   (shipment_id, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Origin Facility', 'pending_confirmation', 'Package received and awaiting admin confirmation', 48.8566, 2.3522))
    db.commit()

    return jsonify({
        'id': shipment_id,
        'tracking_number': tracking_number,
        'shipper_name': data['shipper_name'],
        'shipper_address': data.get('shipper_address', ''),
        'shipper_phone': data.get('shipper_phone', ''),
        'shipper_email': data.get('shipper_email', ''),
        'receiver_name': data['receiver_name'],
        'receiver_address': data.get('receiver_address', ''),
        'receiver_phone': data.get('receiver_phone', ''),
        'receiver_email': data.get('receiver_email', ''),
        'origin': data['origin'],
        'destination': data.get('destination', ''),
        'status': status,
        'packages': data.get('packages', 1),
        'total_weight': data.get('total_weight', 0),
        'product': data.get('product', ''),
        'quantity': data.get('quantity', 1),
        'payment_mode': data.get('payment_mode', 'Cash'),
        'total_freight': data.get('total_freight', 0),
        'expected_delivery': data.get('expected_delivery', ''),
        'departure_time': data.get('departure_time', ''),
        'pickup_date': data.get('pickup_date', ''),
        'pickup_time': data.get('pickup_time', ''),
        'comments': data.get('comments', ''),
        'date_created': datetime.now().strftime('%Y-%m-%d')
    })

@app.route('/api/shipments/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_shipment(id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'PUT':
        return update_shipment(id)
    elif request.method == 'DELETE':
        return delete_shipment(id)

def update_shipment(id):
    data = request.get_json()
    db = get_db()
    db.execute('''UPDATE shipments SET
        shipper_name = ?, shipper_address = ?, shipper_phone = ?, shipper_email = ?,
        receiver_name = ?, receiver_address = ?, receiver_phone = ?, receiver_email = ?,
        origin = ?, destination = ?, status = ?, packages = ?, total_weight = ?,
        product = ?, quantity = ?, payment_mode = ?, total_freight = ?,
        expected_delivery = ?, departure_time = ?, pickup_date = ?, pickup_time = ?, comments = ?
        WHERE id = ?''',
    (
        data.get('shipper_name', ''), data.get('shipper_address', ''), data.get('shipper_phone', ''), data.get('shipper_email', ''),
        data.get('receiver_name', ''), data.get('receiver_address', ''), data.get('receiver_phone', ''), data.get('receiver_email', ''),
        data.get('origin', ''), data.get('destination', ''), data.get('status', 'processing'), data.get('packages', 1), data.get('total_weight', 0),
        data.get('product', ''), data.get('quantity', 1), data.get('payment_mode', 'Cash'), data.get('total_freight', 0),
        data.get('expected_delivery', ''), data.get('departure_time', ''), data.get('pickup_date', ''), data.get('pickup_time', ''), data.get('comments', ''), id
    ))
    db.commit()
    return jsonify({'message': 'Shipment updated'})

def delete_shipment(id):
    db = get_db()
    db.execute('DELETE FROM shipments WHERE id = ?', (id,))
    db.commit()
    return jsonify({'message': 'Shipment deleted'})

@app.route('/api/users', methods=['GET', 'POST', 'OPTIONS'])
def handle_users():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'GET':
        return get_users()
    elif request.method == 'POST':
        return create_user()

def get_users():
    db = get_db()
    users = db.execute('SELECT * FROM users ORDER BY name').fetchall()
    return jsonify([dict(row) for row in users])

def create_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email and password are required'}), 400

    db = get_db()
    try:
        cursor = db.execute('INSERT INTO users (name, email, password, role, branch, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                           (name, email, password, data.get('role', 'user'), data.get('branch', ''), data.get('status', 'active'), datetime.now().isoformat()))
        db.commit()
        return jsonify({'id': cursor.lastrowid, 'name': name, 'email': email, 'role': data.get('role', 'user'), 'branch': data.get('branch', ''), 'status': data.get('status', 'active'), 'created_at': datetime.now().isoformat()})
    except sqlite3.IntegrityError:
        return jsonify({'error': 'User with this email already exists'}), 400

@app.route('/api/users/<int:id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_user(id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'PUT':
        return update_user(id)
    elif request.method == 'DELETE':
        return delete_user(id)

def update_user(id):
    data = request.get_json()
    db = get_db()
    db.execute('UPDATE users SET name = ?, email = ?, password = ?, role = ?, branch = ?, status = ? WHERE id = ?',
               (data['name'], data['email'], data.get('password', ''), data['role'], data['branch'], data['status'], id))
    db.commit()
    return jsonify({'message': 'User updated'})

def delete_user(id):
    db = get_db()
    db.execute('DELETE FROM users WHERE id = ?', (id,))
    db.commit()
    return jsonify({'message': 'User deleted'})

@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    db = get_db()
    user = db.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password)).fetchone()

    if user:
        db.execute('UPDATE users SET last_login = ? WHERE id = ?', (datetime.now().isoformat(), user['id']))
        db.commit()
        return jsonify({
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role'],
            'branch': user['branch'],
            'status': user['status']
        })
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email and password are required'}), 400

    db = get_db()
    try:
        cursor = db.execute('INSERT INTO users (name, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
                           (name, email, password, 'user', 'active', datetime.now().isoformat()))
        db.commit()
        return jsonify({
            'id': cursor.lastrowid,
            'name': name,
            'email': email,
            'role': 'user',
            'status': 'active'
        })
    except sqlite3.IntegrityError:
        return jsonify({'error': 'User with this email already exists'}), 400

@app.route('/api/track/<tracking_number>', methods=['GET', 'OPTIONS'])
def track_shipment(tracking_number):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    
    db = get_db()
    shipment = db.execute('SELECT * FROM shipments WHERE tracking_number = ?', (tracking_number,)).fetchone()
    if not shipment:
        return jsonify({'error': 'Shipment not found'}), 404

    history = db.execute('SELECT date_time, location, status, description, latitude, longitude FROM tracking_history WHERE shipment_id = ? ORDER BY date_time DESC', (shipment['id'],)).fetchall()

    return jsonify({
        'shipment': dict(shipment),
        'history': [dict(row) for row in history]
    })

@app.route('/api/tracking-history/<int:shipment_id>', methods=['GET', 'POST', 'OPTIONS'])
def handle_tracking_history(shipment_id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'GET':
        return get_tracking_history(shipment_id)
    elif request.method == 'POST':
        return add_tracking_history(shipment_id)

def get_tracking_history(shipment_id):
    db = get_db()
    history = db.execute('SELECT * FROM tracking_history WHERE shipment_id = ? ORDER BY date_time DESC', (shipment_id,)).fetchall()
    return jsonify([dict(row) for row in history])

def add_tracking_history(shipment_id):
    data = request.get_json()
    date_time = data.get('date_time', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    location = data.get('location', '')
    status = data.get('status', 'processing')
    description = data.get('description', '')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not location or not status:
        return jsonify({'error': 'Location and status are required'}), 400

    db = get_db()
    cursor = db.execute('INSERT INTO tracking_history (shipment_id, date_time, location, status, description, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        (shipment_id, date_time, location, status, description, latitude, longitude))
    db.commit()

    if status in ['pending_confirmation', 'processing', 'picked_up', 'in_transit', 'delivered', 'delayed', 'rejected']:
        db.execute('UPDATE shipments SET status = ? WHERE id = ?', (status, shipment_id))
        db.commit()

    return jsonify({'id': cursor.lastrowid, 'shipment_id': shipment_id, 'date_time': date_time, 'location': location, 'status': status, 'description': description, 'latitude': latitude, 'longitude': longitude})

@app.route('/api/tracking-history/<int:history_id>', methods=['PUT', 'DELETE', 'OPTIONS'])
def handle_tracking_history_item(history_id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    elif request.method == 'PUT':
        return update_tracking_history(history_id)
    elif request.method == 'DELETE':
        return delete_tracking_history(history_id)

def update_tracking_history(history_id):
    data = request.get_json()
    db = get_db()
    db.execute('UPDATE tracking_history SET date_time = ?, location = ?, status = ?, description = ?, latitude = ?, longitude = ? WHERE id = ?',
               (data['date_time'], data['location'], data['status'], data['description'], data.get('latitude'), data.get('longitude'), history_id))
    db.commit()

    if 'status' in data and data['status'] in ['pending_confirmation', 'processing', 'picked_up', 'in_transit', 'delivered', 'delayed', 'rejected']:
        shipment_id = db.execute('SELECT shipment_id FROM tracking_history WHERE id = ?', (history_id,)).fetchone()['shipment_id']
        db.execute('UPDATE shipments SET status = ? WHERE id = ?', (data['status'], shipment_id))
        db.commit()

    return jsonify({'message': 'Tracking history updated'})

def delete_tracking_history(history_id):
    db = get_db()
    db.execute('DELETE FROM tracking_history WHERE id = ?', (history_id,))
    db.commit()
    return jsonify({'message': 'Tracking history deleted'})

@app.route('/api/shipments/<int:id>/confirm', methods=['POST', 'OPTIONS'])
def confirm_shipment(id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    
    data = request.get_json()
    db = get_db()

    import random
    tracking_number = f'SHIP{random.randint(100000000000, 999999999999)}-COLISSELECT'

    db.execute('''UPDATE shipments SET
        tracking_number = ?,
        status = 'processing',
        total_freight = ?,
        expected_delivery = ?,
        comments = ?
        WHERE id = ?''',
        (tracking_number, data.get('total_freight', 0), data.get('expected_delivery', ''), data.get('comments', ''), id))
    db.commit()

    db.execute('INSERT INTO tracking_history (shipment_id, date_time, location, status, description, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
               (id, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Admin Office', 'processing', 'Shipment confirmed and being processed', 48.8566, 2.3522))
    db.commit()

    print(f"EMAIL NOTIFICATION: Shipment {id} confirmed with tracking number {tracking_number}. Email to shipper.")

    return jsonify({'message': 'Shipment confirmed', 'tracking_number': tracking_number})

@app.route('/api/shipments/<int:id>/reject', methods=['POST', 'OPTIONS'])
def reject_shipment(id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    
    data = request.get_json()
    reason = data.get('reason', 'No reason provided')
    db = get_db()

    db.execute('UPDATE shipments SET status = ?, comments = ? WHERE id = ?',
               ('rejected', f'Rejected: {reason}', id))
    db.commit()

    db.execute('INSERT INTO tracking_history (shipment_id, date_time, location, status, description, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
               (id, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'Admin Office', 'rejected', f'Shipment rejected: {reason}', 48.8566, 2.3522))
    db.commit()

    print(f"EMAIL NOTIFICATION: Shipment {id} rejected. Reason: {reason}. Email to shipper.")

    return jsonify({'message': 'Shipment rejected'})

@app.route('/api/hello', methods=['GET', 'OPTIONS'])
def hello():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'success'}), 200
    return {"message": "Hello from Flask!"}

# Routes explicites pour forcer le routage SPA - méthode archaïque mais efficace
@app.route('/quote')
def serve_quote():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/contact')
def serve_contact():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/tracking')
def serve_tracking():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/services/shipping')
def serve_services_shipping():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/services/air')
def serve_services_air():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/services/delivery')
def serve_services_delivery():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/services/special')
def serve_services_special():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/admin')
def serve_admin():
    return send_from_directory(app.static_folder, "index.html")

@app.route('/admin/<path:subpath>')
def serve_admin_subpath(subpath):
    return send_from_directory(app.static_folder, "index.html")

# Route pour servir le frontend buildé - Gestion SPA améliorée
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    # Liste des routes API connues
    api_routes = [
        'api/', 'auth/', 'login', 'register', 'track/',
        'shipments', 'users', 'locations', 'zones',
        'shipping-rates', 'pickup-rates', 'tracking-history'
    ]

    # Si la route commence par un chemin API connu, retourner 404
    if any(path.startswith(route) for route in api_routes):
        return jsonify({"error": "API route not found"}), 404

    # Vérifier si le fichier existe dans le dossier static
    static_file_path = os.path.join(app.static_folder, path) if path else app.static_folder

    # Si le chemin existe et c'est un fichier, le servir
    if path and os.path.exists(static_file_path) and os.path.isfile(static_file_path):
        return send_from_directory(app.static_folder, path)

    # Si c'est un dossier qui existe, vérifier s'il contient index.html
    if path and os.path.exists(static_file_path) and os.path.isdir(static_file_path):
        index_path = os.path.join(static_file_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_file_path, 'index.html')

    # Pour toutes les autres routes, servir index.html (SPA)
    return send_from_directory(app.static_folder, "index.html")

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)