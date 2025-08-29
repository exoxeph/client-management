const express = require('express');
const router = express.Router();

// Import other route modules
const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const projectsRoutes = require('./projectsRoutes');
const documentRoutes = require('./document.routes');
const chatRoutes = require('./chat.routes');
// const itemRoutes = require('./item.routes');

// Root route
router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Import middleware
const { protect } = require('../middleware/auth');

// Use other route modules
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/', dashboardRoutes); // Dashboard routes are mounted at the root
router.use('/projects', projectsRoutes);
router.use('/documents', documentRoutes);
router.use('/chats', chatRoutes);
// router.use('/items', itemRoutes);

module.exports = router;