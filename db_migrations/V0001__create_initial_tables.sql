-- Создание таблицы блюд
CREATE TABLE IF NOT EXISTS dishes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    ingredients TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(255),
    delivery_address TEXT NOT NULL,
    total_price INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    order_type VARCHAR(50) DEFAULT 'delivery',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы позиций заказа
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    dish_id INTEGER NOT NULL REFERENCES dishes(id),
    dish_title VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    price INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных блюд
INSERT INTO dishes (title, ingredients, price, image, category) VALUES
('Пицца Маргарита', 'Томаты, моцарелла, базилик, оливковое масло', 590, 'https://cdn.poehali.dev/projects/ceed00ea-1776-4472-a012-303df54691e3/files/096a6145-26b4-4f69-beb1-23f5cdffb122.jpg', 'Пицца'),
('Суши Филадельфия', 'Лосось, сливочный сыр, авокадо, рис', 450, 'https://cdn.poehali.dev/projects/ceed00ea-1776-4472-a012-303df54691e3/files/d221d873-5fcf-4132-bbe5-c0fca62178ff.jpg', 'Суши'),
('Бургер Классик', 'Говядина, салат, томаты, сыр чеддер, соус', 390, 'https://cdn.poehali.dev/projects/ceed00ea-1776-4472-a012-303df54691e3/files/a9e72466-193c-449f-abf8-c940e1d05efe.jpg', 'Бургеры'),
('Паста Карбонара', 'Спагетти, бекон, сливки, пармезан, яйцо', 420, '/placeholder.svg', 'Паста'),
('Салат Цезарь', 'Курица, салат айсберг, пармезан, гренки, соус', 340, '/placeholder.svg', 'Салаты'),
('Том Ям', 'Креветки, грибы, лимонник, перец чили', 480, '/placeholder.svg', 'Супы');