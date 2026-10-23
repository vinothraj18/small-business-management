import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Users, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  ShoppingBag, 
  Eye, 
  X, 
  UserCheck 
} from 'lucide-react';
import BillModal from '../components/BillModal';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Customer Detail & Purchase History Modal
  const [selectedCustomerData, setSelectedCustomerData] = useState(null);
  const [selectedSaleForBill, setSelectedSaleForBill] = useState(null);

  // New Customer Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [formError, setFormError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/customers?search=${search}`);
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.phone) {
      setFormError('Name and Phone number are required.');
      return;
    }

    try {
      await API.post('/customers', formData);
      setModalOpen(false);
      setFormData({ name: '', phone: '', email: '' });
      fetchCustomers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add customer.');
    }
  };

  const handleViewCustomerHistory = async (id) => {
    try {
      const { data } = await API.get(`/customers/${id}`);
      setSelectedCustomerData(data);
    } catch (err) {
      alert('Error fetching customer purchase history');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Directory</h1>
          <p className="text-xs text-gray-500 mt-1">Manage customer profiles and inspect individual purchase histories</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 inline-flex items-center space-x-2 text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customer by name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-xs">Loading customers...</div>
        ) : customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-right">Lifetime Spent</th>
                  <th className="py-3 px-4 text-center">Purchase History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/80">
                    <td className="py-3 px-4 font-bold text-gray-900 flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                        {c.name.charAt(0)}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono">{c.phone}</td>
                    <td className="py-3 px-4 text-gray-500">{c.email || '—'}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                      ₹{c.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewCustomerHistory(c._id)}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs inline-flex items-center space-x-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>View Orders</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No customers found</p>
          </div>
        )}
      </div>

      {/* New Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center pb-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Add New Customer</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddCustomer} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sarah Smith"
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sarah@example.com"
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                />
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
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-blue-500/20"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Purchase History Modal */}
      {selectedCustomerData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selectedCustomerData.customer.name}</h2>
                <p className="text-xs text-gray-500">Phone: {selectedCustomerData.customer.phone} | Total Spent: ₹{selectedCustomerData.customer.totalSpent.toFixed(2)}</p>
              </div>
              <button onClick={() => setSelectedCustomerData(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 overflow-y-auto flex-1 space-y-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase">Linked Order History ({selectedCustomerData.purchaseHistory.length})</h3>
              
              {selectedCustomerData.purchaseHistory.length > 0 ? (
                <div className="divide-y border rounded-xl">
                  {selectedCustomerData.purchaseHistory.map((s) => (
                    <div key={s._id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs font-bold text-slate-800">{s.invoiceNumber}</div>
                        <div className="text-[11px] text-gray-500">{new Date(s.createdAt).toLocaleString()} • Method: {s.paymentMethod}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-sm text-gray-900">₹{s.totalAmount.toFixed(2)}</span>
                        <button
                          onClick={() => setSelectedSaleForBill(s)}
                          className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium hover:bg-blue-100"
                        >
                          Bill
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400 text-xs">No transactions recorded for this customer yet.</div>
              )}
            </div>

            <div className="pt-3 border-t text-right">
              <button
                onClick={() => setSelectedCustomerData(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bill Receipt Modal from customer order list */}
      {selectedSaleForBill && (
        <BillModal sale={selectedSaleForBill} onClose={() => setSelectedSaleForBill(null)} />
      )}
    </div>
  );
};

export default Customers;
