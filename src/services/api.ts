const API_BASE_URL = 'http://localhost:3000'; // Update this to match your backend URL

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
}

export const apiService = new ApiService(); 