# AI-Tutor Feature - Technical Implementation Guide

## Quick Start: FastAPI Backend Setup

### 1. Project Initialization

```bash
# Create project directory
mkdir ai-tutor-backend
cd ai-tutor-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn[standard] pydantic pydantic-settings httpx python-jose[cryptography] openai python-dotenv
```

### 2. Project Structure

```
ai-tutor-backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── requests.py
│   │   ├── responses.py
│   │   └── user_data.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llm_service.py
│   │   ├── embedding_service.py
│   │   ├── analysis_service.py
│   │   ├── recommendation_service.py
│   │   └── database_service.py
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py
│   │   ├── analysis.py
│   │   ├── goals.py
│   │   ├── roadmap_assistant.py
│   │   └── note_assistant.py
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth.py
│   │
│   └── utils/
│       ├── __init__.py
│       └── text_processing.py
│
├── .env.example
├── requirements.txt
├── Dockerfile
└── README.md
```

---

## Core Implementation Files

### 1. Configuration (`app/config.py`)

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # API Configuration
    api_title: str = "AI Tutor API"
    api_version: str = "1.0.0"
    api_prefix: str = "/api/ai"
    
    # LLM Configuration
    openai_api_key: Optional[str] = None
    anthropic_api_key: Optional[str] = None
    llm_provider: str = "openai"  # "openai" or "anthropic"
    llm_model: str = "gpt-4-turbo-preview"  # or "claude-3-opus-20240229"
    embedding_model: str = "text-embedding-3-small"
    
    # NestJS Backend
    nestjs_api_url: str = "http://localhost:3000"
    nestjs_graphql_url: str = "http://localhost:3000/graphql"
    
    # Auth0 Configuration
    auth0_domain: str
    auth0_audience: str
    auth0_issuer: str
    
    # Cache Configuration
    cache_ttl_seconds: int = 300  # 5 minutes
    enable_redis: bool = False
    redis_url: Optional[str] = None
    
    # Feature Flags
    enable_daily_goals: bool = True
    enable_roadmap_assistant: bool = True
    enable_note_assistant: bool = True
    
    # Rate Limiting
    max_requests_per_minute: int = 60
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

### 2. Main Application (`app/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import health, goals, roadmap_assistant, note_assistant, analysis

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(goals.router, prefix=settings.api_prefix, tags=["Goals"])
app.include_router(roadmap_assistant.router, prefix=settings.api_prefix, tags=["Roadmap Assistant"])
app.include_router(note_assistant.router, prefix=settings.api_prefix, tags=["Note Assistant"])
app.include_router(analysis.router, prefix=settings.api_prefix, tags=["Analysis"])

@app.get("/")
async def root():
    return {
        "message": "AI Tutor API",
        "version": settings.api_version,
        "docs": "/docs"
    }
