const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const salonController = require('../controllers/salonController');
const queryController = require('../controllers/queryController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

// Auth Routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/me', authenticateToken, authController.me);

// Public & Customer Routes
router.get('/services', salonController.getServices);
router.get('/branches', salonController.getBranches);
router.get('/memberships', salonController.getMemberships);

// Appointments
router.get('/appointments', authenticateToken, salonController.getAppointments);
router.post('/appointments', authenticateToken, salonController.bookAppointment);

// Memberships Subscribe
router.post('/memberships/subscribe', authenticateToken, salonController.subscribeMembership);

// Staff & Inventory (Staff/Admin)
router.get('/staff', authenticateToken, salonController.getStaff);
router.get('/inventory', authenticateToken, salonController.getInventory);
router.post('/inventory/restock', authenticateToken, requireRole(['admin']), salonController.restockProduct);

// Billing & Admin Dashboard Stats
router.get('/billing', authenticateToken, requireRole(['admin', 'staff']), salonController.getBilling);
router.get('/stats', authenticateToken, requireRole(['admin']), salonController.getDashboardStats);

// Analytical Queries API
router.get('/queries', authenticateToken, queryController.getQueriesList);
router.get('/queries/:id/execute', authenticateToken, queryController.executeQuery);
router.post('/queries/custom', authenticateToken, requireRole(['admin']), queryController.executeCustomSQL);

module.exports = router;
