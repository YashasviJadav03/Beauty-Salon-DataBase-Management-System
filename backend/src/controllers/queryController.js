const { getDB } = require('../db/database');

const ANALYTICAL_QUERIES = [
  {
    id: 1,
    title: 'Product-Only Buyers',
    description: 'Identify customers who only buy products but never book any service for targeted offers.',
    sql: `
      SELECT DISTINCT c.Customer_ID, c.C_Name, c.C_PhoneNo, c.C_Email, p.Branch_ID, b.B_Name
      FROM Customer c
      JOIN Purchase p ON c.Customer_ID = p.Customer_ID
      JOIN Branch b ON p.Branch_ID = b.Branch_ID
      WHERE NOT EXISTS (
          SELECT 1 
          FROM Books_Appointment ba
          WHERE ba.Customer_ID = c.Customer_ID
          AND ba.Branch_ID = p.Branch_ID
      )
    `
  },
  {
    id: 2,
    title: 'Top Spenders Above Average Bill',
    description: 'Find customers whose spending exceeded the average bill value.',
    sql: `
      SELECT c.Customer_ID, c.C_Name, SUM(b.Payable_amount) AS Total_Bill, COUNT(ba.Service_ID) as Total_Visits
      FROM Customer c
      JOIN Books_Appointment ba ON c.Customer_ID = ba.Customer_ID
      JOIN Bills b ON ba.Bill_ID = b.Bill_ID
      GROUP BY c.Customer_ID, c.C_Name
      HAVING SUM(b.Payable_amount) > (
          SELECT AVG(Payable_amount) FROM Bills
      )
      ORDER BY Total_Bill DESC
    `
  },
  {
    id: 3,
    title: 'Customers Not Enrolled in Memberships',
    description: 'List customers who haven\'t subscribed to any membership plans (Upsell leads).',
    sql: `
      SELECT c.Customer_ID, c.C_Name, c.C_PhoneNo, c.C_Email, c.C_City
      FROM Customer c
      WHERE c.Customer_ID NOT IN (SELECT Customer_ID FROM Premium_Customers)
      ORDER BY c.C_Name
    `
  },
  {
    id: 4,
    title: 'Upcoming Birthdays Target List',
    description: 'List customers for birthday promo campaigns.',
    sql: `
      SELECT Customer_ID, C_Name, DOB, C_PhoneNo, C_Email
      FROM Customer
      WHERE DOB IS NOT NULL
      ORDER BY strftime('%m', DOB), strftime('%d', DOB)
    `
  },
  {
    id: 5,
    title: 'Busiest Appointment Hours',
    description: 'Peak operational hours across branches to adjust staffing.',
    sql: `
      SELECT strftime('%H', Appointment_Time) || ':00' AS Hour_Slot, COUNT(*) AS Total_Appointments
      FROM Books_Appointment
      GROUP BY Hour_Slot
      ORDER BY Total_Appointments DESC
    `
  },
  {
    id: 6,
    title: 'Customer Visit History',
    description: 'Detailed appointment history log per customer.',
    sql: `
      SELECT ba.Customer_ID, c.C_Name, ba.Appointment_Date, ba.Appointment_Time, 
             s.Ser_Name AS Service_Name, br.B_Name AS Branch_Name, b.Payable_amount
      FROM Books_Appointment ba
      JOIN Customer c ON ba.Customer_ID = c.Customer_ID
      JOIN Services s ON ba.Service_ID = s.Service_ID
      JOIN Branch br ON ba.Branch_ID = br.Branch_ID
      LEFT JOIN Bills b ON ba.Bill_ID = b.Bill_ID
      ORDER BY ba.Appointment_Date DESC
      LIMIT 25
    `
  },
  {
    id: 7,
    title: 'Customers with Missing Contact Details',
    description: 'Identify customers missing phone or email for profile cleanup.',
    sql: `
      SELECT Customer_ID, C_Name, C_PhoneNo, C_Email
      FROM Customer
      WHERE C_PhoneNo IS NULL OR C_Email IS NULL OR C_PhoneNo = '' OR C_Email = ''
    `
  },
  {
    id: 8,
    title: 'Popular Services Offered per Branch',
    description: 'Service count and breakdown by salon branch.',
    sql: `
      SELECT b.Branch_ID, b.B_Name, COUNT(ob.Service_ID) as Total_Offered_Services
      FROM Branch b
      LEFT JOIN Offered_By ob ON b.Branch_ID = ob.Branch_ID
      GROUP BY b.Branch_ID, b.B_Name
      ORDER BY Total_Offered_Services DESC
    `
  },
  {
    id: 9,
    title: 'Most Popular Services Overall',
    description: 'Top booked services ranked by appointment volume.',
    sql: `
      SELECT s.Service_ID, s.Ser_Name, s.Category, s.Ser_Price, COUNT(ba.Service_ID) AS Times_Booked
      FROM Services s
      LEFT JOIN Books_Appointment ba ON s.Service_ID = ba.Service_ID
      GROUP BY s.Service_ID, s.Ser_Name, s.Category, s.Ser_Price
      ORDER BY Times_Booked DESC
    `
  },
  {
    id: 10,
    title: 'Products Needing Urgent Restocking',
    description: 'Inventory items where stock level is low (Stock < 25).',
    sql: `
      SELECT p.Product_ID, p.P_name, p.BrandName, p.Stock, p.SellingPrice, s.Supp_Name, s.Supp_PhoneNo
      FROM Product p
      LEFT JOIN Supplier s ON p.Supplier_ID = s.Supplier_ID
      WHERE p.Stock < 25
      ORDER BY p.Stock ASC
    `
  },
  {
    id: 11,
    title: 'Best Selling Products',
    description: 'Products ranked by quantity purchased by customers.',
    sql: `
      SELECT p.Product_ID, p.P_name, p.BrandName, SUM(pur.Purchased_Quantity) AS Total_Units_Sold,
             SUM(pur.Purchased_Quantity * p.SellingPrice) AS Total_Product_Revenue
      FROM Product p
      JOIN Purchase pur ON p.Product_ID = pur.Product_ID
      GROUP BY p.Product_ID, p.P_name, p.BrandName
      ORDER BY Total_Units_Sold DESC
    `
  },
  {
    id: 12,
    title: 'Revenue per Branch',
    description: 'Total revenue aggregated by salon branch location.',
    sql: `
      SELECT b.Branch_ID, b.B_Name, b.B_City, SUM(bill.Payable_amount) AS Branch_Revenue
      FROM Branch b
      JOIN Books_Appointment ba ON b.Branch_ID = ba.Branch_ID
      JOIN Bills bill ON ba.Bill_ID = bill.Bill_ID
      GROUP BY b.Branch_ID, b.B_Name, b.B_City
      ORDER BY Branch_Revenue DESC
    `
  },
  {
    id: 13,
    title: 'Top Rated Staff Members',
    description: 'Staff members with highest ratings and supervisor info.',
    sql: `
      SELECT st.Staff_ID, st.S_name, st.Rating, st.Availability, st.S_Salary, b.B_Name as Branch, sup.S_name as Supervisor
      FROM Staff st
      LEFT JOIN Branch b ON st.Branch_ID = b.Branch_ID
      LEFT JOIN Staff sup ON st.Supervisor_ID = sup.Staff_ID
      ORDER BY st.Rating DESC, st.S_name ASC
    `
  },
  {
    id: 14,
    title: 'Appointment Volume Trends by Month',
    description: 'Monthly count of salon appointments.',
    sql: `
      SELECT strftime('%Y-%m', Appointment_Date) AS Month, COUNT(*) AS Total_Appointments
      FROM Books_Appointment
      GROUP BY Month
      ORDER BY Month DESC
    `
  },
  {
    id: 15,
    title: 'Quietest Hours for Flash Sales',
    description: 'Hours with lowest appointment bookings for off-peak promotions.',
    sql: `
      SELECT strftime('%H', Appointment_Time) || ':00' AS Hour_Slot, COUNT(*) AS Appointments
      FROM Books_Appointment
      GROUP BY Hour_Slot
      ORDER BY Appointments ASC
    `
  }
];

