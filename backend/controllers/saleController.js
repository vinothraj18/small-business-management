const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Customer = require('../models/Customer');

// @desc    Record new sales transaction
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  try {
    const { items, customerId, customerName, customerPhone, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one item is required for a sale' });
    }

    if (!['Cash', 'UPI', 'Card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method. Must be Cash, UPI, or Card' });
    }

    let totalAmount = 0;
    const processedItems = [];

    // Check stock & calculate subtotal for each item
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        return res.status(400).json({ message: `Invalid quantity for product ${product.name}` });
      }

      if (product.stockQuantity < qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${qty}`
        });
      }

      const subtotal = product.price * qty;
      totalAmount += subtotal;

      processedItems.push({
        product: product._id,
        name: product.name,
        quantity: qty,
        unitPrice: product.price,
        subtotal
      });
    }

    // Deduct stock for each product
    for (const item of processedItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // Handle Customer Linking or Creation
    let linkedCustomerId = null;
    let finalCustomerName = customerName || 'Walk-in Customer';
    let finalCustomerPhone = customerPhone || '';

    if (customerId) {
      const existingCust = await Customer.findById(customerId);
      if (existingCust) {
        linkedCustomerId = existingCust._id;
        finalCustomerName = existingCust.name;
        finalCustomerPhone = existingCust.phone;
        existingCust.totalSpent += totalAmount;
        await existingCust.save();
      }
    } else if (customerPhone && customerName) {
      let existingCust = await Customer.findOne({ phone: customerPhone });
      if (existingCust) {
        linkedCustomerId = existingCust._id;
        existingCust.totalSpent += totalAmount;
        await existingCust.save();
      } else {
        const newCust = await Customer.create({
          name: customerName,
          phone: customerPhone,
          totalSpent: totalAmount
        });
        linkedCustomerId = newCust._id;
      }
    }

    // Generate Invoice Number
    const count = await Sale.countDocuments();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const invoiceNumber = `INV-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const sale = await Sale.create({
      invoiceNumber,
      customer: linkedCustomerId,
      customerName: finalCustomerName,
      customerPhone: finalCustomerPhone,
      items: processedItems,
      totalAmount,
      paymentMethod
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
  try {
    const { startDate, endDate, paymentMethod } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    const sales = await Sale.find(query).sort({ createdAt: -1 }).populate('customer', 'name phone');
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sale by ID (Bill / Invoice details)
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('customer', 'name phone email');
    if (!sale) {
      return res.status(404).json({ message: 'Sale invoice not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById
};
