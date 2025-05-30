from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Simulated database
class Message(BaseModel):
    id: str
    content: str
    sender: str
    timestamp: str

class File(BaseModel):
    id: str
    name: str
    content: str
    type: str

messages = []
files = []

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/api/messages", response_model=List[Message])
async def get_messages():
    return messages

@app.post("/api/messages", status_code=201)
async def create_message(content: str, sender: str):
    message_id = str(uuid.uuid4())
    timestamp = "2025-02-15T12:00:00Z"  # Simulated timestamp
    new_message = Message(id=message_id, content=content, sender=sender, timestamp=timestamp)
    messages.append(new_message)
    return new_message

@app.get("/api/files", response_model=List[File])
async def get_files():
    return files

@app.post("/api/files", status_code=201)
async def create_file(name: str, content: str, type: str):
    file_id = str(uuid.uuid4())
    new_file = File(id=file_id, name=name, content=content, type=type)
    files.append(new_file)
    return new_file

@app.get("/api/files/{file_id}", response_model=File)
async def get_file(file_id: str):
    for file in files:
        if file.id == file_id:
            return file
    raise HTTPException(status_code=404, detail="File not found")