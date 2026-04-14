from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_service import process_and_ingest_pdf

# 🔥 YEH NAYA IMPORT HAI: Apna LangGraph ka dimaag yahan bulao
from app.core.graph import app as langgraph_app 

router = APIRouter()

# --- 1. INGESTION ENDPOINT (Yeh tum pehle hi bana chuke ho) ---
class IngestRequest(BaseModel):
    file_url: str
    document_id: str

@router.post("/api/ingest")
async def ingest_endpoint(request: IngestRequest):
    try:
        chunks_saved = process_and_ingest_pdf(request.file_url, request.document_id)
        return {"status": "success", "message": f"{chunks_saved} chunks pushed to Pinecone."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- 2. THE REAL QUERY ENDPOINT (Yeh Chandan/Hariom use karenge) ---
class QueryRequest(BaseModel):
    user_query: str
    document_id: str

@router.post("/api/query")
async def ask_question(request: QueryRequest):
    try:
        print(f"--> API received query: '{request.user_query}' for doc: '{request.document_id}'")
        
        # Terminal ki jagah ab hum LangGraph ko yahan se call kar rahe hain!
        result = langgraph_app.invoke({
            "user_query": request.user_query,
            "document_id": request.document_id
        })
        
        # Chandan aur Hariom ko ek khoobsurat JSON response wapas bhejenge
        return {
            "status": "success",
            "document_id": request.document_id,
            "question": request.user_query,
            "answer": result["final_answer"] # LangGraph ka original answer
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))