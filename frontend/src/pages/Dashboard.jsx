import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  TrendingUp, 
  Receipt, 
  Package, 
  DollarSign, 
  AlertTriangle, 
  ArrowUpRight, 
  ShoppingCart, 
  Calendar 
} from 'lucide-react';
import BillModal from '../components/BillModal';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/dashboard/summary');
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span>Loading business summary...</span>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Today's Sales",
      value: `₹${summary?.todaySalesTotal?.toFixed(2) || '0.00'}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      subtitle: `Total revenue all time: ₹${summary?.totalRevenue?.toFixed(2) || '0.00'}`
    },
    {
      title: 'Total Expenses',
      value: `₹${summary?.totalExpenses?.toFixed(2) || '0.00'}`,
      icon: Receipt,
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      subtitle: `Today's expenses: ₹${summary?.todayExpensesTotal?.toFixed(2) || '0.00'}`
    },
    {
      title: 'Products in Inventory',
      value: summary?.totalProductsCount || 0,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      subtitle: `Total stock units: ${summary?.totalInventoryStock || 0}`
    },
    {
      title: 'Current Profit',
      value: `₹${summary?.netProfit?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: summary?.netProfit >= 0 ? 'bg-indigo-500' : 'bg-red-500',
      textColor: summary?.netProfit >= 0 ? 'text-indigo-600' : 'text-red-600',
      bgColor: summary?.netProfit >= 0 ? 'bg-indigo-50' : 'bg-red-50',
      subtitle: summary?.netProfit >= 0 ? 'Sales − Expenses (Profitable)' : 'Sales − Expenses (Loss)'
    }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Executive Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time overview of business sales, expenses, inventory, and net profits</p>
        </div>
        <div className="flex items-center space-x-2 text-xs bg-white border px-3 py-2 rounded-lg text-gray-600 shadow-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.bgColor}`}>
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-gray-900 mb-1">{card.value}</div>
              <p className="text-[11px] text-gray-400">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Low Stock Alert & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Low Stock Warning Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-gray-900 text-sm">Low Stock Alerts</h2>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
              {summary?.lowStockProductsCount || 0} Items
            </span>
          </div>

          {summary?.lowStockProducts && summary.lowStockProducts.length > 0 ? (
            <div className="space-y-3 flex-1 overflow-y-auto max-h-80 pr-1">
              {summary.lowStockProducts.map((prod) => (
                <div 
                  key={prod._id} 
                  className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-xs font-semibold text-gray-800">{prod.name}</h3>
                    <p className="text-[10px] text-gray-500">Category: {prod.category} | Price: ₹{prod.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-amber-500 text-white font-bold text-xs rounded-md shadow-sm">
                      {prod.stockQuantity} left
                    </span>
                    <p className="text-[9px] text-amber-700 mt-0.5">Min: {prod.minStockThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-gray-400">
              <Package className="w-10 h-10 text-emerald-300 mb-2" />
              <p className="text-xs font-medium text-emerald-700">All products sufficiently stocked!</p>
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-gray-900 text-sm">Recent Sales Transactions</h2>
            </div>
          </div>

          {summary?.recentSales && summary.recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-gray-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2">Invoice #</th>
                    <th className="pb-2">Customer</th>
                    <th className="pb-2">Payment</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {summary.recentSales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 font-mono font-medium text-slate-800">{sale.invoiceNumber}</td>
                      <td className="py-3 font-medium text-gray-700">{sale.customerName || 'Walk-in'}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-gray-900">₹{sale.totalAmount.toFixed(2)}</td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded font-medium inline-flex items-center space-x-1"
                        >
                          <span>Bill</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-gray-400">
              <p className="text-xs">No sales transactions recorded yet today.</p>
            </div>
          )}
        </div>

      </div>

      {/* Bill Receipt Modal */}
      {selectedSale && (
        <BillModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
    </div>
  );
};

export default Dashboard;