```

### 3. Authentication Middleware (`app/middleware/auth.py`)

```python
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings
import httpx

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Auth0 JWT token"""
    token = credentials.credentials
    
    try:
        # Get JWKS from Auth0
        jwks_url = f"https://{settings.auth0_domain}/.well-known/jwks.json"
        async with httpx.AsyncClient() as client:
            jwks_response = await client.get(jwks_url)
            jwks = jwks_response.json()
        
        # Decode and verify token
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
        
        if rsa_key:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                audience=settings.auth0_audience,
                issuer=settings.auth0_issuer,
            )
            return payload
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to find appropriate key"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
```

### 4. Database Service (`app/services/database_service.py`)

```python
import httpx
from typing import Dict, Any, Optional
from app.config import settings

class DatabaseService:
    """Service to fetch user data from NestJS backend"""
    
    def __init__(self):
        self.nestjs_url = settings.nestjs_api_url
        self.graphql_url = settings.nestjs_graphql_url
    
    async def get_user_context(
        self, 
        user_id: int, 
        auth_token: str
    ) -> Dict[str, Any]:
        """Fetch user's notes, roadmaps, and desktops from NestJS"""
        
        # GraphQL query to get user context
        query = """
        query GetUserStudyContext($userId: Int!) {
            notes(userId: $userId) {
                id
                title
                content
                createdAt
                updatedAt
                tags {
                    tag {
                        id
                        name
                    }
                }
            }
            roadmaps(userId: $userId) {
                id
                title
                description
                createdAt
                updatedAt
                steps {
                    id
                    title
                    description
                    order
                    isCompleted
                    createdAt
                }
            }
            desktops(userId: $userId) {
                id
                name
                description
            }
        }
        """
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.graphql_url,
                json={
                    "query": query,
                    "variables": {"userId": user_id}
                },
                headers={
                    "Authorization": f"Bearer {auth_token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code != 200:
                raise Exception(f"Failed to fetch user context: {response.status_code}")
            
            data = response.json()
            if "errors" in data:
                raise Exception(f"GraphQL errors: {data['errors']}")
            
            return data["data"]
    
    async def get_user_stats(
        self,
        user_id: int,
        auth_token: str
    ) -> Dict[str, Any]:
        """Get user statistics for analysis"""
        context = await self.get_user_context(user_id, auth_token)
        
        notes = context.get("notes", [])
        roadmaps = context.get("roadmaps", [])
        
        total_steps = sum(len(r.get("steps", [])) for r in roadmaps)
        completed_steps = sum(
            sum(1 for s in r.get("steps", []) if s.get("isCompleted", False))
            for r in roadmaps
        )
        
        return {
            "totalNotes": len(notes),
            "totalRoadmaps": len(roadmaps),
            "totalSteps": total_steps,
            "completedSteps": completed_steps,
            "completionRate": completed_steps / total_steps if total_steps > 0 else 0
        }
```

### 5. LLM Service (`app/services/llm_service.py`)

```python
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
from typing import Dict, Any, Optional, List
from app.config import settings
import json

class LLMService:
    """Service for interacting with LLM providers"""
    
    def __init__(self):
        self.provider = settings.llm_provider
        self.model = settings.llm_model
        
        if self.provider == "openai":
            self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        elif self.provider == "anthropic":
            self.client = AsyncAnthropic(api_key=settings.anthropic_api_key)
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        response_format: Optional[Dict] = None
    ) -> str:
        """Generate response from LLM"""
        
        if self.provider == "openai":
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens
            }
            
            if response_format:
                kwargs["response_format"] = response_format
            
            response = await self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content
        
        elif self.provider == "anthropic":
            system = system_prompt if system_prompt else ""
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system,
                messages=[{"role": "user", "content": prompt}]
            )
            return response.content[0].text
    
    async def generate_structured_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate structured JSON response"""
        
        if self.provider == "openai" and schema:
            # Use JSON mode for OpenAI
            response_format = {"type": "json_object"}
            system_with_schema = f"{system_prompt}\n\nRespond in valid JSON matching this schema: {json.dumps(schema)}"
            
            response = await self.generate_response(
                prompt,
                system_prompt=system_with_schema,
                response_format=response_format
            )
        else:
            # For other providers or no schema, ask for JSON in prompt
            json_prompt = f"{prompt}\n\nRespond with valid JSON only."
            response = await self.generate_response(
                json_prompt,
                system_prompt=system_prompt
            )
        
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            # Fallback: try to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            raise ValueError("Failed to parse JSON response")
```

### 6. Recommendation Service (`app/services/recommendation_service.py`)

```python
from typing import List, Dict, Any
from app.services.llm_service import LLMService
from app.services.database_service import DatabaseService
from datetime import datetime, timedelta

class RecommendationService:
    """Service for generating AI recommendations"""
    
    def __init__(self):
        self.llm_service = LLMService()
        self.db_service = DatabaseService()
    
    async def generate_daily_goals(
        self,
        user_id: int,
        auth_token: str
    ) -> List[Dict[str, Any]]:
        """Generate daily study goals for user"""
        
        # Fetch user context
        context = await self.db_service.get_user_context(user_id, auth_token)
        stats = await self.db_service.get_user_stats(user_id, auth_token)
        
        # Prepare prompt
        system_prompt = """You are an AI tutor helping students with their learning. 
        Analyze the user's study data and suggest 3-5 daily goals that are:
        1. Specific and actionable
        2. Based on their incomplete roadmaps and recent notes
        3. Appropriate for a single study session (30-120 minutes total)
        4. Prioritized by importance and urgency
        
        Return a JSON array of goals with this structure:
        {
            "goals": [
                {
                    "type": "roadmap_step" | "note_review" | "new_note" | "roadmap_creation",
                    "title": "Goal title",
                    "description": "Detailed description",
                    "priority": "high" | "medium" | "low",
                    "estimatedTime": 30,
                    "relatedContent": {
                        "roadmapId": 1,
                        "stepId": 2
                    },
                    "reasoning": "Why this goal is suggested"
                }
            ]
        }"""
        
        user_prompt = f"""User's study context:
        - Total notes: {stats['totalNotes']}
        - Total roadmaps: {stats['totalRoadmaps']}
        - Completion rate: {stats['completionRate']:.1%}
        
        Incomplete roadmap steps:
        {self._format_incomplete_steps(context.get('roadmaps', []))}
        
        Recent notes (last 7 days):
        {self._format_recent_notes(context.get('notes', []))}
        
        Suggest daily goals for today."""
        
        response = await self.llm_service.generate_structured_response(
            user_prompt,
            system_prompt=system_prompt
        )
        
        return response.get("goals", [])
    
    async def assist_roadmap_creation(
        self,
        user_id: int,
        topic: str,
        description: Optional[str],
        auth_token: str
    ) -> Dict[str, Any]:
        """Assist in creating a roadmap for a topic"""
        
        context = await self.db_service.get_user_context(user_id, auth_token)
        
        system_prompt = """You are an AI tutor helping create learning roadmaps.
        Create a structured learning roadmap that breaks down a topic into manageable steps.
        Each step should be:
        1. Clear and specific
        2. Build upon previous steps
        3. Include learning objectives
        4. Have estimated time if possible
        
        Return JSON with this structure:
        {
            "suggestedRoadmap": {
                "title": "Roadmap title",
                "description": "Overview",
                "steps": [
                    {
                        "order": 1,
                        "title": "Step title",
                        "description": "What to learn",
                        "estimatedTime": 60,
                        "prerequisites": ["topic1", "topic2"],
                        "learningObjectives": ["objective1", "objective2"]
                    }
                ]
            },
            "reasoning": "Why this structure",
            "relatedNotes": [1, 2, 3]
        }"""
        
        user_prompt = f"""Create a learning roadmap for:
        Topic: {topic}
        Description: {description or 'No description provided'}
        
        User's existing knowledge (from their notes):
        {self._format_user_knowledge(context.get('notes', []))}
        
        Suggest a comprehensive roadmap."""
        
        response = await self.llm_service.generate_structured_response(
            user_prompt,
            system_prompt=system_prompt
        )
        
        return response
    
    async def assist_note_creation(
        self,
        user_id: int,
        content: str,
        title: Optional[str],
        auth_token: str
    ) -> Dict[str, Any]:
        """Assist in creating/improving a note"""
        
        context = await self.db_service.get_user_context(user_id, auth_token)
        
        system_prompt = """You are an AI tutor helping improve study notes.
        Analyze the note content and provide suggestions for:
        1. Better title (if missing or unclear)
        2. Improved content structure
        3. Relevant tags based on content
        4. Related notes from user's collection
        5. Content gaps or areas needing more detail
        
        Return JSON with this structure:
        {
            "suggestions": {
                "title": "Suggested title",
                "improvedContent": "Improved content (if significant changes)",
                "suggestedTags": ["tag1", "tag2"],
                "relatedNotes": [
                    {
                        "id": 1,
                        "title": "Note title",
                        "relevance": 0.85,
                        "reason": "Why it's related"
                    }
                ],
                "contentGaps": ["gap1", "gap2"],
                "improvements": [
                    {
                        "type": "structure" | "clarity" | "completeness",
                        "suggestion": "What to improve",
                        "location": "Where in content"
                    }
                ]
            }
        }"""
        
        user_prompt = f"""Analyze this note:
        Title: {title or 'No title'}
        Content: {content}
        
        User's existing notes for context:
        {self._format_notes_summary(context.get('notes', []))}
        
        Provide suggestions."""
        
        response = await self.llm_service.generate_structured_response(
            user_prompt,
            system_prompt=system_prompt
        )
        
        return response.get("suggestions", {})
    
    def _format_incomplete_steps(self, roadmaps: List[Dict]) -> str:
        """Format incomplete roadmap steps for prompt"""
        result = []
        for roadmap in roadmaps:
            incomplete = [s for s in roadmap.get("steps", []) if not s.get("isCompleted", False)]
            if incomplete:
                result.append(f"\n{roadmap['title']}:")
                for step in incomplete:
                    result.append(f"  - Step {step['order']}: {step['title']}")
        return "\n".join(result) if result else "No incomplete steps"
    
    def _format_recent_notes(self, notes: List[Dict], days: int = 7) -> str:
        """Format recent notes for prompt"""
        cutoff = datetime.now() - timedelta(days=days)
        recent = [
            n for n in notes
            if datetime.fromisoformat(n["createdAt"].replace("Z", "+00:00")) > cutoff
        ]
        return "\n".join([f"- {n['title']}" for n in recent[:10]]) if recent else "No recent notes"
    
    def _format_user_knowledge(self, notes: List[Dict]) -> str:
        """Format user's knowledge from notes"""
        topics = {}
        for note in notes:
            tags = [t["tag"]["name"] for t in note.get("tags", [])]
            for tag in tags:
                topics[tag] = topics.get(tag, 0) + 1
        
        return ", ".join([f"{topic} ({count} notes)" for topic, count in sorted(topics.items(), key=lambda x: x[1], reverse=True)[:10]])
    
    def _format_notes_summary(self, notes: List[Dict]) -> str:
        """Format notes summary for prompt"""
        return "\n".join([
            f"- [{n['id']}] {n['title']}: {n['content'][:100]}..."
            for n in notes[:20]
        ])
