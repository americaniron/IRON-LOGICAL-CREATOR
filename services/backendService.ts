import { UserAccount, AccessRequest, UserSession, Asset, Message, Task, FABRICATION_COSTS } from '../types';
import { ApiProvider } from '../hooks/useApiKeyManager';

// --- INDUSTRIAL DATABASE (SIMULATED) ---
const db = {
  users: (): UserAccount[] => JSON.parse(localStorage.getItem('im_db_users') || '[]'),
  requests: (): AccessRequest[] => JSON.parse(localStorage.getItem('im_db_requests') || '[]'),
  assets: (userId: string): Asset[] => JSON.parse(localStorage.getItem(`im_db_assets_${userId}`) || '[]'),
  chats: (userId: string): Record<Task, Message[]> => JSON.parse(localStorage.getItem(`im_db_chats_${userId}`) || '{}'),

  saveUsers: (users: UserAccount[]) => localStorage.setItem('im_db_users', JSON.stringify(users)),
  saveRequests: (requests: AccessRequest[]) => localStorage.setItem('im_db_requests', JSON.stringify(requests)),
  saveAssets: (userId: string, assets: Asset[]) => localStorage.setItem(`im_db_assets_${userId}`, JSON.stringify(assets)),
  saveChats: (userId: string, chats: Record<Task, Message[]>) => localStorage.setItem(`im_db_chats_${userId}`, JSON.stringify(chats)),
};

// Seed initial system admin with an integrity check on every boot.
const seedSystem = () => {  
  const users = db.users();
  const adminUser = users.find(u => u.id === 'admin_001' && u.role === 'admin');

  if (adminUser) {
    // If the admin user exists but the PIN is incorrect, reset it.
    // This ensures the default admin PIN is always available and corrects corruption.
    if (adminUser.pin !== '01970') {
        adminUser.pin = '01970';
        console.warn("IRON MEDIA ORCHESTRATOR :: Admin PIN integrity compromised. Resetting to default.");
        db.saveUsers(users);
    }
  } else {
    // If no admin user exists, create one. This handles initial setup or a cleared database.
    // Filter out any potential non-admin user with the same ID to prevent duplicates.
    const otherUsers = users.filter(u => u.id !== 'admin_001');
    otherUsers.push({ 
        id: 'admin_001', 
        name: 'COMMANDER_Z', 
        pin: '01970', 
        role: 'admin', 
        credits: 999999, 
        plan: 'commander',
        joinedAt: Date.now() 
    });
    db.saveUsers(otherUsers);
    console.log("IRON MEDIA ORCHESTRATOR :: Default admin credentials seeded.");
  }
};
seedSystem();

// Using localStorage for SESSION_KEY ensures the operative stays logged in
// even after the browser is closed, facilitating frequent usage.
const SESSION_KEY = 'im_persistent_session_token';

// --- CORE UTILITIES ---

export const getSession = (): UserSession | null => {
    const sessionData = localStorage.getItem(SESSION_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
};

const updateStoredUser = (updatedUser: UserAccount) => {
    const users = db.users();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
        users[index] = updatedUser;
        db.saveUsers(users);
    }
};

// --- AUTHENTICATION API ---

export const checkSession = async (): Promise<UserSession | null> => {
    await new Promise(res => setTimeout(res, 200));
    const session = getSession();
    if (!session) return null;
    
    // Refresh user data from DB to ensure credits are up to date
    const users = db.users();
    const user = users.find(u => u.id === session.id);
    if (!user) return null;
    
    return { ...session, credits: user.credits, plan: user.plan };
};

