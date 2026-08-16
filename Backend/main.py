from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Xhubxhack AI")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/")
def root(): return {"status": "running", "message": "Xhubxhack AI Ready"}

@app.get("/api/performance")
def performance(): return {"win_rate": 73.2, "profit_factor": 2.1}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
