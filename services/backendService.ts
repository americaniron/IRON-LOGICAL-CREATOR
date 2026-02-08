import { UserAccount, AccessRequest, UserSession, Asset, Message, Task } from '../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Token management
const TOKEN_KEY = 'im_auth_token';

const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

const clearAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// API request wrapper with authentication
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// --- AUTHENTICATION API ---

export const checkSession = async (): Promise<UserSession | null> => {
  try {
    const data = await apiRequest<{ valid: boolean; session?: UserSession }>('/auth/session');
    return data.valid && data.session ? { ...data.session, token: getAuthToken()! } : null;
  } catch (error) {
    clearAuthToken();
    return null;
  }
};

export const login = async (pin: string): Promise<{ success: boolean; session?: UserSession; message?: string }> => {
  try {
    const data = await apiRequest<{ success: boolean; session?: UserSession; message?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });

    if (data.success && data.session) {
      setAuthToken(data.session.token);
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Login failed',
    };
  }
};

export const logout = async (): Promise<void> => {
  clearAuthToken();
};

export const submitAccessRequest = async (name: string, reason: string): Promise<void> => {
  await apiRequest('/auth/request-access', {
    method: 'POST',
    body: JSON.stringify({ name, reason }),
  });
};

export const checkRequestStatusByName = async (name: string): Promise<AccessRequest | undefined> => {
  try {
    const data = await apiRequest<{ found: boolean; request?: any }>(`/auth/request-status/${encodeURIComponent(name)}`);
    
    if (!data.found || !data.request) {
      return undefined;
    }

    return {
      id: data.request.id,
      name: data.request.name,
      reason: data.request.reason,
      status: data.request.status,
      timestamp: data.request.timestamp,
      generatedPin: data.request.generatedPin,
    };
  } catch (error) {
    return undefined;
  }
};

// --- RESOURCE MANAGEMENT (CREDITS) ---

