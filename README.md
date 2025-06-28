# Water Can Ledger Management System (PayPrompt)

**PayPrompt** is a full-stack application designed to streamline the operations of water can delivery businesses. It offers a comprehensive solution for managing orders, customers, and financial transactions.

---

## 🏗️ Architecture

The application follows a modern client-server architecture:

- **Frontend**: React-based web application built with **Vite**
- **Backend**: **Node.js/Express.js** server with a **MongoDB** database

---

## 🔑 Key Features

### 👥 Customer Management

- Customer registration and account management
- Customer balance tracking
- Water can possession tracking

### 📦 Order Processing

- Placing water can orders
- Managing order statuses (Pending, Confirmed, Delivered, Cancelled)
- Historical order tracking

### 💰 Financial Management

- Balance tracking per customer
- Payment recording
- Revenue and payment reporting

---

## 🧑‍💼 Role-based Access Control

The system has two primary roles:

- **Owner**: Manages inventory, customers, and reports
- **User (Customer)**: Orders water cans and views their account

---

## 🧩 UI Components

Built with **Shadcn UI** and styled using **Tailwind CSS**:

- Responsive design for mobile and desktop
- Dark/light theme support
- Components: navigation menus, cards, dialogs, toasts
- Role-based dashboard views

---

## 🔐 Authentication

- **Clerk** is used for user authentication
- Role-based middleware to protect routes

---

## 🗃️ Database Schema

- **Customer**: Customer info, balance, and can possession data
- **Order**: Order details (quantity, price, status)
- **Transaction**: Payment and refund records

---

## 🔗 API Integration

RESTful API endpoints for:

- Creating and managing orders
- User account management
- Inventory tracking
- Financial reporting

---

## 🎨 Theme and Styling

- Custom color palette: primary, secondary, accent, and utility colors
- Light/Dark mode support
- Consistent styling using CSS variables and Tailwind config

---

## 📄 Key Pages/Components

### 📊 Dashboard

- **Owner**: Sees business metrics and recent orders
- **Customer**: Sees balance, available cans, and order options

### 👥 Customers Page

- Owners: List of all customers
- Customers: Personal account details

### 🏷️ Inventory Page

- Tracks total cans, available cans, and cans with customers

### 📈 Reports Page

- Generates financial and business reports

### 🧾 Order Dialog

- Interface to place new water can orders

---

## 🚀 Goal

The application is designed to help **water can businesses operate more efficiently** by digitizing:

- Customer management
- Payment tracking
- Inventory control
