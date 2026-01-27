import sqlite3
import json

# Dados iniciais (Seed)
PROPERTIES = [
  {
    "id": "bv-001",
    "title": "Apartamento vista mar em Ponta Negra",
    "type": "apartamento",
    "price": 680000,
    "location": "Ponta Negra, Natal/RN",
    "address": "Av. Eng. Roberto Freire, 9000 - Ponta Negra",
    "bedrooms": 3, "bathrooms": 2, "area": 95, "parking": 2,
    "images": [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
      "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?w=1200",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200"
    ],
    "badge": "Exclusivo",
    "features": ["Varanda gourmet", "Academia", "Piscina", "Portaria 24h", "Vista Mar", "Salão de Festas"],
    "description": "Desfrute do melhor de Ponta Negra neste apartamento espetacular. Com vista eterna para o mar."
  },
  {
    "id": "bv-002",
    "title": "Casa térrea com quintal no Tirol",
    "type": "casa",
    "price": 530000,
    "location": "Tirol, Natal/RN",
    "address": "Rua Ângelo Varela, 450 - Tirol",
    "bedrooms": 3, "bathrooms": 3, "area": 140, "parking": 2,
    "images": [
      "https://images.unsplash.com/photo-1600607687920-4ce0a1c1d4b6?w=1200",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200"
    ],
    "badge": "Novo",
    "features": ["Quintal amplo", "Escritório", "Suíte", "Rua tranquila", "Cerca Elétrica", "Jardim"],
    "description": "Casa térrea totalmente reformada no coração do Tirol."
  },
  {
    "id": "bv-003",
    "title": "Sobrado contemporâneo Capim Macio",
    "type": "sobrado",
    "price": 850000,
    "location": "Capim Macio, Natal/RN",
    "address": "Rua das Amapoulas, 120 - Capim Macio",
    "bedrooms": 4, "bathrooms": 4, "area": 210, "parking": 3,
    "images": [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200"
    ],
    "badge": "Premium", 
    "features": ["Energia Solar", "Piscina Privativa", "Churrasqueira", "Pé direito duplo", "Closet"], 
    "description": "Alto padrão em localização privilegiada."
  },
  {
    "id": "bv-004",
    "title": "Compacto em Lagoa Nova",
    "type": "apartamento",
    "price": 310000,
    "location": "Lagoa Nova, Natal/RN",
    "address": "Av. Prudente de Morais, 3000 - Lagoa Nova",
    "bedrooms": 2, "bathrooms": 1, "area": 60, "parking": 1,
    "images": [
      "https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?w=1200"
    ],
    "badge": "Oportunidade", 
    "features": ["Elevador", "Playground", "Salão de Festas", "Portaria Virtual"], 
    "description": "Ideal para investimento."
  }
]

connection = sqlite3.connect('imoveis.db')
cursor = connection.cursor()

# 1. Cria a Tabela
cursor.execute('''
    CREATE TABLE IF NOT EXISTS imoveis (
        id TEXT PRIMARY KEY,
        title TEXT,
        type TEXT,
        price REAL,
        location TEXT,
        address TEXT,
        bedrooms INTEGER,
        bathrooms INTEGER,
        area REAL,
        parking INTEGER,
        badge TEXT,
        description TEXT,
        images TEXT,   -- Vamos salvar as listas como texto JSON
        features TEXT  -- Vamos salvar as listas como texto JSON
    )
''')

# 2. Insere os dados
for p in PROPERTIES:
    # Pequeno truque: convertemos listas (images, features) para texto (JSON string) antes de salvar
    images_str = json.dumps(p['images'])
    features_str = json.dumps(p['features'])
    
    cursor.execute('''
        INSERT OR REPLACE INTO imoveis VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', (
        p['id'], p['title'], p['type'], p['price'], p['location'], p['address'],
        p['bedrooms'], p['bathrooms'], p['area'], p['parking'], p['badge'], 
        p['description'], images_str, features_str
    ))

connection.commit()
connection.close()

print("Banco de dados 'imoveis.db' criado com sucesso!")