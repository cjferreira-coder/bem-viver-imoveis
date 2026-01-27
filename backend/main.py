import sqlite3
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # Importante!

app = FastAPI()

# --- CONFIGURAÇÃO DO CORS (A CORREÇÃO ESTÁ AQUI) ---
# Isso libera o acesso para o seu Front-end conversar com o Back-end
origins = [
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501",
    "http://127.0.0.1:5502", # Porta do seu Live Server
    "http://localhost:5500",
    "http://localhost:5501",
    "http://localhost:5502",
    "*" # Libera geral (útil para desenvolvimento)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, etc.
    allow_headers=["*"],
)
# ---------------------------------------------------

def get_db_connection():
    conn = sqlite3.connect('imoveis.db')
    conn.row_factory = sqlite3.Row 
    return conn

def dict_from_row(row):
    item = dict(row)
    # Converte string JSON para lista Python
    item['images'] = json.loads(item['images'])
    item['features'] = json.loads(item['features'])
    
    # Tratamento seguro para bus_lines
    if 'bus_lines' in item and item['bus_lines']:
        item['bus_lines'] = json.loads(item['bus_lines'])
    else:
        item['bus_lines'] = []

    # Tratamento seguro para plans (plantas)
    if 'plans' in item and item['plans']:
        item['plans'] = json.loads(item['plans'])
    else:
        item['plans'] = []
        
    return item

@app.get("/")
def read_root():
    return {"status": "API Bem Viver Online 🚀"}

@app.get("/api/properties")
def get_properties():
    try:
        conn = get_db_connection()
        properties_rows = conn.execute('SELECT * FROM imoveis').fetchall()
        conn.close()
        results = [dict_from_row(row) for row in properties_rows]
        return results
    except Exception as e:
        print(f"Erro no backend: {e}")
        return []

@app.get("/api/properties/{property_id}")
def get_property(property_id: str):
    conn = get_db_connection()
    row = conn.execute('SELECT * FROM imoveis WHERE id = ?', (property_id,)).fetchone()
    conn.close()
    
    if row is None:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")
        
    return dict_from_row(row)