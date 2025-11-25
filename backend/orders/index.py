'''
Business: API для управления заказами - создание, получение списка всех заказов, обновление статуса
Args: event с httpMethod, body, pathParams; context с request_id
Returns: HTTP response с данными заказов или статусом операции
'''

import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
from datetime import datetime

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def serialize_datetime(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f'Object of type {obj.__class__.__name__} is not JSON serializable')

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Role',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            cur.execute('''
                SELECT o.*, 
                    json_agg(json_build_object(
                        'id', oi.id,
                        'dish_title', oi.dish_title,
                        'quantity', oi.quantity,
                        'price', oi.price
                    )) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                GROUP BY o.id
                ORDER BY o.created_at DESC
            ''')
            orders = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(order) for order in orders], default=serialize_datetime),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            customer_name = body.get('customer_name')
            customer_phone = body.get('customer_phone')
            customer_email = body.get('customer_email', '')
            delivery_address = body.get('delivery_address')
            total_price = body.get('total_price')
            order_type = body.get('order_type', 'delivery')
            items = body.get('items', [])
            
            cur.execute(
                '''INSERT INTO orders (customer_name, customer_phone, customer_email, delivery_address, total_price, order_type) 
                   VALUES (%s, %s, %s, %s, %s, %s) RETURNING *''',
                (customer_name, customer_phone, customer_email, delivery_address, total_price, order_type)
            )
            new_order = cur.fetchone()
            order_id = new_order['id']
            
            for item in items:
                cur.execute(
                    '''INSERT INTO order_items (order_id, dish_id, dish_title, quantity, price) 
                       VALUES (%s, %s, %s, %s, %s)''',
                    (order_id, item['dish_id'], item['dish_title'], item['quantity'], item['price'])
                )
            
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(new_order), default=serialize_datetime),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParams', {})
            order_id = path_params.get('id')
            body = json.loads(event.get('body', '{}'))
            status = body.get('status')
            
            cur.execute(
                'UPDATE orders SET status = %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING *',
                (status, order_id)
            )
            conn.commit()
            updated_order = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(updated_order) if updated_order else {}, default=serialize_datetime),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()