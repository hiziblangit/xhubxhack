from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
import random
import os
from dotenv import load_dotenv
from utils.api_key_rotator import key_rotator

load_dotenv()

app = FastAPI(title="Xhubxhack AI Professor")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def root():
    return {"status": "running", "message": "Xhubxhack Institutional AI Ready"}

@app.post("/api/analyze")
async def analyze_signal(data: dict):
    # MOCK AI: Simulasi SMC + XGBoost
    rsi = data.get("rsi", 50)
    atr = data.get("atr", 20)
    
    # Simulasi FVG & Sweep
    prob = 0.75 + (random.random() * 0.20)
    action = "BUY" if prob > 0.75 else "SELL" if prob < 0.5 else "WAIT"
    
    return {
        "action": action,
        "probability": round(prob, 2),
        "confidence": "HIGH" if prob > 0.8 else "MEDIUM",
        "pattern": "Bullish FVG",
        "sentiment": "Bullish",
        "sentiment_score": 72
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            print(f"Data MT5: {data}")
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host=host, port=port)
