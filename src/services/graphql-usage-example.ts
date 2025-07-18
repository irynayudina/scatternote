// Example usage of the GraphQL API service
// This file demonstrates how to migrate from REST to GraphQL

import { graphqlApiService } from './graphql-api';

// Example: Migrating from REST to GraphQL

// OLD REST WAY:
// import { apiService } from './api';
// const desktops = await apiService.getDesktops(userId);

// NEW GRAPHQL WAY:
// import { graphqlApiService } from './graphql-api';
// const desktops = await graphqlApiService.getDesktops(userId);

// The method signatures are identical, so migration is straightforward!

// Example usage patterns:

export class ExampleUsage {
  
  // Authentication
  async handleAuth0Login(auth0User: any) {
    try {
      const user = await graphqlApiService.createUser(auth0User);
      console.log('User created:', user);
      return user;
    } catch (error) {
      console.error('GraphQL Error:', error);
      throw error;
    }
  }

  // Desktop operations
  async loadUserDesktops(userId: number) {
    try {
      const desktops = await graphqlApiService.getDesktops(userId);
      console.log('Desktops loaded:', desktops);
      return desktops;
    } catch (error) {
      console.error('Failed to load desktops:', error);
      throw error;
    }
  }

  async createNewDesktop(name: string, description: string, userId: number) {
    try {
      const desktop = await graphqlApiService.createDesktop(
        { name, description },
        userId
      );
      console.log('Desktop created:', desktop);
      return desktop;
    } catch (error) {
      console.error('Failed to create desktop:', error);
      throw error;
    }
  }

  // Note operations
  async loadNotes(userId: number, desktopId?: number) {
    try {
      const notes = await graphqlApiService.getNotes(userId, desktopId);
      console.log('Notes loaded:', notes);
      return notes;
    } catch (error) {
      console.error('Failed to load notes:', error);
      throw error;
    }
  }

  async createNewNote(title: string, content: string, desktopId: number, userId: number) {
    try {
      const note = await graphqlApiService.createNote(
        { title, content, desktopId },
        userId
      );
      console.log('Note created:', note);
      return note;
    } catch (error) {
      console.error('Failed to create note:', error);
      throw error;
    }
  }

  async toggleNotePin(noteId: number, userId: number) {
    try {
      const note = await graphqlApiService.toggleNotePin(noteId, userId);
      console.log('Note pin toggled:', note);
      return note;
    } catch (error) {
      console.error('Failed to toggle note pin:', error);
      throw error;
    }
  }

  // Tag operations
  async loadAllTags() {
    try {
      const tags = await graphqlApiService.getAllTags();
      console.log('Tags loaded:', tags);
      return tags;
    } catch (error) {
      console.error('Failed to load tags:', error);
      throw error;
    }
  }

  async searchTags(query: string) {
    try {
      const tags = await graphqlApiService.searchTags(query);
      console.log('Tags found:', tags);
      return tags;
    } catch (error) {
      console.error('Failed to search tags:', error);
      throw error;
    }
  }

  // Settings operations
  async loadUserSettings(userId: number) {
    try {
      const settings = await graphqlApiService.getUserSettings(userId);
      console.log('Settings loaded:', settings);
      return settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      throw error;
    }
  }

  async updateUserTheme(userId: number, theme: string) {
    try {
      const settings = await graphqlApiService.updateUserSettings(userId, {
        preferredTheme: theme
      });
      console.log('Theme updated:', settings);
      return settings;
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    }
  }

  // Roadmap operations
  async loadRoadmaps(userId: number, desktopId?: number) {
    try {
      const roadmaps = await graphqlApiService.getRoadmaps(userId, desktopId);
      console.log('Roadmaps loaded:', roadmaps);
      return roadmaps;
    } catch (error) {
      console.error('Failed to load roadmaps:', error);
      throw error;
    }
  }

  async createNewRoadmap(title: string, description: string, desktopId: number, userId: number) {
    try {
      const roadmap = await graphqlApiService.createRoadmap(
        {
          title,
          description,
          steps: [
            { title: 'Step 1', order: 1 },
            { title: 'Step 2', order: 2 }
          ]
        },
        userId,
        desktopId
      );
      console.log('Roadmap created:', roadmap);
      return roadmap;
    } catch (error) {
      console.error('Failed to create roadmap:', error);
      throw error;
    }
  }

  async toggleStepCompletion(stepId: number, userId: number) {
    try {
      const roadmap = await graphqlApiService.toggleStepCompletion(stepId, userId);
      console.log('Step completion toggled:', roadmap);
      return roadmap;
    } catch (error) {
      console.error('Failed to toggle step completion:', error);
      throw error;
    }
  }
}

// Migration helper function
export function migrateFromRestToGraphQL() {
  console.log(`
    Migration Steps:
    
    1. Install dependencies:
       npm install @apollo/client graphql
    
    2. Replace imports:
       - Remove: import { apiService } from './api'
       - Add: import { graphqlApiService } from './graphql-api'
    
    3. Update method calls:
       - Change: apiService.methodName(...)
       - To: graphqlApiService.methodName(...)
    
    4. Method signatures remain the same!
    
    5. Benefits you get:
       - Automatic caching
       - Better error handling
       - Type safety
       - Reduced network requests
  `);
} 