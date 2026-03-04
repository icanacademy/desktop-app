import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate

# Initialize FastAPI app
app = FastAPI(title="Poetry Generator")

# CORS middleware (useful if frontend is ever detached)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Ollama LLM
# Utilizing the local Ollama instance specified in user instructions
llm = Ollama(
    base_url="http://192.168.68.153:11434",
    model="llama3.1:8b"
)

# Define request model
class PoetryRequest(BaseModel):
    theme: str
    grade_level: str

# Define Prompt Template
template = """
You are a creative poet who writes beautiful and engaging poetry tailored for students.
Create a poem about the theme "{theme}" suitable for reading level: {grade_level}.
The poem should be formatted nicely with stanzas, and its tone should match the grade level.
Do not include any external commentary, just the poem itself.
"""
prompt = PromptTemplate(template=template, input_variables=["theme", "grade_level"])

@app.post("/api/generate")
async def generate_poetry(request: PoetryRequest):
    try:
        # Generate the formatted prompt
        formatted_prompt = prompt.format(theme=request.theme, grade_level=request.grade_level)
        
        # Call Ollama
        response = llm.invoke(formatted_prompt)
        
        return {"poetry": response.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Mount static directory and set index.html as root
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
    return FileResponse("static/index.html")
