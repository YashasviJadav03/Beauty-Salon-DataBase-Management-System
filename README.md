# 💇‍♀️ Beauty Salon Database Management System

This project is a real-world simulation of how a multi-branch beauty salon manages its day-to-day operations using a robust and well-designed relational database system and a modern full-stack web application.

From booking appointments and maintaining customer profiles to handling inventory, memberships, staff performance, billing, and executing live SQL analytics — our system provides a centralized, efficient, and normalized solution to meet the dynamic needs of a modern beauty salon.

Built as part of an academic group project, the system was developed in structured phases:

1. A practical scenario-driven approach that mirrors real business logic
2. A complete ER diagram, relational model, and normalization proofs (up to BCNF)
3. An optimized SQL schema with integrity constraints and realistic sample data
4. 26+ advanced queries solving real-world analytical and managerial needs
5. A full-stack web application with React, Node.js/Express, and interactive SQL execution

## 👩‍💼 Project Contributors
- Yashasvi Jadav (202301069)
- Jhil Patel (202301090)
- Sanya Vaishnavi (202301117)
- Sadana Dharavath (202301121)

---

### 📌 Phase 1: Scenario Ideation
We began by understanding the real-world workflows of a beauty salon and translated them into system-level actors and use cases.

Defined user roles and responsibilities across:
- **Customers**: Book services, review staff, rate appointments, redeem membership offers, browse and purchase products.
- **Staff**: Manage appointments, perform services, and maintain schedules.
- **Admins**: Oversee branches, assign staff, manage services/products, monitor stocks, and handle financial reports.
- **Visitors**: Explore available services, offers, and salon locations.

📄 Refer: `Scenario Description.pdf`

---

### 🧠 Phase 2: ER Diagram
In this phase, we converted our scenario into an Entity-Relationship (ER) diagram to model the system's logical structure.

Key highlights:
- Captures core entities such as Customer, Staff, Administrator, Service, Product, Membership, Branch, and Supplier.
- Represents relationships like:
   1. `Books_Appointment` (Customer ↔ Service)
   2. `Purchase` (Customer ↔ Product)
   3. `Used_For` (Service ↔ Product)
   4. `Supplies` (Supplier ↔ Product)
   5. `Offered_By` (Branch ↔ Service)
   6. `Provides` (Staff ↔ Service)
   7. `Premium_Customers` (Customer ↔ Membership)
- Includes:
   - Many-to-many relationships
   - Aggregation via billing
   - Supervisory hierarchy in staff roles (`Supervisor_ID`)

📄 Refer: `Normalization+ER+Relational.pdf` (ER section)

---

### 🧱 Phase 3: Relational Model
In this phase, the ER diagram was translated into a complete relational schema using SQL table definitions. Each relationship and entity was converted into a normalized table with appropriate constraints.

Key features:
- Over 20 well-structured tables with clear relationships and unique identifiers.
- Primary keys and foreign keys properly defined with `ON DELETE` and `ON UPDATE` cascading rules.
- Composite keys used for many-to-many relations like `Books_Appointment`, `Purchase`, `Provides`, etc.
- Integrity constraints such as `CHECK` (e.g., for rating, stock, and discount limits) to ensure valid data entries.
- `Branch_ID` included in key transactional tables like `Purchase` and `Books_Appointment` for branch-specific tracking and analytics.

📄 Refer: `Normalization.pdf`, `ERD.pdf`, `Relational_Model.pdf`

---

### 🔍 Phase 4: Normalization
To ensure data consistency and avoid redundancy, all relations in the schema were normalized up to BCNF.
- **1NF**: Atomic columns
- **2NF**: Removed partial dependencies from composite keys
- **3NF & BCNF**: No transitive or non-key dependencies

📄 Refer: Normalization Proof Section in PDF

---

### 🧪 Phase 5: Schema Implementation
This phase involved translating the relational model into SQL scripts to create the actual database structure.
- Schema implemented using PostgreSQL syntax with primary keys, foreign keys, `CHECK` constraints, and cascading rules.
- Insert scripts populated the tables with realistic sample data representing customers, appointments, services, products, staff, bills, and more.

📂 Refer: `DDLScript.txt`, `INSERTScript.txt`

