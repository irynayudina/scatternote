import { API_BASE_URL } from '../config/environment';

export interface Note {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  desktopId: number;
  isPinned?: boolean;
  tags?: Array<{
    tag: {
      id: number;
      name: string;
    };
  }>;
}

export interface Desktop {
  id: number;
  name: string;
  description?: string;
  userId: number;
  createdAt: string;
  notes?: Note[];
  _count?: {
    notes: number;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  picture?: string;
  role: string;
  createdAt: string;
}

export interface UserSettings {
  id: number;
  userId: number;
  preferredTheme: string;
  desktopBackground?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Auth0User {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  nickname: string;
  picture: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = sessionStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Auth API calls
  async createUser(auth0User: Auth0User): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auth0User),
    });
    return this.handleResponse(response);
  }

  async createUserWithUsername(auth0User: Auth0User & { username: string }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/create-user-with-username`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auth0User),
    });
    return this.handleResponse(response);
  }

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return this.handleResponse(response);
  }

  // Desktop API calls
  async getDesktops(userId: number): Promise<Desktop[]> {
    const response = await fetch(`${API_BASE_URL}/desktop?userId=${userId}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Desktop[]> = await this.handleResponse(response);
    return result.data;
  }

  async getDesktop(desktopId: number, userId: number): Promise<Desktop> {
    const response = await fetch(`${API_BASE_URL}/desktop/${desktopId}?userId=${userId}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Desktop> = await this.handleResponse(response);
    return result.data;
  }

  async createDesktop(desktopData: { name: string; description?: string }, userId: number): Promise<Desktop> {
    const response = await fetch(`${API_BASE_URL}/desktop?userId=${userId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(desktopData),
    });
    const result: ApiResponse<Desktop> = await this.handleResponse(response);
    return result.data;
  }

  // Note API calls
  async getNotes(userId: number, desktopId?: number, search?: string): Promise<Note[]> {
    let url = `${API_BASE_URL}/note?userId=${userId}`;
    if (desktopId) url += `&desktopId=${desktopId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Note[]> = await this.handleResponse(response);
    return result.data;
  }

  async getNote(noteId: number, userId: number): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/note/${noteId}?userId=${userId}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Note> = await this.handleResponse(response);
    return result.data;
  }

  async createNote(noteData: {
    title: string;
    content: string;
    desktopId: number;
    tags?: string[];
    isPinned?: boolean;
  }, userId: number): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/note?userId=${userId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(noteData),
    });
    const result: ApiResponse<Note> = await this.handleResponse(response);
    return result.data;
  }

  async updateNote(noteId: number, noteData: Partial<{
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
  }>, userId: number): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/note/${noteId}?userId=${userId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(noteData),
    });
    const result: ApiResponse<Note> = await this.handleResponse(response);
    return result.data;
  }

  async toggleNotePin(noteId: number, userId: number): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/note/${noteId}/pin?userId=${userId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Note> = await this.handleResponse(response);
    return result.data;
  }

  async deleteNote(noteId: number, userId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/note/${noteId}?userId=${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  async searchNotes(userId: number, query: string): Promise<Note[]> {
    const response = await fetch(`${API_BASE_URL}/note/search?userId=${userId}&q=${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Note[]> = await this.handleResponse(response);
    return result.data;
  }

  async getNotesByTag(userId: number, tagName: string): Promise<Note[]> {
    const response = await fetch(`${API_BASE_URL}/note/tag/${encodeURIComponent(tagName)}?userId=${userId}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Note[]> = await this.handleResponse(response);
    return result.data;
  }

  // Tag API calls
  async getAllTags(): Promise<Tag[]> {
    const response = await fetch(`${API_BASE_URL}/tag`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Tag[]> = await this.handleResponse(response);
    return result.data;
  }

  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    const response = await fetch(`${API_BASE_URL}/tag/popular?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Tag[]> = await this.handleResponse(response);
    return result.data;
  }

  async searchTags(query: string): Promise<Tag[]> {
    const response = await fetch(`${API_BASE_URL}/tag/search?q=${encodeURIComponent(query)}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Tag[]> = await this.handleResponse(response);
    return result.data;
  }

  async getTag(tagId: number): Promise<Tag> {
    const response = await fetch(`${API_BASE_URL}/tag/${tagId}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<Tag> = await this.handleResponse(response);
    return result.data;
  }

  async createTag(tagData: { name: string; color?: string }): Promise<Tag> {
    const response = await fetch(`${API_BASE_URL}/tag`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(tagData),
    });
    const result: ApiResponse<Tag> = await this.handleResponse(response);
    return result.data;
  }

  // Settings API calls
  async getUserSettings(userId: number): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/settings?userId=${userId}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<UserSettings> = await this.handleResponse(response);
    return result.data;
  }

  async updateUserSettings(userId: number, settingsData: { preferredTheme?: string; desktopBackground?: string }): Promise<UserSettings> {
    const response = await fetch(`${API_BASE_URL}/settings?userId=${userId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settingsData),
    });
    const result: ApiResponse<UserSettings> = await this.handleResponse(response);
    return result.data;
  }

  async getPreferredTheme(userId: number): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/settings/theme?userId=${userId}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<{ preferredTheme: string }> = await this.handleResponse(response);
    return result.data.preferredTheme;
  }

  async getDesktopBackground(userId: number): Promise<string | null> {
    const response = await fetch(`${API_BASE_URL}/settings/background?userId=${userId}`, {
      headers: this.getAuthHeaders(),
    });
    const result: ApiResponse<{ desktopBackground: string | null }> = await this.handleResponse(response);
    return result.data.desktopBackground;
  }
}

export const apiService = new ApiService(); 