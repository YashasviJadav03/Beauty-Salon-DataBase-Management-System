const { getDB } = require('../db/database');

// GET /api/services
exports.getServices = async (req, res) => {
  try {
    const db = await getDB();
    const { branchId, category } = req.query;

    let sql = `
      SELECT s.*, GROUP_CONCAT(b.B_Name, ', ') as Branches
      FROM Services s
      LEFT JOIN Offered_By ob ON s.Service_ID = ob.Service_ID
      LEFT JOIN Branch b ON ob.Branch_ID = b.Branch_ID
    `;
    const params = [];

    if (branchId) {
      sql += ` WHERE ob.Branch_ID = ?`;
      params.push(branchId);
    } else if (category) {
      sql += ` WHERE s.Category = ?`;
      params.push(category);
    }

    sql += ` GROUP BY s.Service_ID ORDER BY s.Category, s.Ser_Name`;

    const services = await db.all(sql, params);
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error loading services' });
  }
};

// GET /api/branches
exports.getBranches = async (req, res) => {
  try {
    const db = await getDB();
    const branches = await db.all(`
      SELECT b.*, 
        (SELECT COUNT(*) FROM Staff s WHERE s.Branch_ID = b.Branch_ID) as StaffCount,
        (SELECT COUNT(*) FROM Offered_By ob WHERE ob.Branch_ID = b.Branch_ID) as OfferedServicesCount
      FROM Branch b
      ORDER BY b.B_City, b.B_Name
    `);
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: 'Error loading branches' });
  }
};

// GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const db = await getDB();
    const { customerId, staffId, branchId } = req.query;

    let sql = `
      SELECT ba.*, 
             c.C_Name as Customer_Name, c.C_PhoneNo, c.C_Email,
             s.Ser_Name as Service_Name, s.Ser_Price, s.Category,
             b.B_Name as Branch_Name, b.B_City,
             bill.Payable_amount, bill.Payment_mode
      FROM Books_Appointment ba
      JOIN Customer c ON ba.Customer_ID = c.Customer_ID
      JOIN Services s ON ba.Service_ID = s.Service_ID
      JOIN Branch b ON ba.Branch_ID = b.Branch_ID
      LEFT JOIN Bills bill ON ba.Bill_ID = bill.Bill_ID
    `;

    const conditions = [];
    const params = [];

    if (customerId) {
      conditions.push('ba.Customer_ID = ?');
      params.push(customerId);
    }
    if (branchId) {
      conditions.push('ba.Branch_ID = ?');
      params.push(branchId);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY ba.Appointment_Date DESC, ba.Appointment_Time DESC';

    const appointments = await db.all(sql, params);
    res.json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error retrieving appointments' });
  }
};

