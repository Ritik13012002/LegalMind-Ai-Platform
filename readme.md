<div align="center">
  <h1>⚖️ LegalMind AI Platform</h1>
  <p>An Enterprise-grade, Full-Stack AI Legal Document Analyzer powered by LangChain, Groq (Llama-3), and Pinecone Vector Database.</p>
</div>

## 🌟 Overview
LegalMind automates legal document ingestion, intelligent hybrid search, and actionable risk assessment for legal professionals. It replaces tedious manual contract reading with a lightning-fast, highly accurate AI assistant.

## 🚀 Key Features
- **Intelligent RAG Pipeline**: Upload PDFs and chat with your documents in real-time.
- **Automated Risk Analysis**: Auto-flags high, medium, and low-risk contractual clauses directly from the text.
- **Smart Summarization**: Generates 1-paragraph non-legal jargon summaries instantly.
- **Premium Dark-Theme Dashboard**: Built with React and CSS for an executive, modern feel.

## 🏗️ System Architecture
The application runs on a modern **Microservices** architecture:

1. **Frontend (`/froentend`)**
   - React (Vite) + Vanilla CSS + Lucide Icons
   - Handles UI/UX, PDF previews, and dynamic dashboards.

2. **API Gateway (`/api-gateway`)**
   - Node.js + Express + MongoDB
   - Acts as the single source of truth for JWT Authentication, File Uploads (Multer), and proxying heavy AI requests.

3. **AI Engine (`/ai-engine`)**
   - Python + FastAPI + LangChain + Groq LLM + Pinecone
   - Handles text chunking, embedding generation, vector similarity search, and structured JSON generation.


## ⚙️ How to Run Locally

### 1. Start AI Engine (Port 8000)
```bash
cd ai-engine
python -m venv .venv
# Activate venv (.venv\Scripts\activate)
pip install -r requirements.txt
python -m uvicorn main:app --reload
```
### 2. Start API Gateway(Port 5000)
```bash 
cd api-gateway
npm install
npm run dev
```
### 3. Start Frontend(Port 5173/5174)
```bash
cd froentend
npm install
npm run dev