import { InvoiceData } from '../app/page';
import { Loader2, Save } from 'lucide-react';

interface InvoiceFormProps {
  data: InvoiceData | null;
  onChange: (data: InvoiceData) => void;
  isExtracting: boolean;
}

export function InvoiceForm({ data, onChange, isExtracting }: InvoiceFormProps) {
  const handleInputChange = (field: keyof InvoiceData, value: string | number) => {
    if (data) {
      onChange({ ...data, [field]: value });
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    if (data) {
      const newItems = [...data.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate amount if quantity or unitPrice changes
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
      }
      
      // Recalculate totals
      const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;
      
      onChange({ ...data, items: newItems, subtotal, tax, total });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data) {
      alert('Form submitted successfully!\n\n' + JSON.stringify(data, null, 2));
    }
  };

  if (isExtracting) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Processing invoice...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <Save className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-gray-600">Upload an invoice to get started</p>
        <p className="text-gray-400 text-sm mt-2">
          The form will auto-fill with extracted data
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-indigo-900 pb-2 border-b border-gray-200">Basic Information</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm mb-1">Invoice Number</label>
            <input
              type="text"
              value={data.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm mb-1">Invoice Date</label>
            <input
              type="date"
              value={data.invoiceDate}
              onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-1">Due Date</label>
          <input
            type="date"
            value={data.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Vendor Information */}
      <div className="space-y-4">
        <h3 className="text-indigo-900 pb-2 border-b border-gray-200">Vendor Information</h3>
        
        <div>
          <label className="block text-gray-700 text-sm mb-1">Vendor Name</label>
          <input
            type="text"
            value={data.vendorName}
            onChange={(e) => handleInputChange('vendorName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-1">Vendor Email</label>
          <input
            type="email"
            value={data.vendorEmail}
            onChange={(e) => handleInputChange('vendorEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-1">Vendor Address</label>
          <textarea
            value={data.vendorAddress}
            onChange={(e) => handleInputChange('vendorAddress', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Bill To Information */}
      <div className="space-y-4">
        <h3 className="text-indigo-900 pb-2 border-b border-gray-200">Bill To</h3>
        
        <div>
          <label className="block text-gray-700 text-sm mb-1">Customer Name</label>
          <input
            type="text"
            value={data.billToName}
            onChange={(e) => handleInputChange('billToName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-1">Customer Address</label>
          <textarea
            value={data.billToAddress}
            onChange={(e) => handleInputChange('billToAddress', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-4">
        <h3 className="text-indigo-900 pb-2 border-b border-gray-200">Line Items</h3>
        
        {data.items.map((item, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div>
              <label className="block text-gray-700 text-sm mb-1">Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-700 text-sm mb-1">Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-1">Unit Price</label>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-1">Amount</label>
                <input
                  type="number"
                  value={item.amount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3 bg-indigo-50 p-4 rounded-lg">
        <div className="flex justify-between">
          <span className="text-gray-700">Subtotal:</span>
          <span className="text-gray-900">${data.subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-700">Tax (10%):</span>
          <span className="text-gray-900">${data.tax.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between pt-3 border-t border-indigo-200">
          <span className="text-indigo-900">Total:</span>
          <span className="text-indigo-900">${data.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        Save Invoice
      </button>
    </form>
  );
}
