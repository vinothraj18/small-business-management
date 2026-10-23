import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  Receipt, 
  DollarSign, 
  Calendar, 
  Filter, 
  CreditCard, 
  Layers 
} from 'lucide-react';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Date range filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      let query = '';
      if (startDate || endDate) {
        query = `?startDate=${startDate}&endDate=${endDate}`;
      }
      const { data } = await API.get(`/dashboard/profit-loss${query}`);
      setReport(data);
    } catch (err) {
      console.error('Error fetching profit & loss report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Report</h1>
          <p className="text-xs text-gray-500 mt-1">Financial summary analyzing sales revenue, total expenses, and net profit</p>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-700">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filter Report Period:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
          <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border">
            <span className="text-gray-400">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-800 font-medium"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border">
            <span className="text-gray-400">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent focus:outline-none text-gray-800 font-medium"
            />
          </div>

          {(startDate || endDate) && (
            <button
              onClick={handleResetFilter}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Primary Financial Summary Cards */}
      {loading ? (
        <div className="p-12 text-center text-gray-500 text-xs">Loading report calculations...</div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sales Revenue Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Sales Revenue</span>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-emerald-600">₹{report.totalSalesRevenue.toFixed(2)}</div>
              <p className="text-[11px] text-gray-400 mt-2">{report.transactionCount} Total Sales Recorded</p>
            </div>

            {/* Total Expenses Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Expenses</span>
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Receipt className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-rose-600">₹{report.totalExpenses.toFixed(2)}</div>
              <p className="text-[11px] text-gray-400 mt-2">{report.expenseCount} Expense Entries Logged</p>
            </div>

            {/* Net Profit / Loss Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Profit / Loss</span>
                <div className={`p-2 rounded-xl ${report.profit >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-600'}`}>
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className={`text-3xl font-extrabold ${report.profit >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                ₹{report.profit.toFixed(2)}
              </div>
              <p className="text-[11px] text-gray-400 mt-2">
                Formula: Revenue (₹{report.totalSalesRevenue.toFixed(2)}) − Expenses (₹{report.totalExpenses.toFixed(2)})
              </p>
            </div>
          </div>

          {/* Detailed Categorical Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Expense Breakdown by Category */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                <Layers className="w-4 h-4 text-rose-600" />
                <h2 className="text-xs font-bold text-gray-900 uppercase">Expenses Breakdown by Category</h2>
              </div>

              {Object.keys(report.expenseByCategory || {}).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(report.expenseByCategory).map(([cat, amount]) => {
                    const percentage = report.totalExpenses > 0 
                      ? ((amount / report.totalExpenses) * 100).toFixed(1)
                      : '0';
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-700">{cat}</span>
                          <span className="text-rose-600">₹{amount.toFixed(2)} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-rose-500 h-full rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">No expense categories to show.</p>
              )}
            </div>

            {/* Sales Revenue by Payment Method */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-gray-900 uppercase">Revenue Breakdown by Payment Method</h2>
              </div>

              {Object.keys(report.salesByPaymentMethod || {}).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(report.salesByPaymentMethod).map(([method, amount]) => {
                    const percentage = report.totalSalesRevenue > 0
                      ? ((amount / report.totalSalesRevenue) * 100).toFixed(1)
                      : '0';
                    return (
                      <div key={method} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-700">{method}</span>
                          <span className="text-blue-600">₹{amount.toFixed(2)} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-blue-600 h-full rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">No payment methods to show.</p>
              )}
            </div>

          </div>
        </>
      ) : null}
    </div>
  );
};

export default Reports;
