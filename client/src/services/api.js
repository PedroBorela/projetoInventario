import { v4 as uuidv4 } from 'uuid';

// Helper to simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to get data from localStorage
const getDb = () => {
    const db = localStorage.getItem('inventario_db');
    if (!db) {
        const initialDb = {
            processo: [],
            bens: [],
            herdeiros: [],
            dividas: []
        };
        localStorage.setItem('inventario_db', JSON.stringify(initialDb));
        return initialDb;
    }
    return JSON.parse(db);
};

// Helper to save data to localStorage
const saveDb = (data) => {
    localStorage.setItem('inventario_db', JSON.stringify(data));
};

const api = {
    get: async (url) => {
        await delay(300); // Simulate latency
        const db = getDb();

        // Parse URL and Query Params
        const [path, queryString] = url.split('?');
        const resource = path.replace('/', '');
        const queryParams = new URLSearchParams(queryString);

        // Handle single item fetch (e.g., /processo/123)
        const pathParts = resource.split('/');
        if (pathParts.length > 1) {
            const collectionName = pathParts[0];
            const id = pathParts[1];
            const item = db[collectionName]?.find(i => i.id === id);
            if (item) return { data: item };
            throw new Error('Not Found');
        }

        // Handle collection fetch (e.g., /bens?processoId=123)
        let data = db[resource] || [];

        // Filter by query params
        queryParams.forEach((value, key) => {
            data = data.filter(item => String(item[key]) === String(value));
        });

        return { data };
    },

    post: async (url, payload) => {
        await delay(300);
        const db = getDb();
        const resource = url.replace('/', '');

        const newItem = { ...payload, id: uuidv4() };

        if (!db[resource]) db[resource] = [];
        db[resource].push(newItem);

        saveDb(db);
        return { data: newItem };
    },

    put: async (url, payload) => {
        await delay(300);
        const db = getDb();

        // Extract ID and Resource from URL (e.g., /processo/123)
        const pathParts = url.split('/');
        const resource = pathParts[1]; // 'processo'
        const id = pathParts[2];       // '123'

        if (!db[resource]) throw new Error('Collection not found');

        const index = db[resource].findIndex(item => item.id === id);
        if (index === -1) throw new Error('Item not found');

        db[resource][index] = { ...db[resource][index], ...payload };
        saveDb(db);

        return { data: db[resource][index] };
    },

    delete: async (url) => {
        await delay(300);
        const db = getDb();

        const pathParts = url.split('/');
        const resource = pathParts[1];
        const id = pathParts[2];

        if (!db[resource]) throw new Error('Collection not found');

        const initialLength = db[resource].length;
        db[resource] = db[resource].filter(item => item.id !== id);

        if (db[resource].length === initialLength) throw new Error('Item not found');

        saveDb(db);
        return { data: { success: true } };
    }
};

export default api;
