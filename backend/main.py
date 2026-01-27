import sqlite3
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Função Auxiliar para Conectar no Banco ---
def get_db_connection():
    conn = sqlite3.connect('imoveis.db')
    # Isso faz o SQLite devolver as colunas pelo nome (tipo dicionário), não só números
    conn.row_factory = sqlite3.Row 
    return conn

# --- Função Auxiliar para Formatar o Imóvel ---
def dict_from_row(row):
    """
    O banco devolve texto nas colunas 'images' e 'features'.
    Precisamos converter de volta para listas do Python.
    """
    item = dict(row)
    item['images'] = json.loads(item['images'])     # Converte texto '[...]' para lista real
    item['features'] = json.loads(item['features']) # Converte texto '[...]' para lista real
    return item

@app.get("/")
def read_root():
    return {"status": "API Conectada ao SQLite 🗄️"}

@app.get("/api/properties")
def get_properties():
    conn = get_db_connection()
    # QUERY SQL: Selecione tudo da tabela imoveis
    properties_rows = conn.execute('SELECT * FROM imoveis').fetchall()
    conn.close()
    
    # Converte cada linha do banco para o formato bonitinho que o site espera
    results = [dict_from_row(row) for row in properties_rows]
    return results

@app.get("/api/properties/{property_id}")
def get_property(property_id: str):
    conn = get_db_connection()
    # QUERY SQL: Selecione onde o ID for igual ao que o usuário pediu
    row = conn.execute('SELECT * FROM imoveis WHERE id = ?', (property_id,)).fetchone()
    conn.close()
    
    if row is None:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")
        
    return dict_from_row(row)