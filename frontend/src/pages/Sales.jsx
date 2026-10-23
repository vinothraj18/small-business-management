import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  CreditCard, 
  UserPlus, 
  CheckCircle, 
  Search, 
  History, 
  Eye 
} from 'lucide-react';
import BillModal from '../components/BillModal';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' or 'history'

  // POS Cart State
  const [cartItems, setCartItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedSale, setGeneratedSale] = useState(null);

  const loadData = async () => {
    try {
      const [prodRes, custRes, salesRes] = await Promise.all([
        API.get('/products'),
        API.get('/customers'),
        API.get('/sales')
      ]);
      setProducts(prodRes.data);
      setCustomers(custRes.data);
      setSalesHistory(salesRes.data);
    } catch (err) {
      console.error('Error fetching POS data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddToCart = () => {
    setError('');
    if (!selectedProductId) {
      setError('Please select a product');
      return;
    }

    const prod = products.find(p => p._id === selectedProductId);
    if (!prod) return;

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be at least 1');
      return;
    }

    if (prod.stockQuantity < qty) {
      setError(`Insufficient stock for ${prod.name}. Available: ${prod.stockQuantity}`);
      return;
    }

    // Check if item already in cart
    const existingIndex = cartItems.findIndex(item => item.productId === prod._id);
    if (existingIndex > -1) {
      const updated = [...cartItems];
      const newQty = updated[existingIndex].quantity + qty;
      if (prod.stockQuantity < newQty) {
        setError(`Cannot add more ${prod.name}. Only ${prod.stockQuantity} in stock.`);
        return;
      }
      updated[existingIndex].quantity = newQty;
      updated[existingIndex].subtotal = newQty * prod.price;
      setCartItems(updated);
    } else {
      setCartItems([
        ...cartItems,
        {
          productId: prod._id,
          name: prod.name,
          unitPrice: prod.price,
          quantity: qty,
          subtotal: qty * prod.price,
          availableStock: prod.stockQuantity
        }
      ]);
    }

    setSelectedProductId('');
    setQuantity(1);
  };

  const handleRemoveFromCart = (index) => {
    const updated = [...cartItems];
    updated.splice(index, 1);
    setCartItems(updated);
  };

  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (custId) {
      const cust = customers.find(c => c._id === custId);
      if (cust) {
        setCustomerName(cust.name);
        setCustomerPhone(cust.phone);
      }
    } else {
      setCustomerName('');
      setCustomerPhone('');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Cart is empty. Add products to complete sale.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        customerId: selectedCustomerId || null,
        customerName: customerName || 'Walk-in Customer',
        customerPhone: customerPhone || '',
        paymentMethod
      };

      const { data } = await API.post('/sales', payload);
      setGeneratedSale(data);

      // Reset cart and reload inventory
      setCartItems([]);
      setSelectedCustomerId('');
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('Cash');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale & Billing</h1>
          <p className="text-xs text-gray-500 mt-1">Record sales, automatically deduct stock, and print customer bills</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-200/80 p-1 rounded-xl w-fit text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'pos' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>New Transaction</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'history' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Sales History</span>
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Product Selector & Cart */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Product Selector Box */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Product from Inventory</h2>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option 
                        key={p._id} 
                        value={p._id}
                        disabled={p.stockQuantity <= 0}
                      >
                        {p.name} - ₹{p.price.toFixed(2)} ({p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'OUT OF STOCK'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Qty"
                    className="w-20 px-3 py-2.5 bg-gray-50 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center space-x-1 transition-all shadow-md shadow-blue-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Cart Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Cart Items ({cartItems.length})</h2>
              
              {cartItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-gray-400 font-semibold uppercase">
                        <th className="pb-2">Item Name</th>
                        <th className="pb-2 text-right">Price</th>
                        <th className="pb-2 text-center">Qty</th>
                        <th className="pb-2 text-right">Subtotal</th>
                        <th className="pb-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {cartItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="py-3 font-semibold text-gray-900">{item.name}</td>
                          <td className="py-3 text-right text-gray-600">₹{item.unitPrice.toFixed(2)}</td>
                          <td className="py-3 text-center font-bold text-gray-800">{item.quantity}</td>
                          <td className="py-3 text-right font-extrabold text-blue-600">₹{item.subtotal.toFixed(2)}</td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleRemoveFromCart(idx)}
                              className="text-red-500 hover:text-red-700 p-1"
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
                <div className="py-8 text-center text-gray-400 text-xs">
                  Cart is empty. Select products above to add to cart.
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Customer Details & Checkout */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider pb-2 border-b">
                Customer & Payment Details
              </h2>

              {/* Existing Customer Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Select Existing Customer (Optional)</label>
                <select
                  value={selectedCustomerId}
                  onChange={handleCustomerSelect}
                  className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Walk-in / New Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name & Phone */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Payment Method selector */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'UPI', 'Card'].map((pm) => (
                    <button
                      type="button"
                      key={pm}
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        paymentMethod === pm
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Price & Checkout Button */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase">Total Price</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || cartItems.length === 0}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2 text-sm transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                <span>{loading ? 'Processing Sale...' : 'Complete Sale & Generate Bill'}</span>
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* Sales History Tab */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Past Sales Transactions</h2>
          {salesHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesHistory.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">{s.invoiceNumber}</td>
                      <td className="py-3 px-4 text-gray-500">{new Date(s.createdAt).toLocaleString()}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">{s.customerName || 'Walk-in'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase border border-blue-100">
                          {s.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-gray-900">₹{s.totalAmount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setGeneratedSale(s)}
                          className="px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Bill</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs">No sales recorded yet.</div>
          )}
        </div>
      )}

      {/* Bill Receipt Modal */}
      {generatedSale && (
        <BillModal sale={generatedSale} onClose={() => setGeneratedSale(null)} />
      )}
    </div>
  );
};

export default Sales;
