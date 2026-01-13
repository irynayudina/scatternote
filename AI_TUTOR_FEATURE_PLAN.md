# AI-Tutor Feature - Comprehensive Implementation Plan

## 1. Feature Overview

### 1.1 Purpose
The AI-Tutor is an intelligent learning assistant that analyzes a user's notes and roadmaps to provide personalized study guidance, daily goal suggestions, and assistance in creating and improving learning materials.

### 1.2 Core Capabilities

#### 1.2.1 Knowledge Understanding
- **Content Analysis**: Analyzes all user notes and roadmaps to understand:
  - Topics being studied
  - Learning progress (completed vs. pending roadmap steps)
  - Study patterns (frequent topics, tags, desktop organization)
  - Knowledge gaps (incomplete roadmaps, sparse note coverage)
  - Learning velocity (notes created over time, roadmap completion rate)

#### 1.2.2 Daily Goal Suggestions
- **Intelligent Recommendations**: Suggests daily study goals based on:
  - Active roadmaps with incomplete steps
  - Recently created notes (topics to review)
  - Roadmap deadlines (if implemented)
  - User's historical study patterns
  - Spaced repetition principles (suggest reviewing older notes)

#### 1.2.3 Roadmap Creation Assistance
- **Smart Roadmap Generation**: Helps users create roadmaps by:
  - Suggesting roadmap structure based on topic complexity
  - Breaking down large topics into manageable steps
  - Recommending prerequisite knowledge based on existing notes
  - Suggesting step order and dependencies
  - Providing step descriptions and learning objectives

#### 1.2.4 Note Creation Assistance
- **Content Enhancement**: Aids in note creation by:
  - Suggesting note titles based on content
  - Recommending tags based on note content and existing tag patterns
  - Suggesting related notes to link or reference
  - Providing content improvements (structure, clarity)
  - Identifying gaps in knowledge coverage
  - Suggesting follow-up notes based on roadmap steps

### 1.3 User Experience
- **Non-intrusive**: AI suggestions appear as optional enhancements
- **Contextual**: Suggestions appear when creating/editing notes and roadmaps
- **Dashboard Widget**: Daily goals displayed prominently on desktop
- **Proactive**: Can send notifications for daily goals and study reminders

---

## 2. Architecture Overview

### 2.1 System Architecture

```
┌─────────────────┐
│   React Frontend│
│   (TypeScript)  │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│  NestJS Backend │  │ FastAPI Backend │
│  (GraphQL)      │  │  (AI Services)  │
│                 │  │                 │
│  - CRUD Ops     │  │  - AI Analysis  │
│  - Auth         │  │  - LLM Calls    │
│  - Data Access  │  │  - Embeddings   │
└────────┬────────┘  └────────┬────────┘
         │                    │
         └──────────┬─────────┘
                    │
                    ▼
         ┌──────────────────┐
         │   PostgreSQL DB   │
         │   (Prisma ORM)    │
         └──────────────────┘
```

### 2.2 Component Responsibilities

#### 2.2.1 NestJS Backend (Existing)
- **Primary API**: Handles all CRUD operations
- **Authentication**: Auth0 token validation
- **Data Management**: Prisma ORM for database access
- **GraphQL API**: Main API interface for frontend

#### 2.2.2 FastAPI Backend (New)
- **AI Processing**: LLM integration and processing
- **Content Analysis**: Semantic analysis of notes/roadmaps
- **Recommendation Engine**: Goal and suggestion generation
- **Embedding Generation**: Vector embeddings for semantic search
- **REST API**: Provides AI-specific endpoints

#### 2.2.3 Communication Pattern
- **Frontend → NestJS**: All data operations (GraphQL)
- **NestJS → FastAPI**: Fetches user data, forwards to AI service
- **FastAPI → NestJS**: Returns AI suggestions/results
- **Frontend → FastAPI**: Direct calls for AI features (optional, can go through NestJS)

---

## 3. Detailed Scope of Work

### 3.1 Phase 1: FastAPI Backend Setup & Core Infrastructure

