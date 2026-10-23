const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Expense = require('./models/Expense');
const Sale = require('./models/Sale');

dotenv.config();

const seedData = async () => {
  try {
    console.log('Seeding initial business data...');

    // 1. Seed Admin User
    const adminExists = await User.findOne({ email: 'admin@business.com' });
    if (!adminExists) {
      await User.create({
        name: 'Business Admin',
        email: 'admin@business.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin created: admin@business.com / admin123');
    }

    // 2. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        { name: 'Wireless Ergonomic Mouse', price: 25.99, stockQuantity: 45, minStockThreshold: 10, category: 'Electronics', sku: 'SKU-1001' },
        { name: 'Mechanical Keyboard RGB', price: 79.50, stockQuantity: 18, minStockThreshold: 5, category: 'Electronics', sku: 'SKU-1002' },
        { name: 'USB-C Fast Charger 65W', price: 19.99, stockQuantity: 4, minStockThreshold: 10, category: 'Accessories', sku: 'SKU-1003' }, // Low Stock!
        { name: 'A5 Executive Notebook', price: 6.50, stockQuantity: 120, minStockThreshold: 20, category: 'Stationery', sku: 'SKU-1004' },
        { name: 'Thermal Receipt Paper Roll (10 Pack)', price: 12.00, stockQuantity: 2, minStockThreshold: 5, category: 'Supplies', sku: 'SKU-1005' }, // Low Stock!
        { name: 'HD Webcam 1080p', price: 42.00, stockQuantity: 15, minStockThreshold: 5, category: 'Electronics', sku: 'SKU-1006' }
      ];
      await Product.insertMany(sampleProducts);
      console.log('Sample products seeded');
    }

    // 3. Seed Customers if empty
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      const sampleCustomers = [
        { name: 'John Doe', phone: '9876543210', email: 'john@example.com', totalSpent: 125.49 },
        { name: 'Sarah Smith', phone: '9123456789', email: 'sarah@example.com', totalSpent: 245.00 },
        { name: 'Robert Johnson', phone: '9988776655', email: 'robert@example.com', totalSpent: 85.00 }
      ];
      await Customer.insertMany(sampleCustomers);
      console.log('Sample customers seeded');
    }

    // 4. Seed Expenses if empty
    const expenseCount = await Expense.countDocuments();
    if (expenseCount === 0) {
      const sampleExpenses = [
        { category: 'Rent', amount: 800.00, description: 'Monthly Shop Rent', date: new Date() },
        { category: 'Electricity', amount: 145.50, description: 'Power Utility Bill', date: new Date() },
        { category: 'Stock Purchase', amount: 450.00, description: 'Electronics Stock Restock', date: new Date() },
        { category: 'Staff Salary', amount: 600.00, description: 'Part-time Assistant Salary', date: new Date() }
      ];
      await Expense.insertMany(sampleExpenses);
      console.log('Sample expenses seeded');
    }

    // 5. Seed initial Sales if empty
    const saleCount = await Sale.countDocuments();
    if (saleCount === 0) {
      const prod1 = await Product.findOne({ name: 'Wireless Ergonomic Mouse' });
      const cust1 = await Customer.findOne({ name: 'John Doe' });

      if (prod1 && cust1) {
        await Sale.create({
          invoiceNumber: 'INV-20260923-0001',
          customer: cust1._id,
          customerName: cust1.name,
          customerPhone: cust1.phone,
          items: [
            {
              product: prod1._id,
              name: prod1.name,
              quantity: 2,
              unitPrice: prod1.price,
              subtotal: prod1.price * 2
            }
          ],
          totalAmount: prod1.price * 2,
          paymentMethod: 'UPI'
        });
        console.log('Sample sale transaction seeded');
      }
    }

    console.log('Data seeding complete!');
  } catch (err) {
    console.error('Seeding error:', err);
  }
};

module.exports = seedData;
