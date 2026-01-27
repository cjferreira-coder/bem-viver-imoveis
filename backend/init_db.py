import sqlite3
import json

# URL do Placeholder Cinza (Gera uma imagem cinza automaticamente)
# Formato: https://via.placeholder.com/LARGURAxALTURA/COR_FUNDO/COR_TEXTO?text=TEXTO
def get_gray_image(text="Foto do Imóvel"):
    return f"https://via.placeholder.com/1200x800/cccccc/666666?text={text}"

def get_gray_plan(text="Planta Baixa"):
    return f"https://via.placeholder.com/800x600/e0e0e0/333333?text={text}"

# DADOS INICIAIS (SEED) - Agora com Imagens Cinzas (Placeholders)
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
      get_gray_image("Sala de Estar"),
      get_gray_image("Vista Mar"),
      get_gray_image("Cozinha"),
      get_gray_image("Suíte Principal"),
      get_gray_image("Varanda Gourmet")
    ],
    "plans": [
        get_gray_plan("Planta Humanizada"),
        get_gray_plan("Planta Técnica")
    ],
    "badge": "Exclusivo",
    "features": ["Varanda gourmet", "Academia", "Piscina", "Portaria 24h", "Vista Mar", "Salão de Festas"],
    "description": "Desfrute do melhor de Ponta Negra neste apartamento espetacular. Com vista eterna para o mar.",
    "bus_lines": ["L-46", "L-54", "O-83", "N-73"]
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
      get_gray_image("Fachada da Casa"),
      get_gray_image("Sala de Jantar"),
      get_gray_image("Cozinha Ampla"),
      get_gray_image("Quintal"),
      get_gray_image("Quarto 1")
    ],
    "plans": [
        get_gray_plan("Distribuição Térrea")
    ],
    "badge": "Novo",
    "features": ["Quintal amplo", "Escritório", "Suíte", "Rua tranquila", "Cerca Elétrica", "Jardim"],
    "description": "Casa térrea totalmente reformada no coração do Tirol.",
    "bus_lines": ["L-37", "O-33", "O-40"]
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
      get_gray_image("Fachada Moderna"),
      get_gray_image("Área de Lazer"),
      get_gray_image("Sala Pé Direito Duplo"),
      get_gray_image("Suíte Master"),
      get_gray_image("Closet")
    ],
    "plans": [
       get_gray_plan("Planta Térreo"),
       get_gray_plan("Planta Superior")
    ],
    "badge": "Premium", 
    "features": ["Energia Solar", "Piscina Privativa", "Churrasqueira", "Pé direito duplo", "Closet"], 
    "description": "Alto padrão em localização privilegiada.",
    "bus_lines": ["L-52", "L-51", "O-83"]
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
      get_gray_image("Sala Integrada"),
      get_gray_image("Quarto Casal"),
      get_gray_image("Banheiro Social"),
      get_gray_image("Cozinha Americana"),
      get_gray_image("Área de Serviço")
    ],
    "plans": [
        get_gray_plan("Planta Baixa")
    ],
    "badge": "Oportunidade", 
    "features": ["Elevador", "Playground", "Salão de Festas", "Portaria Virtual"], 
    "description": "Ideal para investimento.",
    "bus_lines": ["O-33", "N-35", "L-50", "O-24"]
  }
]

connection = sqlite3.connect('imoveis.db')
cursor = connection.cursor()

cursor.execute('DROP TABLE IF EXISTS imoveis')

# Recria a tabela com todos os campos necessários
cursor.execute('''
    CREATE TABLE imoveis (
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
        images TEXT,   
        features TEXT,
        bus_lines TEXT,
        plans TEXT
    )
''')

print("Reiniciando banco com imagens CINZAS (Placeholders)...")
for p in PROPERTIES:
    images_str = json.dumps(p['images'])
    features_str = json.dumps(p['features'])
    bus_str = json.dumps(p.get('bus_lines', []))
    plans_str = json.dumps(p.get('plans', []))
    
    cursor.execute('''
        INSERT INTO imoveis VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ''', (
        p['id'], p['title'], p['type'], p['price'], p['location'], p['address'],
        p['bedrooms'], p['bathrooms'], p['area'], p['parking'], p['badge'], 
        p['description'], images_str, features_str, bus_str, plans_str
    ))

connection.commit()
connection.close()
print("✅ Banco atualizado com imagens cinzas! Execute: python -m uvicorn main:app --reload")