// GET /api/queries
exports.getQueriesList = (req, res) => {
  res.json(ANALYTICAL_QUERIES.map(q => ({ id: q.id, title: q.title, description: q.description })));
};

// GET /api/queries/:id/execute
exports.executeQuery = async (req, res) => {
  const queryId = parseInt(req.params.id);
  const queryObj = ANALYTICAL_QUERIES.find(q => q.id === queryId);

  if (!queryObj) {
    return res.status(404).json({ error: 'Query ID not found' });
  }

  try {
    const db = await getDB();
    const results = await db.all(queryObj.sql);
    res.json({
      id: queryObj.id,
      title: queryObj.title,
      description: queryObj.description,
      sql: queryObj.sql.trim(),
      rowCount: results.length,
      columns: results.length > 0 ? Object.keys(results[0]) : [],
      data: results
    });
  } catch (err) {
    console.error(`Error executing query ${queryId}:`, err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/queries/custom (Admin Live SQL Execution)
exports.executeCustomSQL = async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ error: 'SQL query required' });

  // Safety check: block destructive SQL
  const forbiddenKeywords = ['drop', 'delete', 'alter', 'truncate'];
  const lowerSQL = sql.toLowerCase();
  const isForbidden = forbiddenKeywords.some(kw => lowerSQL.includes(kw));

  if (isForbidden && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Destructive DDL/DML operations restricted to Admin' });
  }

  try {
    const db = await getDB();
    if (lowerSQL.trim().startsWith('select') || lowerSQL.trim().startsWith('pragma')) {
      const results = await db.all(sql);
      res.json({
        type: 'select',
        rowCount: results.length,
        columns: results.length > 0 ? Object.keys(results[0]) : [],
        data: results
      });
    } else {
      const result = await db.run(sql);
      res.json({
        type: 'mutation',
        changes: result.changes,
        lastID: result.lastID,
        message: `Command executed successfully (${result.changes} row(s) affected)`
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
