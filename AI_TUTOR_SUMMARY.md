# AI-Tutor Feature - Executive Summary

## Overview

The AI-Tutor feature adds intelligent learning assistance to ScatterNote by analyzing user notes and roadmaps to provide personalized study guidance, daily goal suggestions, and assistance in creating learning materials.

## Key Features

1. **Daily Goal Suggestions** - AI analyzes incomplete roadmaps and recent notes to suggest 3-5 daily study goals
2. **Roadmap Creation Assistant** - Helps break down topics into structured learning steps
3. **Note Creation Assistant** - Suggests improvements, tags, and related content
4. **Study Context Analysis** - Understands what users are studying and identifies knowledge gaps

## Architecture

```
Frontend (React) 
    ↓
NestJS Backend (GraphQL) ←→ FastAPI Backend (AI Services)
    ↓
PostgreSQL Database
```

- **NestJS**: Handles all CRUD operations (existing)
- **FastAPI**: Handles AI processing and recommendations (new)
- **Communication**: FastAPI fetches user data from NestJS via GraphQL/REST

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up FastAPI project
- Configure authentication
- Basic LLM integration

### Phase 2: Core Services (Week 3-4)
- LLM service implementation
- Analysis and recommendation services
- Data fetching from NestJS

### Phase 3: API Endpoints (Week 5)
- Daily goals endpoint
- Roadmap assistant endpoint
- Note assistant endpoint

### Phase 4: NestJS Integration (Week 6)
- Add user context endpoint
- Set up inter-service communication

### Phase 5: Frontend Integration (Week 7-8)
- Create AI service client
- Build UI components
- Integrate with existing features

### Phase 6: Testing & Refinement (Week 9-10)
- Testing and optimization
- User feedback iteration

## Technology Stack

### FastAPI Backend
- **Framework**: FastAPI
- **LLM**: OpenAI GPT-4 or Anthropic Claude
- **Embeddings**: OpenAI text-embedding-3-small
- **Auth**: Auth0 JWT validation
- **Communication**: HTTP/GraphQL to NestJS

### Frontend Integration
- **Service**: New `ai-api.ts` service
- **Store**: New `aiStore.ts` Zustand store
- **Components**: Daily goals widget, assistant panels

## API Endpoints

| Endpoint | Purpose |
|---------|---------|
| `POST /api/ai/goals/daily` | Get daily study goals |
| `POST /api/ai/roadmap/assist` | Get roadmap creation help |
| `POST /api/ai/note/assist` | Get note creation help |
| `POST /api/ai/analyze/study-context` | Analyze user's study data |

## Key Files to Create

### Backend (FastAPI)
```
ai-tutor-backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── services/
│   │   ├── llm_service.py
│   │   ├── recommendation_service.py
│   │   └── database_service.py
│   └── routers/
│       ├── goals.py
│       ├── roadmap_assistant.py
│       └── note_assistant.py
```

### Frontend
```
src/
├── services/
│   └── ai-api.ts
├── stores/
│   └── aiStore.ts
└── components/
    ├── AIDailyGoals.tsx
    ├── RoadmapAIAssistant.tsx
    └── NoteAIAssistant.tsx
```

## Environment Variables

Required environment variables for FastAPI:
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
- `NESTJS_API_URL`
- `AUTH0_DOMAIN`, `AUTH0_AUDIENCE`, `AUTH0_ISSUER`

## Cost Considerations

- **LLM API Costs**: Estimated $0.01-0.10 per user per day (with caching)
- **Mitigation**: Aggressive caching, usage limits, cost monitoring
- **Optimization**: Use cheaper models for simple tasks, cache responses

## Security

- Auth0 token validation on all endpoints
- User data only fetched when needed
- No persistent storage of sensitive data
- Rate limiting to prevent abuse

## Success Metrics

- Daily goals completion rate
- AI feature usage frequency
- User satisfaction with suggestions
- API response times
- LLM token usage and costs

## Next Steps

1. Review `AI_TUTOR_FEATURE_PLAN.md` for detailed architecture
2. Review `AI_TUTOR_IMPLEMENTATION_GUIDE.md` for code examples
3. Set up FastAPI project structure
4. Begin Phase 1 implementation
5. Test with sample data
6. Integrate with frontend

## Documentation Files

- **AI_TUTOR_FEATURE_PLAN.md** - Comprehensive feature plan with architecture, scope, and phases
- **AI_TUTOR_IMPLEMENTATION_GUIDE.md** - Detailed code examples and implementation guide
- **AI_TUTOR_SUMMARY.md** - This executive summary

## Questions to Consider

1. **LLM Provider**: OpenAI or Anthropic? (Cost vs. quality trade-off)
2. **Deployment**: Same infrastructure as NestJS or separate?
3. **Caching**: Redis or in-memory? (For production scaling)
4. **Feature Rollout**: All features at once or phased?
5. **User Control**: Opt-in or opt-out for AI features?

## Support

For implementation questions, refer to:
- FastAPI documentation: https://fastapi.tiangolo.com/
- OpenAI API docs: https://platform.openai.com/docs
- Anthropic API docs: https://docs.anthropic.com/
