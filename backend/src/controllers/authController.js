const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../db/database');
const { JWT_SECRET } = require('../middleware/authMiddleware');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const db = await getDB();
    const user = await db.get('SELECT * FROM AppUsers WHERE Email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.Password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get entity profile details
    let profile = null;
    if (user.Role === 'customer') {
      profile = await db.get('SELECT * FROM Customer WHERE Customer_ID = ?', [user.Ref_ID]);
    } else if (user.Role === 'staff') {
      profile = await db.get('SELECT * FROM Staff WHERE Staff_ID = ?', [user.Ref_ID]);
    } else if (user.Role === 'admin') {
      profile = await db.get('SELECT * FROM Administrator WHERE A_ID = ?', [user.Ref_ID]);
    }

    const token = jwt.sign(
      { userId: user.User_ID, email: user.Email, role: user.Role, refId: user.Ref_ID },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.User_ID,
        email: user.Email,
        role: user.Role,
        refId: user.Ref_ID,
        profile: profile || { name: user.Email.split('@')[0] }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

exports.register = async (req, res) => {
  const { name, email, phone, password, gender, street, city, pin, dob } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  try {
    const db = await getDB();
    const existing = await db.get('SELECT * FROM AppUsers WHERE Email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Get max Customer_ID
    const maxCust = await db.get('SELECT MAX(Customer_ID) as maxId FROM Customer');
    const newCustId = (maxCust?.maxId || 1000) + 1;

    // Insert into Customer table
    await db.run(
      `INSERT INTO Customer (Customer_ID, C_Name, C_PhoneNo, C_Email, DOB, Gender, C_PIN, C_Street, C_City)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newCustId, name, phone || null, email, dob || null, gender || 'Other', pin || null, street || null, city || 'Ahmedabad']
    );

    // Hash password and insert into AppUsers
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run(
      `INSERT INTO AppUsers (Email, Password, Role, Ref_ID) VALUES (?, ?, 'customer', ?)`,
      [email, hashedPassword, newCustId]
    );

    const token = jwt.sign(
      { userId: newCustId, email, role: 'customer', refId: newCustId },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        email,
        role: 'customer',
        refId: newCustId,
        profile: { Customer_ID: newCustId, C_Name: name, C_Email: email }
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create user account' });
  }
};

exports.me = async (req, res) => {
  try {
    const db = await getDB();
    const user = await db.get('SELECT User_ID, Email, Role, Ref_ID FROM AppUsers WHERE User_ID = ?', [req.user.userId]);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let profile = null;
    if (user.Role === 'customer') {
      profile = await db.get('SELECT * FROM Customer WHERE Customer_ID = ?', [user.Ref_ID]);
    } else if (user.Role === 'staff') {
      profile = await db.get('SELECT * FROM Staff WHERE Staff_ID = ?', [user.Ref_ID]);
    } else if (user.Role === 'admin') {
      profile = await db.get('SELECT * FROM Administrator WHERE A_ID = ?', [user.Ref_ID]);
    }

    res.json({ user, profile });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};
