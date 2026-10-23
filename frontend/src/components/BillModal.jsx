import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';

const BillModal = ({ sale, onClose }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadText = () => {
    const content = `
========================================
             OFFICIAL RECEIPT
========================================
Invoice #: ${sale.invoiceNumber}
Date: ${new Date(sale.createdAt).toLocaleString()}
Payment Method: ${sale.paymentMethod}

CUSTOMER DETAILS:
Name: ${sale.customerName || 'Walk-in Customer'}
Phone: ${sale.customerPhone || 'N/A'}

ITEMS PURCHASED:
----------------------------------------
${sale.items.map(item => `${item.name} x${item.quantity} @ ₹${item.unitPrice.toFixed(2)} = ₹${item.subtotal.toFixed(2)}`).join('\n')}
----------------------------------------
TOTAL AMOUNT: ₹${sale.totalAmount.toFixed(2)}
========================================
       Thank you for your business!
========================================
    `;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${sale.invoiceNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header no-print */}
        <div className="no-print p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2 text-emerald-600 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Sale Completed Successfully</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-bill" className="p-6 overflow-y-auto flex-1 bg-white text-gray-800">
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">Small Business Store</h2>
            <p className="text-xs text-gray-500">Retail & Supply Invoice</p>
            <div className="mt-2 inline-block bg-slate-100 text-slate-700 font-mono text-xs px-2 py-1 rounded">
              {sale.invoiceNumber}
            </div>
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4 text-xs mb-4 pb-4 border-b">
            <div>
              <span className="text-gray-400 block">Date & Time</span>
              <span className="font-medium text-gray-700">
                {new Date(sale.createdAt || Date.now()).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-400 block">Payment Method</span>
              <span className="font-semibold text-blue-600 uppercase">{sale.paymentMethod}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Customer Name</span>
              <span className="font-medium text-gray-800">{sale.customerName || 'Walk-in Customer'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Customer Phone</span>
              <span className="font-medium text-gray-800">{sale.customerPhone || 'N/A'}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-xs text-left mb-4">
            <thead>
              <tr className="border-b text-gray-400">
                <th className="py-2">Item</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sale.items && sale.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 font-medium text-gray-800">{item.name}</td>
                  <td className="py-2 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-2 text-right text-gray-600">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="py-2 text-right font-semibold text-gray-900">₹{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total Row */}
          <div className="border-t-2 border-slate-900 pt-3 flex justify-between items-center text-sm">
            <span className="font-bold text-gray-900 uppercase">Grand Total</span>
            <span className="text-lg font-extrabold text-slate-900">
              ₹{sale.totalAmount ? sale.totalAmount.toFixed(2) : '0.00'}
            </span>
          </div>

          <div className="mt-6 text-center text-[10px] text-gray-400 border-t pt-4">
            Thank you for shopping with us! Please keep this receipt for your records.
          </div>
        </div>

        {/* Action Buttons no-print */}
        <div className="no-print p-4 bg-gray-50 border-t flex space-x-3">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
          <button
            onClick={handleDownloadText}
            className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Bill</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillModal;