```

### 7. Goals Router (`app/routers/goals.py`)

```python
from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import verify_token
from app.services.recommendation_service import RecommendationService
from app.models.requests import DailyGoalsRequest
from app.models.responses import DailyGoalsResponse

router = APIRouter()
recommendation_service = RecommendationService()

@router.post("/goals/daily", response_model=DailyGoalsResponse)
async def get_daily_goals(
    request: DailyGoalsRequest,
    token_data: dict = Depends(verify_token)
):
    """Get daily study goals for user"""
    try:
        user_id = request.userId
        auth_token = token_data.get("sub")  # Extract from token
        
        goals = await recommendation_service.generate_daily_goals(
            user_id,
            auth_token
        )
        
        total_time = sum(g.get("estimatedTime", 0) for g in goals)
        
        return DailyGoalsResponse(
            goals=goals,
            summary={
                "totalGoals": len(goals),
                "estimatedTotalTime": total_time
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 8. Request/Response Models (`app/models/requests.py` and `responses.py`)

```python
# requests.py
from pydantic import BaseModel
from typing import Optional, List

class DailyGoalsRequest(BaseModel):
    userId: int

class RoadmapAssistRequest(BaseModel):
    userId: int
    topic: str
    description: Optional[str] = None
    existingKnowledge: Optional[List[str]] = None

class NoteAssistRequest(BaseModel):
    userId: int
    content: str
    title: Optional[str] = None
    desktopId: Optional[int] = None

# responses.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class Goal(BaseModel):
    id: Optional[str] = None
    type: str  # "roadmap_step" | "note_review" | "new_note" | "roadmap_creation"
    title: str
    description: str
    priority: str  # "high" | "medium" | "low"
    estimatedTime: int
    relatedContent: Optional[Dict[str, Any]] = None
    reasoning: str

class DailyGoalsResponse(BaseModel):
    goals: List[Goal]
    summary: Dict[str, Any]

class RoadmapStep(BaseModel):
    order: int
    title: str
    description: str
    estimatedTime: Optional[int] = None
    prerequisites: Optional[List[str]] = None
    learningObjectives: List[str]

class SuggestedRoadmap(BaseModel):
    title: str
    description: str
    steps: List[RoadmapStep]

class RoadmapAssistResponse(BaseModel):
    suggestedRoadmap: SuggestedRoadmap
    reasoning: str
    relatedNotes: List[int]

class NoteAssistResponse(BaseModel):
    suggestions: Dict[str, Any]
```

---

## Frontend Integration

### 1. AI API Service (`src/services/ai-api.ts`)

```typescript
import { API_BASE_URL } from '../config/environment';

const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8000';

interface DailyGoal {
  id?: string;
  type: 'roadmap_step' | 'note_review' | 'new_note' | 'roadmap_creation';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number;
  relatedContent?: {
    roadmapId?: number;
    stepId?: number;
    noteId?: number;
  };
  reasoning: string;
}

interface DailyGoalsResponse {
  goals: DailyGoal[];
  summary: {
    totalGoals: number;
    estimatedTotalTime: number;
  };
}

class AIService {
  private async getAuthToken(): Promise<string | null> {
    // Get token from Auth0 (same as graphql-api.ts)
    // This should use the same token getter
    return null; // Implement based on your auth setup
  }

  async getDailyGoals(userId: number): Promise<DailyGoalsResponse> {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${AI_API_BASE_URL}/api/ai/goals/daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch daily goals: ${response.statusText}`);
    }

    return response.json();
  }

  async assistRoadmapCreation(
    userId: number,
    topic: string,
    description?: string
  ) {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${AI_API_BASE_URL}/api/ai/roadmap/assist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, topic, description }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get roadmap assistance: ${response.statusText}`);
    }

    return response.json();
  }

  async assistNoteCreation(
    userId: number,
    content: string,
    title?: string,
    desktopId?: number
  ) {
    const token = await this.getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${AI_API_BASE_URL}/api/ai/note/assist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, content, title, desktopId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get note assistance: ${response.statusText}`);
    }

    return response.json();
  }
}

