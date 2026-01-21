import { UserAccount, AccessRequest, UserSession, Asset, Message, Task } from '../types';
import { ApiProvider } from '../hooks/useApiKeyManager';

// --- MOCK DATABASE ---
// In a real application, this would be a remote database.
// We use localStorage to simulate persistence across page reloads.

const db = {
  users: (): UserAccount[] => JSON.parse(localStorage.getItem('im_db_users') || '[]'),
  requests: (): AccessRequest[] => JSON.parse(localStorage.getItem('im_db_requests') || '[]'),
  assets: (userId: string): Asset[] => JSON.parse(localStorage.getItem(`im_db_assets_${userId}`) || '[]'),
  chats: (userId: string): Record<Task, Message[]> => JSON.parse(localStorage.getItem(`im_db_chats_${userId}`) || '{}'),
  apiKeys: (userId: string): Partial<Record<ApiProvider, string>> => JSON.parse(localStorage.getItem(`im_db_apikeys_${userId}`) || '{}'),

  saveUsers: (users: UserAccount[]) => localStorage.setItem('im_db_users', JSON.stringify(users)),
  saveRequests: (requests: AccessRequest[]) => localStorage.setItem('im_db_requests', JSON.stringify(requests)),
  saveAssets: (userId: string, assets: Asset[]) => localStorage.setItem(`im_db_assets_${userId}`, JSON.stringify(assets)),
  saveChats: (userId: string, chats: Record<Task, Message[]>) => localStorage.setItem(`im_db_chats_${userId}`, JSON.stringify(chats)),
  saveApiKeys: (userId: string, keys: Partial<Record<ApiProvider, string>>) => localStorage.setItem(`im_db_apikeys_${userId}`, JSON.stringify(keys)),
};

// Seed admin user if it doesn't exist
const seedAdmin = () => {  
  const users = db.users();
  if (!users.some(u => u.role === 'admin')) {
    users.push({ id: 'admin_001', name: 'COMMANDER', pin: '01970', role: 'admin' });
    db.saveUsers(users);
  }
};
seedAdmin();


// --- MOCK SESSION MANAGEMENT ---
// In a real app, JWT would be httpOnly cookies. We use sessionStorage.
const SESSION_KEY = 'im_session';

const createSession = (user: UserAccount): UserSession => {
    // This is a fake token for demonstration purposes.
    const token = `jwt_token_${user.id}_${Date.now()}`;
    const session: UserSession = { id: user.id, name: user.name, role: user.role, token };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
};

const getSession = (): UserSession | null => {
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
};

const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEY);
};

// --- AUTHENTICATION API ---
export const checkSession = async (): Promise<UserSession | null> => {
    await new Promise(res => setTimeout(res, 300)); // Simulate network latency
    return getSession();
};

export const login = async (pin: string): Promise<{ success: boolean; session?: UserSession, message?: string }> => {
    await new Promise(res => setTimeout(res, 500));
    const users = db.users();
    const user = users.find(u => u.pin === pin);

    if (user) {
        const session = createSession(user);
        return { success: true, session };
    }
    return { success: false, message: 'INVALID CREDENTIALS' };
};

export const logout = async (): Promise<void> => {
    clearSession();
};


// --- ADMIN & ACCESS REQUEST API ---
export const getAccessRequests = async (): Promise<AccessRequest[]> => {
    const session = getSession();
    if (session?.role !== 'admin') return [];
    return db.requests();
};

export const submitAccessRequest = async (name: string, reason: string): Promise<void> => {
    const requests = db.requests();
    const newRequest: AccessRequest = { id: `req_${Date.now()}`, name, reason, timestamp: Date.now(), status: 'pending' };
    db.saveRequests([...requests, newRequest]);
};

export const approveRequest = async (id: string): Promise<void> => {
    const session = getSession();
    if (session?.role !== 'admin') throw new Error("Unauthorized");

    const requests = db.requests();
    const users = db.users();
    const requestIndex = requests.findIndex(r => r.id === id);

    if (requestIndex > -1) {
        let newPin = Math.floor(10000 + Math.random() * 90000).toString();
        while (users.some(u => u.pin === newPin) || newPin === '01970') {
            newPin = Math.floor(10000 + Math.random() * 90000).toString();
        }
        
        const req = requests[requestIndex];
        const newUser: UserAccount = { id: `user_${Date.now()}`, name: req.name, pin: newPin, role: 'user' };
        
        db.saveUsers([...users, newUser]);
        
        req.status = 'approved';
        req.generatedPin = newPin;
        db.saveRequests(requests);
    }
};