// POST /api/appointments
exports.bookAppointment = async (req, res) => {
  try {
    const db = await getDB();
    const { customerId, serviceId, branchId, date, time, paymentMode } = req.body;

    if (!customerId || !serviceId || !branchId || !date || !time) {
      return res.status(400).json({ error: 'Missing required booking fields' });
    }

    // Get service details for price
    const service = await db.get('SELECT * FROM Services WHERE Service_ID = ?', [serviceId]);
    if (!service) return res.status(404).json({ error: 'Service not found' });

    // Check membership for discount
    const member = await db.get(`
      SELECT m.Discount_rate 
      FROM Premium_Customers pc 
      JOIN Membership m ON pc.M_name = m.M_name 
      WHERE pc.Customer_ID = ? AND pc.Membership_Validity >= DATE('now')
    `, [customerId]);

    const discountRate = member ? member.Discount_rate : 0;
    const amount = service.Ser_Price;
    const discountAmount = (amount * discountRate) / 100;
    const payableAmount = amount - discountAmount;

    // Create Bill entry
    const maxBill = await db.get('SELECT MAX(Bill_ID) as maxId FROM Bills');
    const newBillId = (maxBill?.maxId || 4000) + 1;

    await db.run(`
      INSERT INTO Bills (Bill_ID, Amount, Discount, Payable_amount, Payment_mode)
      VALUES (?, ?, ?, ?, ?)
    `, [newBillId, amount, discountRate, payableAmount, paymentMode || 'UPI']);

    // Book appointment
    await db.run(`
      INSERT INTO Books_Appointment (Customer_ID, Service_ID, Appointment_Date, Appointment_Time, Bill_ID, Branch_ID)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [customerId, serviceId, date, time, newBillId, branchId]);

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointment: {
        customerId,
        serviceId,
        serviceName: service.Ser_Name,
        branchId,
        date,
        time,
        billId: newBillId,
        amount,
        discountRate,
        payableAmount
      }
    });
  } catch (err) {
    console.error(err);
    if (err.message.includes('UNIQUE constraint failed') || err.message.includes('PRIMARY KEY')) {
      return res.status(400).json({ error: 'Appointment slot already booked for this customer & service on this date.' });
    }
    res.status(500).json({ error: 'Failed to book appointment' });
  }
};

// GET /api/memberships
exports.getMemberships = async (req, res) => {
  try {
    const db = await getDB();
    const memberships = await db.all('SELECT * FROM Membership ORDER BY M_Price DESC');
    res.json(memberships);
  } catch (err) {
    res.status(500).json({ error: 'Error loading memberships' });
  }
};

// POST /api/memberships/subscribe
exports.subscribeMembership = async (req, res) => {
  try {
    const db = await getDB();
    const { customerId, membershipName } = req.body;

    const plan = await db.get('SELECT * FROM Membership WHERE M_name = ?', [membershipName]);
    if (!plan) return res.status(404).json({ error: 'Membership plan not found' });

    // Validity: current date + duration in months
    const validityDate = new Date();
    validityDate.setMonth(validityDate.getMonth() + plan.Duration);
    const formattedValidity = validityDate.toISOString().split('T')[0];

    await db.run(`
      INSERT OR REPLACE INTO Premium_Customers (Customer_ID, M_name, Membership_Validity)
      VALUES (?, ?, ?)
    `, [customerId, membershipName, formattedValidity]);

    res.json({
      message: `Enrolled in ${membershipName} plan successfully!`,
      validity: formattedValidity,
      discount: plan.Discount_rate
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error subscribing to membership' });
  }
};

// GET /api/inventory
exports.getInventory = async (req, res) => {
  try {
    const db = await getDB();
    const products = await db.all(`
      SELECT p.*, s.Supp_Name, s.Supp_PhoneNo, s.Supp_Email
      FROM Product p
      LEFT JOIN Supplier s ON p.Supplier_ID = s.Supplier_ID
      ORDER BY p.Stock ASC
    `);

    const suppliers = await db.all('SELECT * FROM Supplier ORDER BY Supp_Name');
    res.json({ products, suppliers });
  } catch (err) {
    res.status(500).json({ error: 'Error loading inventory' });
  }
};

// POST /api/inventory/restock
exports.restockProduct = async (req, res) => {
  try {
    const db = await getDB();
    const { productId, addedQuantity } = req.body;

    if (!productId || !addedQuantity || addedQuantity <= 0) {
      return res.status(400).json({ error: 'Valid Product ID and quantity are required' });
    }

    await db.run(`
      UPDATE Product SET Stock = Stock + ? WHERE Product_ID = ?
    `, [addedQuantity, productId]);

    const updated = await db.get('SELECT * FROM Product WHERE Product_ID = ?', [productId]);
    res.json({ message: 'Stock updated successfully', product: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error restocking product' });
  }
};

// GET /api/staff
exports.getStaff = async (req, res) => {
  try {
    const db = await getDB();
    const staffList = await db.all(`
      SELECT st.*, b.B_Name as Branch_Name, sup.S_name as Supervisor_Name
      FROM Staff st
      LEFT JOIN Branch b ON st.Branch_ID = b.Branch_ID
      LEFT JOIN Staff sup ON st.Supervisor_ID = sup.Staff_ID
      ORDER BY st.Rating DESC, st.S_name ASC
    `);
    res.json(staffList);
  } catch (err) {
    res.status(500).json({ error: 'Error loading staff' });
  }
};

// GET /api/billing
exports.getBilling = async (req, res) => {
  try {
    const db = await getDB();
    const bills = await db.all(`
      SELECT b.*,
        (SELECT c.C_Name FROM Books_Appointment ba JOIN Customer c ON ba.Customer_ID = c.Customer_ID WHERE ba.Bill_ID = b.Bill_ID LIMIT 1) as Customer_Name,
        (SELECT s.Ser_Name FROM Books_Appointment ba JOIN Services s ON ba.Service_ID = s.Service_ID WHERE ba.Bill_ID = b.Bill_ID LIMIT 1) as Service_Name
      FROM Bills b
      ORDER BY b.Bill_ID DESC
    `);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: 'Error loading billing history' });
  }
};

// GET /api/stats (Admin Dashboard)
exports.getDashboardStats = async (req, res) => {
  try {
    const db = await getDB();
    
    const revenue = await db.get('SELECT SUM(Payable_amount) as totalRevenue, COUNT(*) as totalBills FROM Bills');
    const appointments = await db.get('SELECT COUNT(*) as totalAppointments FROM Books_Appointment');
    const customers = await db.get('SELECT COUNT(*) as totalCustomers FROM Customer');
    const lowStock = await db.get('SELECT COUNT(*) as lowStockCount FROM Product WHERE Stock < 15');
    const branches = await db.get('SELECT COUNT(*) as branchCount FROM Branch');
    const staff = await db.get('SELECT COUNT(*) as staffCount FROM Staff');

    const recentAppointments = await db.all(`
      SELECT ba.Appointment_Date, ba.Appointment_Time, c.C_Name, s.Ser_Name, b.B_Name, bill.Payable_amount
      FROM Books_Appointment ba
      JOIN Customer c ON ba.Customer_ID = c.Customer_ID
      JOIN Services s ON ba.Service_ID = s.Service_ID
      JOIN Branch b ON ba.Branch_ID = b.Branch_ID
      LEFT JOIN Bills bill ON ba.Bill_ID = bill.Bill_ID
      ORDER BY ba.Appointment_Date DESC, ba.Appointment_Time DESC
      LIMIT 6
    `);

    res.json({
      totalRevenue: revenue?.totalRevenue || 0,
      totalBills: revenue?.totalBills || 0,
      totalAppointments: appointments?.totalAppointments || 0,
      totalCustomers: customers?.totalCustomers || 0,
      lowStockCount: lowStock?.lowStockCount || 0,
      branchCount: branches?.branchCount || 0,
      staffCount: staff?.staffCount || 0,
      recentAppointments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error calculating dashboard statistics' });
  }
};