export const aiService = new AIService();
```

### 2. AI Store (`src/stores/aiStore.ts`)

```typescript
import { create } from 'zustand';
import { aiService } from '@/services/ai-api';
import type { DailyGoal } from '@/services/ai-api';

interface AIState {
  dailyGoals: DailyGoal[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  fetchDailyGoals: (userId: number) => Promise<void>;
  clearGoals: () => void;
}

export const useAIStore = create<AIState>((set) => ({
  dailyGoals: [],
  isLoading: false,
  error: null,
  lastFetched: null,

  fetchDailyGoals: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await aiService.getDailyGoals(userId);
      set({
        dailyGoals: response.goals,
        isLoading: false,
        lastFetched: Date.now(),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch goals',
        isLoading: false,
      });
    }
  },

  clearGoals: () => set({ dailyGoals: [], lastFetched: null }),
}));
```

---

## Environment Variables

### `.env.example`

```env
# FastAPI Configuration
API_TITLE=AI Tutor API
API_VERSION=1.0.0

# LLM Configuration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
LLM_PROVIDER=openai
LLM_MODEL=gpt-4-turbo-preview
EMBEDDING_MODEL=text-embedding-3-small

# NestJS Backend
NESTJS_API_URL=http://localhost:3000
NESTJS_GRAPHQL_URL=http://localhost:3000/graphql

# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_AUDIENCE=https://your-api
AUTH0_ISSUER=https://your-domain.auth0.com/

# Cache
CACHE_TTL_SECONDS=300
ENABLE_REDIS=false
REDIS_URL=redis://localhost:6379

# Feature Flags
ENABLE_DAILY_GOALS=true
ENABLE_ROADMAP_ASSISTANT=true
ENABLE_NOTE_ASSISTANT=true
```

---

## Docker Setup

### `Dockerfile`

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### `docker-compose.yml`

```yaml
version: '3.8'

services:
  ai-tutor-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NESTJS_API_URL=${NESTJS_API_URL}
      - AUTH0_DOMAIN=${AUTH0_DOMAIN}
      - AUTH0_AUDIENCE=${AUTH0_AUDIENCE}
    env_file:
      - .env
    volumes:
      - ./app:/app/app
    restart: unless-stopped
```

---

## Running the Service

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Next Steps

1. **Set up the FastAPI project** using the structure above
2. **Configure environment variables** from `.env.example`
3. **Implement authentication** with your Auth0 setup
4. **Test the endpoints** using the FastAPI docs at `/docs`
5. **Integrate with frontend** using the provided TypeScript services
6. **Deploy** alongside your NestJS backend

This implementation provides a solid foundation for the AI-Tutor feature. You can extend it with additional features like embeddings, vector search, and more sophisticated recommendation algorithms.