export const denyRequest = async (id: string): Promise<void> => {
    const session = getSession();
    if (session?.role !== 'admin') throw new Error("Unauthorized");
    
    const requests = db.requests();
    const request = requests.find(r => r.id === id);
    if (request) {
        request.status = 'denied';
        db.saveRequests(requests);
    }
};

// --- API KEY MANAGEMENT ---
export const saveApiKey = async (provider: ApiProvider, key: string): Promise<void> => {
    const session = getSession();
    if (!session) throw new Error("Not authenticated");
    
    const userKeys = db.apiKeys(session.id);
    userKeys[provider] = key;
    db.saveApiKeys(session.id, userKeys);
};

export const hasApiKey = async (provider: ApiProvider): Promise<boolean> => {
    const session = getSession();
    if (!session) return false;
    
    const userKeys = db.apiKeys(session.id);
    return !!userKeys[provider];
};

export const getApiKey = async (provider: ApiProvider): Promise<string | null> => {
    const session = getSession();
    if (!session) return null;
    const userKeys = db.apiKeys(session.id);
    return userKeys[provider] || null;
}

export const clearApiKey = (provider: ApiProvider): void => {
    const session = getSession();
    if (!session) return;
    const userKeys = db.apiKeys(session.id);
    delete userKeys[provider];
    db.saveApiKeys(session.id, userKeys);
}


// --- USER DATA API ---
export const getAssets = async (): Promise<Asset[]> => {
    const session = getSession();
    if (!session) return [];
    return db.assets(session.id);
};

export const addAsset = async (assetData: Omit<Asset, 'id' | 'timestamp'>): Promise<Asset> => {
    const session = getSession();
    if (!session) throw new Error("Not authenticated");

    const userAssets = db.assets(session.id);
    const newAsset: Asset = {
        ...assetData,
        id: `${assetData.provider.toLowerCase()}_${assetData.type}_${Date.now()}`,
        timestamp: Date.now(),
    };
    db.saveAssets(session.id, [newAsset, ...userAssets]);
    return newAsset;
};

export const removeAsset = async (assetId: string): Promise<void> => {
    const session = getSession();
    if (!session) throw new Error("Not authenticated");

    const userAssets = db.assets(session.id);
    db.saveAssets(session.id, userAssets.filter(a => a.id !== assetId));
};

export const getChatHistories = async (): Promise<Record<Task, Message[]>> => {
    const session = getSession();
    if (!session) return {} as Record<Task, Message[]>;
    
    const histories = db.chats(session.id);
    // Ensure default histories exist
    const defaultHistories: Record<Task.Chat | Task.OpenAIChat | Task.GrokChat, Message[]> = {
        [Task.Chat]: [{ id: '1', text: "OPERATIONS ONLINE. STATE YOUR FABRICATION REQUIREMENTS.", sender: 'bot' }],
        [Task.OpenAIChat]: [{ id: '1', text: "GUEST SYSTEM ONLINE. GPT-CLASS MODEL READY.", sender: 'bot' }],
        [Task.GrokChat]: [{ id: '1', text: "GROK_CONDUIT ACTIVE. WHAT'S THE MISSION?", sender: 'bot' }]
    };

    // Initialize all possible tasks with empty arrays to conform to the type.
    const fullHistory = Object.fromEntries(
        Object.values(Task).map(task => [task, []])
    ) as Record<Task, Message[]>;

    return {
        ...fullHistory, // Ensures all keys from the Task enum are present
        ...histories, // Overwrites with persisted histories
        // Ensures defaults are present if no history exists for these specific chats
        [Task.Chat]: histories[Task.Chat] || defaultHistories[Task.Chat],
        [Task.OpenAIChat]: histories[Task.OpenAIChat] || defaultHistories[Task.OpenAIChat],
        [Task.GrokChat]: histories[Task.GrokChat] || defaultHistories[Task.GrokChat],
    };
};

export const addMessage = async (task: Task.Chat | Task.OpenAIChat | Task.GrokChat, message: Message): Promise<Message[]> => {
    const session = getSession();
    if (!session) throw new Error("Not authenticated");

    const userChats = await getChatHistories();
    const history = userChats[task] || [];
    
    // Filter out any existing "typing" indicators before adding the new message.
    const updatedHistory = history.filter(m => !m.isTyping);
    updatedHistory.push(message);

    userChats[task] = updatedHistory;
    db.saveChats(session.id, userChats);
    return updatedHistory;
};