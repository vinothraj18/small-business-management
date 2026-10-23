const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const Product = require('../models/Product');

// @desc    Get dashboard summary KPIs & low stock items
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    // 1. Today's date boundary
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Today's Sales
    const todaySalesDocs = await Sale.find({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });
    const todaySalesTotal = todaySalesDocs.reduce((sum, s) => sum + s.totalAmount, 0);

    // Total Revenue (all time or current period)
    const allSalesDocs = await Sale.find();
    const totalRevenue = allSalesDocs.reduce((sum, s) => sum + s.totalAmount, 0);

    // Total Expenses
    const allExpenseDocs = await Expense.find();
    const totalExpenses = allExpenseDocs.reduce((sum, e) => sum + e.amount, 0);

    // Today's Expenses
    const todayExpensesDocs = await Expense.find({
      date: { $gte: startOfToday, $lte: endOfToday }
    });
    const todayExpensesTotal = todayExpensesDocs.reduce((sum, e) => sum + e.amount, 0);

    // Current Profit (Sales - Expenses)
    const netProfit = totalRevenue - totalExpenses;
    const todayProfit = todaySalesTotal - todayExpensesTotal;

    // Total Products in Inventory
    const totalProductsCount = await Product.countDocuments();
    const allProducts = await Product.find();
    const totalInventoryStock = allProducts.reduce((sum, p) => sum + p.stockQuantity, 0);

    // Low Stock Products (stockQuantity <= minStockThreshold)
    const lowStockProducts = allProducts.filter(
      (p) => p.stockQuantity <= (p.minStockThreshold || 5)
    );

    // Recent Sales
    const recentSales = await Sale.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      todaySalesTotal,
      totalRevenue,
      totalExpenses,
      todayExpensesTotal,
      netProfit,
      todayProfit,
      totalProductsCount,
      totalInventoryStock,
      lowStockProductsCount: lowStockProducts.length,
      lowStockProducts,
      recentSales
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Profit & Loss detailed report
// @route   GET /api/dashboard/profit-loss
// @access  Private
const getProfitLossReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let saleQuery = {};
    let expenseQuery = {};

    if (startDate || endDate) {
      saleQuery.createdAt = {};
      expenseQuery.date = {};

      if (startDate) {
        saleQuery.createdAt.$gte = new Date(startDate);
        expenseQuery.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        saleQuery.createdAt.$lte = end;
        expenseQuery.date.$lte = end;
      }
    }

    const sales = await Sale.find(saleQuery);
    const expenses = await Expense.find(expenseQuery);

    const totalSalesRevenue = sales.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    const profit = totalSalesRevenue - totalExpenses;

    // Expense breakdown by category
    const expenseByCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    // Sales breakdown by payment method
    const salesByPaymentMethod = sales.reduce((acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + s.totalAmount;
      return acc;
    }, {});

    res.json({
      totalSalesRevenue,
      totalExpenses,
      profit,
      transactionCount: sales.length,
      expenseCount: expenses.length,
      expenseByCategory,
      salesByPaymentMethod
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardSummary,
  getProfitLossReport
};