---

### 🧠 Phase 6: Real-Life Analytical Queries
We developed a set of 26 advanced SQL queries to extract actionable insights from the database — mimicking real salon reporting and analysis scenarios.

Key focus areas:
1. **Customer behavior**: Loyalty tracking, birthday campaigns, product-only purchases
2. **Sales insights**: Top services, revenue per branch, monthly trends
3. **Inventory monitoring**: Low stock alerts, product usage vs. supply
4. **Staff analytics**: Top-rated employees, experience-based filters
5. **Forecasting patterns**: Peak hours, inactive customers, seasonal trends

📂 Refer: `DBMS_queries.txt`

---

### 💻 Phase 7: Full-Stack Web Application Architecture
A complete full-stack web application built to bring the relational database to life with an interactive UI, multi-role portals, and live SQL execution:

#### Features & Portals:
- **Customer Portal**: Browse services, filter by category & city branch, book appointments with instant billing & membership discount calculation, view visit history.
- **Staff Portal**: View branch daily appointment schedules, customer profiles, and service ratings.
- **Admin Dashboard**: Real-time gross revenue tracking, branch metrics, product stock alerts, restock management, and financial billing log.
- **SQL Analytics Engine**: Pre-built live runner for all 26 analytical business queries + live SQL sandbox for custom query execution.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React, Vite, Lucide Icons, Custom Glassmorphism CSS System |
| **Backend API** | Node.js, Express.js, JWT Authentication, Bcrypt |
| **Database** | SQLite / PostgreSQL (DDL & INSERT script auto-loader) |
| **Design** | Dark Luxury Palette (`#d4af37` Gold), Google Fonts (`Playfair Display`, `Outfit`) |

---

## 🚀 Quick Start Guide

### 1. Run Backend Server
```bash
cd backend
npm install
node server.js
```
> Running on `http://localhost:5000`

### 2. Run Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
> Running on `http://localhost:5173`

---

## 🔑 Demo Access Credentials

| Role | Email | Password | Access Features |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@salon.com` | `admin123` | Executive Dashboard, Inventory Restock, Financial Bills, SQL Analytics Engine |
| **Staff** | `staff@salon.com` | `staff123` | Appointment Master Register & Customer Logs |
| **Customer** | `customer@salon.com` | `customer123` | Service Catalog, Appointment Booking, Membership Plans |

---

## 📂 Repository Overview

```
Beauty-Salon-DataBase-Management-System/
├── backend/                  # Express REST API Server & SQLite DB loader
│   ├── src/
│   │   ├── controllers/      # Auth, Salon, & Query execution logic
│   │   ├── db/               # SQLite database initializer & script parser
│   │   ├── middleware/       # JWT & Role authentication
│   │   └── routes/           # API endpoints
│   └── server.js
├── frontend/                 # React + Vite Glassmorphic UI Application
│   ├── src/
│   │   ├── components/       # Customer, Staff, Admin, Inventory, & Query views
│   │   ├── App.jsx
│   │   └── index.css
│   └── vite.config.js
├── Scenario Description.pdf  # Phase 1: Scenario specification
├── ERD.pdf                   # Phase 2: Entity-Relationship Diagram
├── Relational_Model.pdf      # Phase 3: Relational Schema Design
├── Normalization.pdf         # Phase 4: Normalization Proofs (up to BCNF)
├── DDLScript.txt             # Phase 5: Table creation DDL SQL script
├── INSERTScript.txt          # Phase 5: Sample data population script
└── DBMS_queries.txt          # Phase 6: 26 Analytical Business Queries
```

---

## 📌 Conclusion
Working on this project helped us translate a real-world scenario into a structured and efficient database system and modern full-stack web application. Through each phase—right from mapping user needs and designing relationships to writing complex queries and constructing interactive web portals—we strengthened our understanding of core database principles like normalization, integrity constraints, and data analytics.

## 📌 Acknowledgment
We would like to express our sincere gratitude to our faculty guide and the DBMS course TAs for their guidance and support throughout this project. Their insights and feedback played a crucial role in shaping our understanding of real-world database systems. We also appreciate the collaborative efforts of our teammates, whose consistent contributions made this project a success.
