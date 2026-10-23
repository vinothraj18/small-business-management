import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  DollarSign, 
  Calendar, 
  Tag, 
  X, 
  CheckCircle2, 
  PieChart 
} from 'lucide-react';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    category: 'Rent',
    amount: '',
    description: '',
    date: new Date().toISOString().slice(0, 10)
  });
  const [formError, setFormError] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/expenses?category=${categoryFilter}`);
      setExpenses(data.expenses);
      setTotalExpenses(data.totalExpenses);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.category || !formData.amount) {
      setFormError('Category and amount are required.');
      return;
    }

    try {
      await API.post('/expenses', formData);
      setModalOpen(false);
      setFormData({
        category: 'Rent',
        amount: '',
        description: '',
        date: new Date().toISOString().slice(0, 10)
      });
      fetchExpenses();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add expense');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await API.delete(`/expenses/${id}`);
        fetchExpenses();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting expense');
      }
    }
  };

  const categories = ['Rent', 'Electricity', 'Stock Purchase', 'Staff Salary', 'Other'];

  const categoryColors = {
    'Rent': 'bg-purple-100 text-purple-800 border-purple-200',
    'Electricity': 'bg-amber-100 text-amber-800 border-amber-200',
    'Stock Purchase': 'bg-blue-100 text-blue-800 border-blue-200',
    'Staff Salary': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Other': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-xs text-gray-500 mt-1">Track business expenditure by category, date, and amount</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-rose-500/20 inline-flex items-center space-x-2 text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Expense</span>
        </button>
      </div>

      {/* Summary KPI & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between md:col-span-1">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Expenses Displayed</span>
            <div className="text-3xl font-extrabold text-rose-600 mt-1">₹{totalExpenses.toFixed(2)}</div>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <Receipt className="w-8 h-8" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between md:col-span-2">
          <div className="w-full">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Filter by Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  categoryFilter === 'All'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    categoryFilter === cat
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-xs">Loading expenses...</div>
        ) : expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 text-gray-500 font-medium">
                      {new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${categoryColors[exp.category] || categoryColors['Other']}`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{exp.description || '—'}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-rose-600">
                      ₹{exp.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleDelete(exp._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No expense records found</p>
            <p className="text-xs text-gray-400 mt-1">Click 'Add New Expense' to log business spending.</p>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Add New Expense</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="150.00"
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Description (Optional)</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Electricity bill for September"
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="pt-2 flex space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-rose-500/20"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
