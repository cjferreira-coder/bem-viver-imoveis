import sqlite3
import json

# Dados do novo imóvel (pode alterar o preço ou título se quiser!)
novo_imovel = {
    "id": "bv-999",  # ID único
    "title": "Cobertura Duplex no Alto de Candelária",
    "type": "apartamento",
    "price": 1250000,
    "location": "Candelária, Natal/RN",
    "address": "Av. da Integração, 500 - Candelária",
    "bedrooms": 5,
    "bathrooms": 5,
    "area": 320,
    "parking": 4,
    "badge": "Super Luxo",
    "description": "Cobertura incrível com vista 360º da cidade. Acabamento em mármore, piscina privativa no terraço e automação residencial completa.",
    "images": [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200", # Foto bonita de piscina
        "https://images.unsplash.com/photo-1600596542815-3ad19fb812a7?w=1200"
    ],
    "features": ["Piscina Privativa", "Cinema", "Automação", "Vista 360", "Elevador Privativo"]
}

# Conectar no banco
connection = sqlite3.connect('imoveis.db')
cursor = connection.cursor()

# Preparar listas para salvar como texto (JSON)
images_str = json.dumps(novo_imovel['images'])
features_str = json.dumps(novo_imovel['features'])

print(f"Inserindo imóvel: {novo_imovel['title']}...")

# Comando SQL Puro (INSERT)
cursor.execute('''
    INSERT INTO imoveis VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
''', (
    novo_imovel['id'], 
    novo_imovel['title'], 
    novo_imovel['type'], 
    novo_imovel['price'], 
    novo_imovel['location'], 
    novo_imovel['address'],
    novo_imovel['bedrooms'], 
    novo_imovel['bathrooms'], 
    novo_imovel['area'], 
    novo_imovel['parking'], 
    novo_imovel['badge'], 
    novo_imovel['description'], 
    images_str, 
    features_str
))

connection.commit() # Salvar alterações
connection.close()

print("✅ Sucesso! Imóvel gravado no banco de dados.")