export const login = async (pin: string): Promise<{ success: boolean; session?: UserSession, message?: string }> => {
    await new Promise(res => setTimeout(res, 800));
    const users = db.users();
    const user = users.find(u => u.pin === pin);

    if (user) {
        const token = `im_jwt_${user.id}_${Math.random().toString(36).substring(7)}`;
        const session: UserSession = { 
            id: user.id, 
            name: user.name, 
            role: user.role, 
            credits: user.credits,
            plan: user.plan,
            joinedAt: user.joinedAt,
            token 
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { success: true, session };
    }
    return { success: false, message: 'CREDENTIAL_FAILURE: ACCESS_DENIED' };
};

export const logout = async (): Promise<void> => {
    localStorage.removeItem(SESSION_KEY);
};

// --- RESOURCE MANAGEMENT (CREDITS) ---

export const deductCredits = async (amount: number): Promise<boolean> => {
    const session = getSession();
    if (!session) return false;
    
    const users = db.users();
    const user = users.find(u => u.id === session.id);
    
    if (user && user.credits >= amount) {
        user.credits -= amount;
        updateStoredUser(user);
        
        // Update session to reflect new balance
        const updatedSession = { ...session, credits: user.credits };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
        return true;
    }
    return false;
};

export const addCreditsToUser = async (userId: string, amount: number): Promise<void> => {
    const session = getSession();
    if (session?.role !== 'admin') throw new Error("INSUFFICIENT_CLEARANCE");
    
    const users = db.users();
    const user = users.find(u => u.id === userId);
    if (user) {
        user.credits += amount;
        updateStoredUser(user);
    }
};

// --- ADMIN & ACCESS REQUEST API ---

export const getAccessRequests = async (): Promise<AccessRequest[]> => {
    const session = getSession();
    if (session?.role !== 'admin') return [];
    return db.requests();
};

export const getAllUsers = async (): Promise<UserAccount[]> => {
    const session = getSession();
    if (session?.role !== 'admin') return [];
    return db.users();
};

export const submitAccessRequest = async (name: string, reason: string): Promise<void> => {
    const requests = db.requests();
    const newRequest: AccessRequest = { id: `req_${Date.now()}`, name, reason, timestamp: Date.now(), status: 'pending' };
    db.saveRequests([...requests, newRequest]);
};

export const checkRequestStatusByName = async (name: string): Promise<AccessRequest | undefined> => {
    await new Promise(res => setTimeout(res, 600)); // Simulate network delay
    const requests = db.requests();
    const userRequests = requests.filter(r => r.name.toLowerCase() === name.toLowerCase());
    
    // Prioritize showing an approved request so the user can always get their PIN.
    const approvedRequest = userRequests.find(r => r.status === 'approved');
    if (approvedRequest) {
        return approvedRequest;
    }
    
    // Otherwise, show the most recent request.
    if (userRequests.length > 0) {
        return userRequests.sort((a, b) => b.timestamp - a.timestamp)[0];
    }

    return undefined;
};

export const approveRequest = async (id: string): Promise<void> => {
    const session = getSession();
    if (session?.role !== 'admin') throw new Error("Unauthorized");

    const requests = db.requests();
    const users = db.users();
    const requestIndex = requests.findIndex(r => r.id === id);

    if (requestIndex > -1) {
        let newPin = Math.floor(10000 + Math.random() * 90000).toString();
        while (users.some(u => u.pin === newPin)) {
            newPin = Math.floor(10000 + Math.random() * 90000).toString();
        }
        
        const req = requests[requestIndex];
        const newUser: UserAccount = { 
            id: `user_${Date.now()}`, 
            name: req.name, 
            pin: newPin, 
            role: 'user',
            credits: 500, // Initial balance
            plan: 'basic',
            joinedAt: Date.now()
        };
        
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
    const defaultHistories: Record<Task.Chat | Task.OpenAIChat | Task.GrokChat, Message[]> = {
        [Task.Chat]: [{ id: '1', text: "IRON MEDIA ORCHESTRATOR ONLINE. STANDBY FOR COMMANDS.", sender: 'bot' }],
        [Task.OpenAIChat]: [{ id: '1', text: "GPT_GUEST_LINK ESTABLISHED.", sender: 'bot' }],
        [Task.GrokChat]: [{ id: '1', text: "GROK_CONDUIT HOT. MISSION READY.", sender: 'bot' }]
    };

    const fullHistory = Object.fromEntries(
        Object.values(Task).map(task => [task, []])
    ) as Record<Task, Message[]>;

    return {
        ...fullHistory,
        ...histories,
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
    
    const updatedHistory = history.filter(m => !m.isTyping);
    updatedHistory.push(message);

    userChats[task] = updatedHistory;
    db.saveChats(session.id, userChats);
    return updatedHistory;
};
