from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import os

app = FastAPI()

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration for the Analytics Service URL
ANALYTICS_SERVICE_URL = os.getenv("ANALYTICS_SERVICE_URL", "http://analytics-service:8080")

class Event(BaseModel):
    user_id: str
    event_type: str
    payload: dict = {}

@app.get("/")
def read_root():
    return {"status": "Data Ingestion Service is active"}

@app.post("/ingest")
async def ingest_event(event: Event):
    print(f"Received event: {event}")
    
    # Forward to Analytics Service
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(f"{ANALYTICS_SERVICE_URL}/events", json=event.dict())
            return {"message": "Event ingested and forwarded", "analytics_response": response.status_code}
        except Exception as e:
            print(f"Failed to forward to analytics: {e}")
            return {"message": "Event ingested locally, failed to forward", "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
