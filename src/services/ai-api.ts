
import { API_BASE_URL } from '../config/environment';

const AI_API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'http://localhost:8000';

export interface DailyGoal {
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