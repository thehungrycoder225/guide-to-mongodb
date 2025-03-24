# Project Structure: Pokémon Codex API

```
pokemon-codex/
├── config/                # Configuration files
│   ├── db.js              # Database connection setup
│   └── rateLimit.js       # Rate-limiting configuration
├── controllers/           # Route handlers
│   ├── AuthController.js  # Authentication logic
│   ├── PokemonController.js # Pokémon-related logic
│   └── TrainerController.js # Trainer-related logic
├── middleware/            # Custom middleware
│   ├── authMiddleware.js  # Authentication and authorization
│   ├── errorHandler.js    # Centralized error handling
│   ├── validationMiddleware.js # Input validation
│   └── rateLimit.js       # Rate-limiting middleware
├── models/                # Database models
│   ├── Pokemon.js         # Pokémon schema
│   ├── Trainer.js         # Trainer schema
│   └── User.js            # User schema (for authentication)
├── routes/                # API routes
│   ├── authRoutes.js      # Authentication routes
│   ├── pokemonRoutes.js   # Pokémon routes
│   └── trainerRoutes.js   # Trainer routes
├── utils/                 # Utility functions
│   ├── logger.js          # Logging utility
│   └── sanitize.js        # Input sanitization
├── validators/            # Validation schemas
│   └── authValidators.js  # Validation for auth routes
├── app.js                 # Main application setup
├── server.js              # Server entry point
├── .env                   # Environment variables
├── .gitignore             # Files to ignore in Git
└── package.json           # Project dependencies
```

## Authentication Setup

### Step 1: Install Required Packages

Install `jsonwebtoken` and `bcrypt` for token generation and password hashing:

```bash
npm install jsonwebtoken bcrypt
```

### Step 2: Define the User Model

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare password for login
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

### Step 3: Implement Login and Register Endpoints

#### `controllers/AuthController.js`

```javascript
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const user = new User({ username, password, role });
    await user.save();
    const token = generateToken(user);
    res.status(201).json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
```

### Step 4: Protect Routes with JWT

#### `middleware/authMiddleware.js`

```javascript
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'Access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
```

#### Protect Routes in `routes/pokemonRoutes.js`

```javascript
const express = require('express');
const PokemonController = require('../controllers/PokemonController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', PokemonController.getAllPokemon);
router.get('/:id', PokemonController.getPokemonById);

// Protected routes
router.post('/', authenticate, PokemonController.createPokemon);
router.put('/:id', authenticate, PokemonController.updatePokemon);
router.delete('/:id', authenticate, PokemonController.deletePokemon);

module.exports = router;
```

## Authorization and Access Control

### Role-Based Access Control (RBAC)

RBAC restricts access to resources based on the user’s role. In the Pokémon Codex REST API, we have two roles:

- **Admin**: Can create, update, and delete Pokémon.
- **User**: Can only view Pokémon.

#### Step 1: Add Role to JWT Payload

```javascript
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};
```

#### Step 2: Implement Authorization Middleware

```javascript
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
```

#### Step 3: Restrict Access to Routes

```javascript
const express = require('express');
const PokemonController = require('../controllers/PokemonController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', PokemonController.getAllPokemon);
router.get('/:id', PokemonController.getPokemonById);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  PokemonController.createPokemon
);
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  PokemonController.updatePokemon
);
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  PokemonController.deletePokemon
);

module.exports = router;
```

## Handling User Input Validation

### Server-Side Validation

```javascript
const { body, validationResult } = require('express-validator');

exports.validateLogin = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
```

Apply validation to routes:

```javascript
router.post(
  '/login',
  validateLogin,
  handleValidationErrors,
  AuthController.login
);
```

## Securing Routes and Endpoints

### Protecting Sensitive Endpoints

```javascript
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  PokemonController.createPokemon
);
```

### Rate-Limiting and IP Filtering

Install `express-rate-limit`:

```bash
npm install express-rate-limit
```

Add rate-limiting middleware in `app.js`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});

app.use(limiter);
```
