// Re-export GraphQL API service as the main API service
export { graphqlApiService as apiService } from './graphql-api';
export type { 
  Note, 
  Desktop, 
  User, 
  UserSettings, 
  Auth0User, 
  Tag, 
  RoadmapStep, 
  Roadmap 
} from './graphql-api'; 