#### 3.1.1 Project Structure
```
ai-tutor-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration management
│   ├── dependencies.py         # Shared dependencies
│   │
│   ├── models/                 # Pydantic models
│   │   ├── __init__.py
│   │   ├── requests.py         # Request models
│   │   ├── responses.py        # Response models
│   │   └── user_data.py        # User data models (notes, roadmaps)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── llm_service.py      # LLM integration (OpenAI/Anthropic)
│   │   ├── embedding_service.py # Vector embeddings
│   │   ├── analysis_service.py  # Content analysis
│   │   ├── recommendation_service.py # Goal/suggestion generation
│   │   └── database_service.py  # Data fetching from NestJS
│   │
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py           # Health check
│   │   ├── analysis.py          # Content analysis endpoints
│   │   ├── goals.py             # Daily goals endpoints
│   │   ├── roadmap_assistant.py # Roadmap creation assistance
│   │   └── note_assistant.py    # Note creation assistance
│   │
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py              # Auth0 token validation
│   │   └── cors.py               # CORS configuration
│   │
│   └── utils/
│       ├── __init__.py
│       ├── text_processing.py   # Text utilities
│       └── cache.py              # Caching utilities
│
├── tests/
│   ├── __init__.py
│   ├── test_analysis.py
│   ├── test_recommendations.py
│   └── test_goals.py
│
├── requirements.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

#### 3.1.2 Core Dependencies
```python
# requirements.txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
httpx==0.25.2              # For calling NestJS API
python-jose[cryptography]==3.3.0  # JWT validation
python-multipart==0.0.6
openai==1.3.0               # OpenAI API
anthropic==0.7.0           # Anthropic Claude (alternative)
langchain==0.1.0            # Optional: for advanced LLM workflows
sentence-transformers==2.2.2  # For embeddings
redis==5.0.1                # Optional: for caching
python-dotenv==1.0.0
```

#### 3.1.3 Configuration
- Environment variables for:
  - LLM API keys (OpenAI/Anthropic)
  - NestJS API URL
  - Auth0 configuration
  - Database connection (if direct access needed)
  - Cache settings
  - Feature flags

### 3.2 Phase 2: Data Integration

#### 3.2.1 NestJS API Extensions
Add endpoints to NestJS for AI service to fetch user data:

**New GraphQL Queries:**
```graphql
# Get user's study context for AI analysis
query GetUserStudyContext($userId: Int!) {
  userStudyContext(userId: $userId) {
    notes {
      id
      title
      content
      createdAt
      updatedAt
      tags { tag { name } }
    }
    roadmaps {
      id
      title
      description
      createdAt
      steps {
        id
        title
        description
        order
        isCompleted
        createdAt
      }
    }
    desktops {
      id
      name
      description
    }
  }
}
```

**Or REST Endpoint:**
```
GET /api/ai/user-context/:userId
Headers: Authorization: Bearer <token>
Response: {
  notes: [...],
  roadmaps: [...],
  desktops: [...],
  stats: {
    totalNotes: number,
    totalRoadmaps: number,
    completedSteps: number,
    totalSteps: number
  }
}
```

#### 3.2.2 FastAPI Data Service
Service to fetch and structure user data from NestJS:
- Authentication token forwarding
- Data transformation
- Caching strategy
- Error handling

### 3.3 Phase 3: AI Services Implementation

#### 3.3.1 LLM Service
- **Provider Support**: OpenAI GPT-4, Anthropic Claude
- **Prompt Engineering**: Structured prompts for each use case
- **Response Parsing**: Structured JSON responses
- **Error Handling**: Retries, fallbacks, rate limiting
- **Cost Optimization**: Token usage tracking, caching

#### 3.3.2 Embedding Service
- **Vector Embeddings**: Generate embeddings for notes/roadmaps
- **Semantic Search**: Find related content
- **Storage**: Optional vector database (Pinecone, Weaviate, or PostgreSQL pgvector)
- **Use Cases**:
  - Find similar notes
  - Suggest related content
  - Identify knowledge gaps

#### 3.3.3 Analysis Service
- **Content Analysis**:
  - Extract topics from notes
  - Identify learning themes
  - Analyze study patterns
  - Calculate progress metrics
- **Knowledge Graph**: Build relationships between notes/roadmaps
- **Gap Analysis**: Identify missing knowledge areas

#### 3.3.4 Recommendation Service
- **Daily Goals**:
  - Analyze incomplete roadmaps
  - Suggest next steps
  - Recommend review topics
  - Consider user's study history
- **Roadmap Suggestions**:
  - Step structure recommendations
  - Prerequisite identification
  - Learning path optimization
- **Note Suggestions**:
  - Tag recommendations
  - Related note suggestions
  - Content improvements
  - Gap-filling suggestions

### 3.4 Phase 4: API Endpoints

#### 3.4.1 Daily Goals Endpoint
```
POST /api/ai/goals/daily
Headers: Authorization: Bearer <token>
Body: {
  userId: number
}
Response: {
  goals: [
    {
      id: string,
      type: "roadmap_step" | "note_review" | "new_note" | "roadmap_creation",
      title: string,
      description: string,
      priority: "high" | "medium" | "low",
      estimatedTime: number, // minutes
      relatedContent: {
        roadmapId?: number,
        stepId?: number,
        noteId?: number
      },
      reasoning: string // Why this goal is suggested
    }
  ],
  summary: {
    totalGoals: number,
    estimatedTotalTime: number
  }
}
```

#### 3.4.2 Roadmap Creation Assistant
```
POST /api/ai/roadmap/assist
Headers: Authorization: Bearer <token>
Body: {
  userId: number,
  topic: string,
  description?: string,
  existingKnowledge?: string[] // Note IDs or topics
}
Response: {
  suggestedRoadmap: {
    title: string,
    description: string,
    steps: [
      {
        order: number,
        title: string,
        description: string,
        estimatedTime?: number,
        prerequisites?: string[],
        learningObjectives: string[]
      }
    ]
  },
  reasoning: string,
  relatedNotes: number[] // Note IDs that might be relevant
}
```

#### 3.4.3 Note Creation Assistant
```
POST /api/ai/note/assist
Headers: Authorization: Bearer <token>
Body: {
  userId: number,
  content: string, // Partial or full note content
  title?: string,
  desktopId?: number
}
Response: {
  suggestions: {
    title?: string,
    improvedContent?: string,
    suggestedTags: string[],
    relatedNotes: [
      {
        id: number,
        title: string,
        relevance: number, // 0-1
        reason: string
      }
    ],
    contentGaps: string[], // Topics that might need more coverage
    improvements: [
      {
        type: "structure" | "clarity" | "completeness",
        suggestion: string,
        location?: string // Where in content
      }
    ]
  }
}
```

#### 3.4.4 Content Analysis Endpoint
```
POST /api/ai/analyze/study-context
Headers: Authorization: Bearer <token>
Body: {
  userId: number
}
Response: {
  topics: [
    {
      name: string,
      frequency: number,
      lastStudied: string, // ISO date
      coverage: number, // 0-1
      relatedNotes: number[],
      relatedRoadmaps: number[]
    }
  ],
  learningProgress: {
    totalRoadmaps: number,
    completedRoadmaps: number,
    totalSteps: number,
    completedSteps: number,
    completionRate: number
  },
  studyPatterns: {
    averageNotesPerWeek: number,
    mostActiveTopics: string[],
    knowledgeGaps: string[]
  },
  recommendations: {
    focusAreas: string[],
    reviewTopics: string[],
    nextSteps: string[]
  }
}
```

### 3.5 Phase 5: Frontend Integration

#### 3.5.1 New Services
- `src/services/ai-api.ts`: FastAPI client service
- Types for AI responses
- Error handling

#### 3.5.2 New Components
- `src/components/AIDailyGoals.tsx`: Daily goals widget
- `src/components/RoadmapAIAssistant.tsx`: AI assistance in roadmap creation
- `src/components/NoteAIAssistant.tsx`: AI assistance in note creation
- `src/components/AIInsights.tsx`: Study insights dashboard

#### 3.5.3 Store Updates
- `src/stores/aiStore.ts`: Zustand store for AI features
- Cache AI responses
- Manage AI state

#### 3.5.4 UI Integration Points
1. **Desktop Dashboard**: Daily goals widget
2. **Roadmap Creation Modal**: AI assistant button
3. **Note Creation/Edit**: AI suggestions panel
4. **Settings Page**: AI preferences and controls

### 3.6 Phase 6: Advanced Features (Future)

#### 3.6.1 Spaced Repetition
- Track note review history
- Suggest notes for review based on forgetting curve
- Optimal review timing

#### 3.6.2 Learning Analytics
- Progress visualization
- Study time tracking
- Knowledge mastery estimation
- Learning velocity metrics

#### 3.6.3 Personalized Learning Paths
- Adaptive roadmap suggestions
- Difficulty adjustment
- Learning style adaptation

---

## 4. Implementation Plan

### 4.1 Development Phases

#### Phase 1: Foundation (Week 1-2)
- [ ] Set up FastAPI project structure
- [ ] Configure environment and dependencies
- [ ] Implement authentication middleware
- [ ] Create basic health check endpoint
- [ ] Set up data fetching from NestJS
- [ ] Basic LLM service integration

#### Phase 2: Core AI Services (Week 3-4)
- [ ] Implement LLM service with structured prompts
- [ ] Create embedding service
- [ ] Build analysis service
- [ ] Implement recommendation service
- [ ] Add caching layer

#### Phase 3: API Endpoints (Week 5)
- [ ] Daily goals endpoint
- [ ] Roadmap assistant endpoint
- [ ] Note assistant endpoint
- [ ] Content analysis endpoint
- [ ] Error handling and validation

#### Phase 4: NestJS Integration (Week 6)
- [ ] Add user context endpoint to NestJS
- [ ] Set up communication between NestJS and FastAPI
- [ ] Implement token forwarding
- [ ] Add AI feature flags/config

#### Phase 5: Frontend Integration (Week 7-8)
- [ ] Create AI API service
- [ ] Build daily goals component
- [ ] Integrate roadmap assistant
- [ ] Integrate note assistant
- [ ] Add AI insights dashboard
- [ ] Create AI store

#### Phase 6: Testing & Refinement (Week 9-10)
- [ ] Unit tests for AI services
- [ ] Integration tests
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] User feedback and iteration

### 4.2 Technical Considerations

#### 4.2.1 Authentication
- FastAPI validates Auth0 tokens
- Token forwarding from NestJS to FastAPI
- User ID extraction and validation

#### 4.2.2 Performance
- **Caching Strategy**:
  - Cache user context (5-10 minutes)
  - Cache AI responses (1-24 hours depending on type)
  - Cache embeddings (long-term)
- **Async Processing**: Long-running AI tasks use background jobs
- **Rate Limiting**: Prevent abuse, manage API costs

#### 4.2.3 Cost Management
- **LLM Usage**:
  - Use cheaper models for simple tasks
  - Cache responses aggressively
  - Batch requests when possible
  - Monitor token usage
- **Embedding Costs**: Cache embeddings, only regenerate when content changes

#### 4.2.4 Error Handling
- Graceful degradation (AI features optional)
- Fallback responses
- User-friendly error messages
- Logging and monitoring

#### 4.2.5 Security
- Input validation and sanitization
- Rate limiting
- Token validation
- Data privacy (user data not stored unnecessarily)

---

## 5. API Specifications

### 5.1 FastAPI Endpoints Summary

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/health` | GET | Health check | No |
| `/api/ai/goals/daily` | POST | Get daily goals | Yes |
| `/api/ai/roadmap/assist` | POST | Roadmap creation help | Yes |
| `/api/ai/note/assist` | POST | Note creation help | Yes |
| `/api/ai/analyze/study-context` | POST | Analyze user's study data | Yes |
| `/api/ai/roadmap/suggest-steps` | POST | Suggest roadmap steps | Yes |
| `/api/ai/note/suggest-tags` | POST | Suggest note tags | Yes |
| `/api/ai/note/find-related` | POST | Find related notes | Yes |