export const deductCredits = async (amount: number): Promise<boolean> => {
  try {
    const data = await apiRequest<{ success: boolean }>('/user/deduct-credits', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    return data.success;
  } catch (error) {
    console.error('Failed to deduct credits:', error);
    return false;
  }
};

export const addCreditsToUser = async (userId: string, amount: number): Promise<void> => {
  await apiRequest('/admin/allocate-credits', {
    method: 'POST',
    body: JSON.stringify({ userId, amount }),
  });
};

// --- ADMIN & ACCESS REQUEST API ---

export const getAccessRequests = async (): Promise<AccessRequest[]> => {
  try {
    const requests = await apiRequest<any[]>('/admin/requests');
    return requests.map(r => ({
      id: r.id,
      name: r.name,
      reason: r.reason,
      status: r.status,
      timestamp: new Date(r.created_at).getTime(),
      generatedPin: r.generated_pin,
    }));
  } catch (error) {
    console.error('Failed to get access requests:', error);
    return [];
  }
};

export const getAllUsers = async (): Promise<UserAccount[]> => {
  try {
    const users = await apiRequest<any[]>('/admin/users');
    return users.map(u => ({
      id: u.id,
      name: u.name,
      pin: '', // Never sent from backend
      role: u.role,
      credits: u.credits,
      plan: u.plan,
      joinedAt: u.joinedAt,
    }));
  } catch (error) {
    console.error('Failed to get users:', error);
    return [];
  }
};

export const approveRequest = async (id: string): Promise<void> => {
  await apiRequest(`/admin/approve-request/${id}`, {
    method: 'POST',
  });
};

export const denyRequest = async (id: string): Promise<void> => {
  await apiRequest(`/admin/deny-request/${id}`, {
    method: 'POST',
  });
};

// --- USER DATA API ---

export const getAssets = async (): Promise<Asset[]> => {
  try {
    const assets = await apiRequest<any[]>('/user/assets');
    return assets.map(a => ({
      id: a.id,
      url: a.url,
      type: a.type,
      prompt: a.prompt,
      provider: a.provider,
      timestamp: new Date(a.created_at).getTime(),
    }));
  } catch (error) {
    console.error('Failed to get assets:', error);
    return [];
  }
};

export const addAsset = async (assetData: Omit<Asset, 'id' | 'timestamp'>): Promise<Asset> => {
  const data = await apiRequest<any>('/user/assets', {
    method: 'POST',
    body: JSON.stringify(assetData),
  });

  return {
    id: data.id,
    url: data.url,
    type: data.type,
    prompt: data.prompt,
    provider: data.provider,
    timestamp: new Date(data.created_at).getTime(),
  };
};

export const removeAsset = async (assetId: string): Promise<void> => {
  await apiRequest(`/user/assets/${assetId}`, {
    method: 'DELETE',
  });
};

export const getChatHistories = async (): Promise<Record<Task, Message[]>> => {
  try {
    const histories = await apiRequest<Record<string, any[]>>('/user/chats');
    
    // Convert backend format to frontend format
    const result: Record<Task, Message[]> = {} as Record<Task, Message[]>;
    
    // Initialize with default messages for chat tasks
    const defaultMessages: Record<Task.Chat | Task.OpenAIChat | Task.GrokChat, Message[]> = {
      [Task.Chat]: [{ id: '1', text: "IRON MEDIA ORCHESTRATOR ONLINE. STANDBY FOR COMMANDS.", sender: 'bot' }],
      [Task.OpenAIChat]: [{ id: '1', text: "GPT_GUEST_LINK ESTABLISHED.", sender: 'bot' }],
      [Task.GrokChat]: [{ id: '1', text: "GROK_CONDUIT HOT. MISSION READY.", sender: 'bot' }],
    };

    // Initialize all tasks
    for (const task of Object.values(Task)) {
      result[task] = [];
    }

    // Add messages from backend
    for (const [taskType, messages] of Object.entries(histories)) {
      if (messages && Array.isArray(messages)) {
        result[taskType as Task] = messages.map(m => ({
          id: m.message_id,
          text: m.text,
          sender: m.sender,
        }));
      }
    }

    // Apply default messages for chat tasks if empty
    if (result[Task.Chat].length === 0) {
      result[Task.Chat] = defaultMessages[Task.Chat];
    }
    if (result[Task.OpenAIChat].length === 0) {
      result[Task.OpenAIChat] = defaultMessages[Task.OpenAIChat];
    }
    if (result[Task.GrokChat].length === 0) {
      result[Task.GrokChat] = defaultMessages[Task.GrokChat];
    }

    return result;
  } catch (error) {
    console.error('Failed to get chat histories:', error);
    
    // Return default structure
    const defaultHistories: Record<Task, Message[]> = {} as Record<Task, Message[]>;
    for (const task of Object.values(Task)) {
      defaultHistories[task] = [];
    }
    
    defaultHistories[Task.Chat] = [{ id: '1', text: "IRON MEDIA ORCHESTRATOR ONLINE. STANDBY FOR COMMANDS.", sender: 'bot' }];
    defaultHistories[Task.OpenAIChat] = [{ id: '1', text: "GPT_GUEST_LINK ESTABLISHED.", sender: 'bot' }];
    defaultHistories[Task.GrokChat] = [{ id: '1', text: "GROK_CONDUIT HOT. MISSION READY.", sender: 'bot' }];
    
    return defaultHistories;
  }
};

export const addMessage = async (task: Task.Chat | Task.OpenAIChat | Task.GrokChat, message: Message): Promise<Message[]> => {
  await apiRequest(`/user/chats/${task}`, {
    method: 'POST',
    body: JSON.stringify({
      messageId: message.id,
      text: message.text,
      sender: message.sender,
    }),
  });

  // Return updated history
  const histories = await getChatHistories();
  return histories[task] || [];
};

export const getSession = (): UserSession | null => {
  // Token exists but session needs to be validated with checkSession()
  // This function is kept for compatibility but returns null
  // Use checkSession() instead for actual session validation
  return null;
};
