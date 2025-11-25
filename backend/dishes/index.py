'''
Business: API для управления блюдами - получение списка, добавление, обновление, удаление
Args: event с httpMethod, body, pathParams; context с request_id
Returns: HTTP response с данными блюд или статусом операции
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
            cur.execute('SELECT * FROM dishes WHERE is_available = true ORDER BY created_at DESC')
            dishes = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps([dict(dish) for dish in dishes], default=serialize_datetime),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            title = body.get('title')
            ingredients = body.get('ingredients')
            price = body.get('price')
            image = body.get('image', '/placeholder.svg')
            category = body.get('category')
            
            cur.execute(
                'INSERT INTO dishes (title, ingredients, price, image, category) VALUES (%s, %s, %s, %s, %s) RETURNING *',
                (title, ingredients, price, image, category)
            )
            conn.commit()
            new_dish = cur.fetchone()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(new_dish), default=serialize_datetime),
                'isBase64Encoded': False
            }
        
        elif method == 'PUT':
            path_params = event.get('pathParams', {})
            dish_id = path_params.get('id')
            body = json.loads(event.get('body', '{}'))
            
            title = body.get('title')
            ingredients = body.get('ingredients')
            price = body.get('price')
            image = body.get('image')
            category = body.get('category')
            
            cur.execute(
                'UPDATE dishes SET title = %s, ingredients = %s, price = %s, image = %s, category = %s WHERE id = %s RETURNING *',
                (title, ingredients, price, image, category, dish_id)
            )
            conn.commit()
            updated_dish = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(updated_dish) if updated_dish else {}, default=serialize_datetime),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            path_params = event.get('pathParams', {})
            dish_id = path_params.get('id')
            
            cur.execute('UPDATE dishes SET is_available = false WHERE id = %s', (dish_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
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