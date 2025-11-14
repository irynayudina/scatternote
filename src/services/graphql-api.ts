import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { API_BASE_URL } from '../config/environment';

// GraphQL Client Setup
const httpLink = createHttpLink({
  uri: `${API_BASE_URL}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  const token = sessionStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          desktops: {
            merge(existing = [], incoming: any[]) {
              return incoming;
            },
          },
          notes: {
            merge(existing = [], incoming: any[]) {
              return incoming;
            },
          },
          roadmaps: {
            merge(existing = [], incoming: any[]) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

// Type definitions (matching the backend entities)
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

export interface RoadmapStep {
  id: number;
  title: string;
  description?: string;
  order: number;
  isCompleted: boolean;
  roadmapId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Roadmap {
  id: number;
  title: string;
  description?: string;
  desktopId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  steps: RoadmapStep[];
}

// GraphQL Queries and Mutations

// Auth Queries
const CREATE_OR_UPDATE_USER = gql`
  mutation CreateOrUpdateUser($auth0User: Auth0UserInput!) {
    createOrUpdateUser(auth0User: $auth0User) {
      id
      username
      email
      picture
      role
      createdAt
    }
  }
`;

const CREATE_USER_WITH_USERNAME = gql`
  mutation CreateUserWithCustomUsername($createUserDto: CreateUserWithUsernameInput!) {
    createUserWithCustomUsername(createUserDto: $createUserDto) {
      id
      username
      email
      picture
      role
      createdAt
    }
  }
`;

const GET_USER_PROFILE = gql`
  query GetUserProfile($auth0Id: String!) {
    userProfile(auth0Id: $auth0Id) {
      id
      username
      email
      picture
      role
      createdAt
    }
  }
`;

// Desktop Queries
const GET_DESKTOPS = gql`
  query GetDesktops($userId: Int!) {
    desktops(userId: $userId) {
      id
      name
      description
      userId
      createdAt
      updatedAt
      _count {
        notes
      }
    }
  }
`;

const GET_DESKTOP = gql`
  query GetDesktop($desktopId: Int!, $userId: Int!) {
    desktop(desktopId: $desktopId, userId: $userId) {
      id
      name
      description
      userId
      createdAt
      updatedAt
      notes {
        id
        title
        content
        isPinned
        createdAt
        updatedAt
        desktopId
      }
      _count {
        notes
      }
    }
  }
`;

const CREATE_DESKTOP = gql`
  mutation CreateDesktop($createDesktopInput: CreateDesktopInput!, $userId: Int!) {
    createDesktop(createDesktopInput: $createDesktopInput, userId: $userId) {
      id
      name
      description
      userId
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_DESKTOP = gql`
  mutation UpdateDesktop($desktopId: Int!, $updateDesktopInput: UpdateDesktopInput!, $userId: Int!) {
    updateDesktop(desktopId: $desktopId, updateDesktopInput: $updateDesktopInput, userId: $userId) {
      id
      name
      description
      userId
      createdAt
      updatedAt
    }
  }
`;

const DELETE_DESKTOP = gql`
  mutation DeleteDesktop($desktopId: Int!, $userId: Int!) {
    deleteDesktop(desktopId: $desktopId, userId: $userId)
  }
`;

// Note Queries
const GET_NOTES = gql`
  query GetNotes($userId: Int!, $desktopId: Int, $search: String) {
    notes(userId: $userId, desktopId: $desktopId, search: $search) {
      id
      title
      content
      isPinned
      desktopId
      userId
      createdAt
      updatedAt
      tags {
        tag {
          id
          name
        }
      }
    }
  }
`;

const GET_NOTE = gql`
  query GetNote($id: Int!, $userId: Int!) {
    note(id: $id, userId: $userId) {
      id
      title
      content
      isPinned
      desktopId
      userId
      createdAt
      updatedAt
      tags {
        tag {
          id
          name
        }
      }
    }
  }
`;

const CREATE_NOTE = gql`
  mutation CreateNote($createNoteInput: CreateNoteInput!, $userId: Int!) {
    createNote(createNoteInput: $createNoteInput, userId: $userId) {
      id
      title
      content
      isPinned
      desktopId
      userId
      createdAt
      updatedAt
      tags {
        tag {
          id
          name
        }
      }
    }
  }
`;

const UPDATE_NOTE = gql`
  mutation UpdateNote($id: Int!, $updateNoteInput: UpdateNoteInput!, $userId: Int!) {
    updateNote(id: $id, updateNoteInput: $updateNoteInput, userId: $userId) {
      id
      title
      content
      isPinned
      desktopId
      userId
      createdAt
      updatedAt
      tags {
        tag {
          id
          name
        }
      }
    }
  }
`;

const TOGGLE_NOTE_PIN = gql`
  mutation ToggleNotePin($id: Int!, $userId: Int!) {
    toggleNotePin(id: $id, userId: $userId) {
      id
      title
      content
      isPinned
      desktopId
      userId
      createdAt
      updatedAt
    }
  }
`;

const TRANSFER_NOTE = gql`
  mutation TransferNote($id: Int!, $targetDesktopId: Int!, $userId: Int!) {
    transferNote(id: $id, targetDesktopId: $targetDesktopId, userId: $userId) {
      id
      title
      content
      isPinned
      desktopId
      userId
      createdAt
      updatedAt
    }
  }
`;

const SEARCH_NOTES = gql`
  query SearchNotes($userId: Int!, $query: String!) {
    searchNotes(userId: $userId, query: $query) {
      id
      title
      content
      isPinned
      desktopId
      userId
      createdAt
      updatedAt
      tags {
        tag {
          id
          name
        }
      }
    }
  }
`;

const GET_NOTES_BY_TAG = gql`
  query GetNotesByTag($userId: Int!, $tagName: String!) {
    notesByTag(userId: $userId, tagName: $tagName) {
      id
      title
      content
      isPinned
      desktopId
      userId
      createdAt
      updatedAt
      tags {
        tag {
          id
          name
        }
      }
    }
  }
`;

const DELETE_NOTE = gql`
  mutation DeleteNote($id: Int!, $userId: Int!) {
    removeNote(id: $id, userId: $userId)
  }
`;

// Tag Queries
const GET_ALL_TAGS = gql`
  query GetAllTags {
    tags {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`;

const GET_POPULAR_TAGS = gql`
  query GetPopularTags($limit: Int) {
    popularTags(limit: $limit) {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`;

const SEARCH_TAGS = gql`
  query SearchTags($query: String!) {
    searchTags(query: $query) {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`;

const GET_TAG = gql`
  query GetTag($id: Int!) {
    tag(id: $id) {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`;

const CREATE_TAG = gql`
  mutation CreateTag($createTagInput: CreateTagInput!) {
    createTag(createTagInput: $createTagInput) {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_TAG = gql`
  mutation UpdateTag($id: Int!, $updateTagInput: UpdateTagInput!) {
    updateTag(id: $id, updateTagInput: $updateTagInput) {
      id
      name
      color
      createdAt
      updatedAt
    }
  }
`;

const DELETE_TAG = gql`
  mutation DeleteTag($id: Int!) {
    removeTag(id: $id)
  }
`;

// Settings Queries
const GET_USER_SETTINGS = gql`
  query GetUserSettings($userId: Int!) {
    userSettings(userId: $userId) {
      id
      userId
      preferredTheme
      desktopBackground
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings($userId: Int!, $updateSettingsInput: UpdateSettingsInput!) {
    updateUserSettings(userId: $userId, updateSettingsInput: $updateSettingsInput) {
      id
      userId
      preferredTheme
      desktopBackground
      createdAt
      updatedAt
    }
  }
`;

const GET_PREFERRED_THEME = gql`
  query GetPreferredTheme($userId: Int!) {
    preferredTheme(userId: $userId)
  }
`;

const GET_DESKTOP_BACKGROUND = gql`
  query GetDesktopBackground($userId: Int!) {
    desktopBackground(userId: $userId)
  }
`;

// Roadmap Queries
const GET_ROADMAPS = gql`
  query GetRoadmaps($userId: Int!, $desktopId: Int) {
    roadmaps(userId: $userId, desktopId: $desktopId) {
      id
      title
      description
      desktopId
      userId
      createdAt
      updatedAt
      steps {
        id
        title
        description
        order
        isCompleted
        roadmapId
        createdAt
        updatedAt
      }
    }
  }
`;

const GET_ROADMAP = gql`
  query GetRoadmap($roadmapId: Int!, $userId: Int!) {
    roadmap(roadmapId: $roadmapId, userId: $userId) {
      id
      title
      description
      desktopId
      userId
      createdAt
      updatedAt
      steps {
        id
        title
        description
        order
        isCompleted
        roadmapId
        createdAt
        updatedAt
      }
    }
  }
`;

const CREATE_ROADMAP = gql`
  mutation CreateRoadmap($createRoadmapInput: CreateRoadmapInput!, $userId: Int!) {
    createRoadmap(createRoadmapInput: $createRoadmapInput, userId: $userId) {
      id
      title
      description
      desktopId
      userId
      createdAt
      updatedAt
      steps {
        id
        title
        description
        order
        isCompleted
        roadmapId
        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_ROADMAP = gql`
  mutation UpdateRoadmap($roadmapId: Int!, $updateRoadmapInput: UpdateRoadmapInput!, $userId: Int!) {
    updateRoadmap(roadmapId: $roadmapId, updateRoadmapInput: $updateRoadmapInput, userId: $userId) {
      id
      title
      description
      desktopId
      userId
      createdAt
      updatedAt
      steps {
        id
        title
        description
        order
        isCompleted
        roadmapId
        createdAt
        updatedAt
      }
    }
  }
`;

const DELETE_ROADMAP = gql`
  mutation DeleteRoadmap($roadmapId: Int!, $userId: Int!) {
    deleteRoadmap(roadmapId: $roadmapId, userId: $userId)
  }
`;

const TRANSFER_ROADMAP = gql`
  mutation TransferRoadmap($roadmapId: Int!, $targetDesktopId: Int!, $userId: Int!) {
    transferRoadmap(roadmapId: $roadmapId, targetDesktopId: $targetDesktopId, userId: $userId) {
      id
      title
      description
      desktopId
      userId
      createdAt
      updatedAt
      steps {
        id
        title
        description
        order
        isCompleted
        roadmapId
        createdAt
        updatedAt
      }
    }
  }
`;

const UPDATE_ROADMAP_STEP = gql`
  mutation UpdateRoadmapStep($stepId: Int!, $updateStepDto: UpdateRoadmapStepDto!, $userId: Int!) {
    updateRoadmapStep(stepId: $stepId, updateStepDto: $updateStepDto, userId: $userId) {
      id
      title
      description
      desktopId
      userId
      createdAt
      updatedAt
      steps {
        id
        title
        description
        order
        isCompleted
        roadmapId
        createdAt
        updatedAt
      }
    }
  }
`;

const TOGGLE_STEP_COMPLETION = gql`
  mutation ToggleStepCompletion($stepId: Int!, $userId: Int!) {
    toggleStepCompletion(stepId: $stepId, userId: $userId) {
      id
      title
      description
      desktopId
      userId
      createdAt
      updatedAt
      steps {
        id
        title
        description
        order
        isCompleted
        roadmapId
        createdAt
        updatedAt
      }
    }
  }
`;

const REORDER_STEPS = gql`
  mutation ReorderSteps($roadmapId: Int!, $stepIds: [Int!]!, $userId: Int!) {
    reorderSteps(roadmapId: $roadmapId, stepIds: $stepIds, userId: $userId) {
      id
      title
      description
      desktopId
      userId
      createdAt
      updatedAt
      steps {
        id
        title
        description
        order
        isCompleted
        roadmapId
        createdAt
        updatedAt
      }
    }
  }
`;

// GraphQL API Service Class
class GraphQLApiService {
  private handleError(error: any): never {
    console.error('GraphQL API Error:', error);
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      throw new Error(error.graphQLErrors[0].message);
    }
    if (error.networkError) {
      throw new Error('Network error: Unable to connect to the server');
    }
    throw new Error(error.message || 'An unexpected error occurred');
  }

  // Auth API calls
  async createUser(auth0User: Auth0User): Promise<User> {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_OR_UPDATE_USER,
        variables: { auth0User }
      });
      return data.createOrUpdateUser;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createUserWithUsername(auth0User: Auth0User & { username: string }): Promise<User> {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_USER_WITH_USERNAME,
        variables: { createUserDto: auth0User }
      });
      return data.createUserWithCustomUsername;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getProfile(auth0Id: string): Promise<User | null> {
    try {
      const { data } = await client.query({
        query: GET_USER_PROFILE,
        variables: { auth0Id }
      });
      return data.userProfile;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Desktop API calls
  async getDesktops(userId: number): Promise<Desktop[]> {
    try {
      const { data } = await client.query({
        query: GET_DESKTOPS,
        variables: { userId }
      });
      return data.desktops;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDesktop(desktopId: number, userId: number): Promise<Desktop> {
    try {
      const { data } = await client.query({
        query: GET_DESKTOP,
        variables: { desktopId, userId }
      });
      return data.desktop;
    } catch (error) {
      this.handleError(error);
    }
  }

  async createDesktop(desktopData: { name: string; description?: string }, userId: number): Promise<Desktop> {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_DESKTOP,
        variables: { createDesktopInput: desktopData, userId }
      });
      return data.createDesktop;
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateDesktop(desktopId: number, desktopData: Partial<{ name: string; description: string }>, userId: number): Promise<Desktop> {
    const { data } = await client.mutate({
      mutation: UPDATE_DESKTOP,
      variables: { desktopId, updateDesktopInput: desktopData, userId }
    });
    return data.updateDesktop;
  }

  async deleteDesktop(desktopId: number, userId: number): Promise<{ message: string }> {
    const { data } = await client.mutate({
      mutation: DELETE_DESKTOP,
      variables: { desktopId, userId }
    });
    return { message: data.deleteDesktop };
  }

  // Note API calls
  async getNotes(userId: number, desktopId?: number, search?: string): Promise<Note[]> {
    const { data } = await client.query({
      query: GET_NOTES,
      variables: { userId, desktopId, search }
    });
    return data.notes;
  }

  async getNote(noteId: number, userId: number): Promise<Note> {
    const { data } = await client.query({
      query: GET_NOTE,
      variables: { id: noteId, userId }
    });
    return data.note;
  }

  async createNote(noteData: {
    title: string;
    content: string;
    desktopId: number;
    tags?: string[];
    isPinned?: boolean;
  }, userId: number): Promise<Note> {
    const { data } = await client.mutate({
      mutation: CREATE_NOTE,
      variables: { createNoteInput: noteData, userId }
    });
    return data.createNote;
  }

  async updateNote(noteId: number, noteData: Partial<{
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
  }>, userId: number): Promise<Note> {
    const { data } = await client.mutate({
      mutation: UPDATE_NOTE,
      variables: { id: noteId, updateNoteInput: noteData, userId }
    });
    return data.updateNote;
  }

  async toggleNotePin(noteId: number, userId: number): Promise<Note> {
    const { data } = await client.mutate({
      mutation: TOGGLE_NOTE_PIN,
      variables: { id: noteId, userId }
    });
    return data.toggleNotePin;
  }

  async transferNote(noteId: number, targetDesktopId: number, userId: number): Promise<Note> {
    const { data } = await client.mutate({
      mutation: TRANSFER_NOTE,
      variables: { id: noteId, targetDesktopId, userId }
    });
    return data.transferNote;
  }

  async searchNotes(userId: number, query: string): Promise<Note[]> {
    const { data } = await client.query({
      query: SEARCH_NOTES,
      variables: { userId, query }
    });
    return data.searchNotes;
  }

  async getNotesByTag(userId: number, tagName: string): Promise<Note[]> {
    const { data } = await client.query({
      query: GET_NOTES_BY_TAG,
      variables: { userId, tagName }
    });
    return data.notesByTag;
  }

  async deleteNote(noteId: number, userId: number): Promise<{ message: string }> {
    const { data } = await client.mutate({
      mutation: DELETE_NOTE,
      variables: { id: noteId, userId }
    });
    return { message: data.removeNote };
  }

  // Tag API calls
  async getAllTags(): Promise<Tag[]> {
    const { data } = await client.query({
      query: GET_ALL_TAGS
    });
    return data.tags;
  }

  async getPopularTags(limit: number = 10): Promise<Tag[]> {
    const { data } = await client.query({
      query: GET_POPULAR_TAGS,
      variables: { limit }
    });
    return data.popularTags;
  }

  async searchTags(query: string): Promise<Tag[]> {
    const { data } = await client.query({
      query: SEARCH_TAGS,
      variables: { query }
    });
    return data.searchTags;
  }

  async getTag(tagId: number): Promise<Tag> {
    const { data } = await client.query({
      query: GET_TAG,
      variables: { id: tagId }
    });
    return data.tag;
  }

  async createTag(tagData: { name: string; color?: string }): Promise<Tag> {
    const { data } = await client.mutate({
      mutation: CREATE_TAG,
      variables: { createTagInput: tagData }
    });
    return data.createTag;
  }

  async updateTag(tagId: number, tagData: Partial<{ name: string; color: string }>): Promise<Tag> {
    const { data } = await client.mutate({
      mutation: UPDATE_TAG,
      variables: { id: tagId, updateTagInput: tagData }
    });
    return data.updateTag;
  }

  async deleteTag(tagId: number): Promise<{ message: string }> {
    const { data } = await client.mutate({
      mutation: DELETE_TAG,
      variables: { id: tagId }
    });
    return { message: data.removeTag };
  }

  // Settings API calls
  async getUserSettings(userId: number): Promise<UserSettings> {
    const { data } = await client.query({
      query: GET_USER_SETTINGS,
      variables: { userId }
    });
    return data.userSettings;
  }

  async updateUserSettings(userId: number, settingsData: { preferredTheme?: string; desktopBackground?: string }): Promise<UserSettings> {
    const { data } = await client.mutate({
      mutation: UPDATE_USER_SETTINGS,
      variables: { userId, updateSettingsInput: settingsData }
    });
    return data.updateUserSettings;
  }

  async getPreferredTheme(userId: number): Promise<string> {
    const { data } = await client.query({
      query: GET_PREFERRED_THEME,
      variables: { userId }
    });
    return data.preferredTheme;
  }

  async getDesktopBackground(userId: number): Promise<string | null> {
    const { data } = await client.query({
      query: GET_DESKTOP_BACKGROUND,
      variables: { userId }
    });
    return data.desktopBackground;
  }

  // Roadmap API calls
  async getRoadmaps(userId: number, desktopId?: number): Promise<Roadmap[]> {
    const { data } = await client.query({
      query: GET_ROADMAPS,
      variables: { userId, desktopId }
    });
    return data.roadmaps;
  }

  async getRoadmap(roadmapId: number, userId: number): Promise<Roadmap> {
    const { data } = await client.query({
      query: GET_ROADMAP,
      variables: { roadmapId, userId }
    });
    return data.roadmap;
  }

  async createRoadmap(roadmapData: {
    title: string;
    description?: string;
    steps: Array<{
      title: string;
      description?: string;
      order: number;
      isCompleted?: boolean;
    }>;
  }, userId: number, desktopId: number): Promise<Roadmap> {
    const { data } = await client.mutate({
      mutation: CREATE_ROADMAP,
      variables: { 
        createRoadmapInput: { ...roadmapData, desktopId }, 
        userId 
      }
    });
    return data.createRoadmap;
  }

  async updateRoadmap(roadmapId: number, roadmapData: Partial<{
    title: string;
    description: string;
    steps: Array<{
      title: string;
      description?: string;
      order: number;
      isCompleted?: boolean;
    }>;
  }>, userId: number): Promise<Roadmap> {
    const { data } = await client.mutate({
      mutation: UPDATE_ROADMAP,
      variables: { roadmapId, updateRoadmapInput: roadmapData, userId }
    });
    return data.updateRoadmap;
  }

  async deleteRoadmap(roadmapId: number, userId: number): Promise<{ message: string }> {
    const { data } = await client.mutate({
      mutation: DELETE_ROADMAP,
      variables: { roadmapId, userId }
    });
    return { message: data.deleteRoadmap };
  }

  async transferRoadmap(roadmapId: number, targetDesktopId: number, userId: number): Promise<Roadmap> {
    const { data } = await client.mutate({
      mutation: TRANSFER_ROADMAP,
      variables: { roadmapId, targetDesktopId, userId }
    });
    return data.transferRoadmap;
  }

  async updateRoadmapStep(stepId: number, stepData: Partial<{
    title: string;
    description: string;
    order: number;
    isCompleted: boolean;
  }>, userId: number): Promise<Roadmap> {
    const { data } = await client.mutate({
      mutation: UPDATE_ROADMAP_STEP,
      variables: { stepId, updateStepDto: stepData, userId }
    });
    return data.updateRoadmapStep;
  }

  async toggleStepCompletion(stepId: number, userId: number): Promise<Roadmap> {
    const { data } = await client.mutate({
      mutation: TOGGLE_STEP_COMPLETION,
      variables: { stepId, userId }
    });
    return data.toggleStepCompletion;
  }

  async reorderSteps(roadmapId: number, stepIds: number[], userId: number): Promise<Roadmap> {
    const { data } = await client.mutate({
      mutation: REORDER_STEPS,
      variables: { roadmapId, stepIds, userId }
    });
    return data.reorderSteps;
  }
}

export const graphqlApiService = new GraphQLApiService(); 