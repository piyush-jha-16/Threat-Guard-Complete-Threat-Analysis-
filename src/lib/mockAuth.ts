// Mock authentication for local development
// Replace this with real Supabase auth when credentials are configured

interface MockUser {
    id: string;
    email: string;
    name: string;
    created_at: string;
}

interface AuthResult {
    user: MockUser | null;
    error: { message: string } | null;
}

const STORAGE_KEY = 'tg_mock_users';
const SESSION_KEY = 'tg_session';

// Get all mock users from localStorage
function getMockUsers(): Map<string, MockUser & { password: string }> {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return new Map();
    try {
        const users = JSON.parse(data);
        return new Map(Object.entries(users) as [string, any][]);
    } catch {
        return new Map();
    }
}

// Save mock users to localStorage
function saveMockUsers(users: Map<string, MockUser & { password: string }>) {
    const obj = Object.fromEntries(users);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

// Get current session
function getSession() {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
}

// Set session
function setSession(user: MockUser) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

// Clear session
function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

export function mockSignUp(email: string, password: string, fullName: string): AuthResult {
    const users = getMockUsers();
    
    if (users.has(email)) {
        return {
            user: null,
            error: { message: "User with this email already exists" }
        };
    }

    if (password.length < 6) {
        return {
            user: null,
            error: { message: "Password must be at least 6 characters" }
        };
    }

    const newUser = {
        id: `user_${Date.now()}`,
        email,
        name: fullName,
        created_at: new Date().toISOString(),
        password // Store password (NOT SECURE - for development only)
    };

    users.set(email, newUser);
    saveMockUsers(users);

    return {
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            created_at: newUser.created_at
        },
        error: null
    };
}

export function mockLogin(email: string, password: string): AuthResult {
    const users = getMockUsers();
    const user = users.get(email);

    if (!user) {
        return {
            user: null,
            error: { message: "Invalid email or password" }
        };
    }

    if (user.password !== password) {
        return {
            user: null,
            error: { message: "Invalid email or password" }
        };
    }

    const { password: _, ...userWithoutPassword } = user;
    setSession(userWithoutPassword);

    return {
        user: userWithoutPassword,
        error: null
    };
}

export function mockLogout() {
    clearSession();
}

export function getMockCurrentUser(): MockUser | null {
    return getSession();
}

export function updateMockUser(updates: { name?: string; password?: string }): AuthResult {
    const session = getSession();
    if (!session) return { user: null, error: { message: "Not logged in" } };

    const users = getMockUsers();
    const user = users.get(session.email);
    if (!user) return { user: null, error: { message: "User not found" } };

    if (updates.name !== undefined) {
        user.name = updates.name;
        session.name = updates.name;
    }
    if (updates.password !== undefined) {
        user.password = updates.password;
    }

    users.set(session.email, user);
    saveMockUsers(users);
    setSession(session);

    return { user: session, error: null };
}
