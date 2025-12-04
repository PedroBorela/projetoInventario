const jsonServer = require('json-server');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const SECRET_KEY = '123456789'; // In a real app, use env var
const EXPIRES_IN = '1h';

server.use(jsonServer.bodyParser);
server.use(middlewares);

// Create a token from a payload 
function createToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
}

// Verify the token 
function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return err;
    }
}

// Check if the user exists in database
function isAuthenticated({ email, password }) {
    const userdb = router.db.get('users').value();
    return userdb.findIndex(user => user.email === email && user.password === password) !== -1;
}

// Register New User
server.post('/auth/register', (req, res) => {
    const { email, password, name } = req.body;

    if (isAuthenticated({ email, password })) {
        const status = 401;
        const message = 'Email already exists';
        res.status(status).json({ status, message });
        return;
    }

    const userdb = router.db.get('users').value();
    const id = userdb.length > 0 ? Math.max(...userdb.map(u => u.id)) + 1 : 1;

    const newUser = { id, email, password, name };
    router.db.get('users').push(newUser).write();

    const access_token = createToken({ email, id });
    res.status(200).json({ access_token, user: { id, email, name } });
});

// Login User
server.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!isAuthenticated({ email, password })) {
        const status = 401;
        const message = 'Incorrect email or password';
        res.status(status).json({ status, message });
        return;
    }

    const userdb = router.db.get('users').value();
    const user = userdb.find(u => u.email === email && u.password === password);

    const access_token = createToken({ email, id: user.id });
    res.status(200).json({ access_token, user: { id: user.id, email: user.email, name: user.name } });
});

// Middleware to check auth
server.use(/^(?!\/auth).*$/, (req, res, next) => {
    if (req.headers.authorization === undefined || req.headers.authorization.split(' ')[0] !== 'Bearer') {
        const status = 401;
        const message = 'Error in authorization format';
        res.status(status).json({ status, message });
        return;
    }
    try {
        let verifyTokenResult;
        verifyTokenResult = verifyToken(req.headers.authorization.split(' ')[1]);

        if (verifyTokenResult instanceof Error) {
            const status = 401;
            const message = 'Access token not provided or invalid';
            res.status(status).json({ status, message });
            return;
        }

        // Inject userId into request for further processing
        req.userId = verifyTokenResult.id;
        console.log(`[Auth] User ID: ${req.userId}, Method: ${req.method}, Path: ${req.path}`);

        // If it's a POST request to /processo, add userId
        if (req.method === 'POST' && (req.path === '/processo' || req.path === '/processo/')) {
            req.body.userId = req.userId;
            console.log(`[Auth] Creating process for userId: ${req.body.userId}`);
        }

        next();
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        const status = 401;
        const message = 'Error access_token is revoked';
        res.status(status).json({ status, message });
    }
});

// Custom GET route for listing processes (Strict Isolation)
server.get('/processo', (req, res) => {
    const userId = req.userId;
    const db = router.db;

    // Filter processes by userId
    const userProcesses = db.get('processo').value().filter(p => p.userId === userId);

    res.json(userProcesses);
});

// Custom GET route for single process (Strict Ownership Check)
server.get('/processo/:id', (req, res) => {
    const id = req.params.id;
    const userId = req.userId;
    const db = router.db;

    const processo = db.get('processo').find({ id: parseInt(id) }).value() || db.get('processo').find({ id: id }).value();

    if (!processo) {
        return res.status(404).json({});
    }

    if (processo.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    res.json(processo);
});



// Custom POST route to ensure userId is saved (Strict Persistence)
server.post('/processo', (req, res) => {
    const userId = req.userId;
    const db = router.db;

    const processoCollection = db.get('processo').value();
    // Generate ID (handle both string and number IDs safely)
    const ids = processoCollection.map(p => parseInt(p.id)).filter(n => !isNaN(n));
    const id = ids.length > 0 ? Math.max(...ids) + 1 : 1;

    const newProcess = {
        ...req.body,
        id,
        userId // Explicitly add userId
    };

    db.get('processo').push(newProcess).write();
    console.log(`[Auth] Created process ${id} for user ${userId}`);

    res.status(201).json(newProcess);
});

// Custom DELETE route for cascading deletion
server.delete('/processo/:id', (req, res) => {
    const id = req.params.id;
    const userId = req.userId; // Injected by middleware

    const db = router.db;
    const processo = db.get('processo').find({ id: parseInt(id) }).value() || db.get('processo').find({ id: id }).value();

    if (!processo) {
        return res.status(404).json({ error: 'Processo not found' });
    }

    // Verify ownership (optional but recommended)
    // Note: Legacy processes might not have userId. If strict isolation is required, we should only allow deleting if userId matches.
    // However, for now, if the user can see it (via GET filter), they can delete it.
    // But since we filter GET by userId, they shouldn't see it unless it's theirs (or legacy/public if we allowed that, but we don't want to).

    // Strict check:
    if (processo.userId && processo.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    // Cascade delete
    db.get('bens').remove({ processoId: id }).write();
    db.get('bens').remove({ processoId: parseInt(id) }).write(); // Handle mixed types

    db.get('herdeiros').remove({ processoId: id }).write();
    db.get('herdeiros').remove({ processoId: parseInt(id) }).write();

    db.get('dividas').remove({ processoId: id }).write();
    db.get('dividas').remove({ processoId: parseInt(id) }).write();

    // Delete the process itself
    db.get('processo').remove({ id: parseInt(id) }).write();
    db.get('processo').remove({ id: id }).write();

    res.status(200).json({ success: true });
});

server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running on port 3000');
});