### 5.2 Request/Response Examples

See detailed examples in Phase 4 sections above.

---

## 6. Database Considerations

### 6.1 New Tables (Optional - for caching/analytics)

If storing AI-generated data:

```sql
-- Cache AI responses
CREATE TABLE ai_cache (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  cache_key VARCHAR(255) NOT NULL,
  response JSONB NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, cache_key)
);

-- Track AI usage (for analytics)
CREATE TABLE ai_usage_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  endpoint VARCHAR(100) NOT NULL,
  tokens_used INTEGER,
  cost DECIMAL(10, 4),
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store embeddings (if using vector DB)
CREATE TABLE note_embeddings (
  id SERIAL PRIMARY KEY,
  note_id INTEGER NOT NULL,
  embedding VECTOR(1536), -- OpenAI embedding dimension
  model VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2 Integration with Existing Schema
- No changes required to existing tables
- AI service reads from existing NestJS API
- Optional: Add AI-related fields to existing tables (e.g., `note.ai_suggested_tags`)

---

## 7. Deployment Strategy

### 7.1 FastAPI Deployment
- **Container**: Docker container
- **Orchestration**: Can run alongside NestJS or separately
- **Scaling**: Horizontal scaling for AI workloads
- **Environment**: Same infrastructure as NestJS (Railway, AWS, etc.)

### 7.2 Configuration
- Environment variables for all sensitive data
- Feature flags for gradual rollout
- Monitoring and logging setup

### 7.3 Communication
- **Internal**: FastAPI and NestJS communicate via HTTP
- **External**: Frontend can call FastAPI directly or through NestJS proxy
- **Recommendation**: Frontend calls FastAPI directly for AI features (lower latency)

---

## 8. Success Metrics

### 8.1 User Engagement
- Daily goals completion rate
- AI feature usage frequency
- User satisfaction with suggestions

### 8.2 Technical Metrics
- API response times
- LLM token usage and costs
- Cache hit rates
- Error rates

### 8.3 Learning Outcomes
- Roadmap completion rates
- Note creation quality
- Study consistency

---

## 9. Future Enhancements

1. **Multi-modal AI**: Support for images, diagrams in notes
2. **Voice Input**: Voice-to-note with AI processing
3. **Collaborative Learning**: AI suggestions for study groups
4. **Export/Import**: AI-generated study guides
5. **Mobile App**: AI features in mobile app
6. **Offline Mode**: Cached AI suggestions for offline use

---

## 10. Risk Mitigation

### 10.1 Technical Risks
- **LLM API Downtime**: Fallback to cached responses, graceful degradation
- **High Costs**: Aggressive caching, usage limits, cost monitoring
- **Slow Responses**: Async processing, progress indicators
- **Data Privacy**: Minimal data storage, encryption, compliance

### 10.2 User Experience Risks
- **Poor Suggestions**: User feedback loop, continuous improvement
- **Over-reliance**: Make AI optional, user always in control
- **Privacy Concerns**: Clear privacy policy, opt-out options

---

## 11. Documentation Requirements

1. **API Documentation**: OpenAPI/Swagger for FastAPI
2. **Integration Guide**: How to integrate with NestJS
3. **Frontend Guide**: How to use AI features in React
4. **Deployment Guide**: How to deploy FastAPI service
5. **User Guide**: How users interact with AI features

---

## 12. Conclusion

This plan provides a comprehensive roadmap for implementing the AI-Tutor feature. The architecture separates concerns by using FastAPI for AI processing while maintaining NestJS for core data operations. The phased approach allows for incremental development and testing.

**Key Benefits:**
- Personalized learning assistance
- Improved study efficiency
- Better content organization
- Enhanced user engagement

**Next Steps:**
1. Review and approve this plan
2. Set up FastAPI project structure
3. Begin Phase 1 implementation
4. Iterate based on feedback
