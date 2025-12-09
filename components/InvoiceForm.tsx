import { InvoiceData } from '../app/page';
import { Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';

interface InvoiceFormProps {
  data: InvoiceData | null;
  onChange: (data: InvoiceData) => void;
  onSubmit: () => void;
  isExtracting: boolean;
  errors: Record<string, string>;
}

// Helper component for displaying validation errors
const ValidationError = ({ message }: { message: string }) => (
    <p className="mt-1 text-sm text-red-600 font-medium">{message}</p>
);

export function InvoiceForm({ data, onChange, onSubmit, isExtracting, errors }: InvoiceFormProps) {

  // --- Utility Functions for Totals ---
  const recalculateTotals = (currentData: InvoiceData, newItems: InvoiceData['items']) => {
    const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
    const total = subtotal + currentData.tax;
    
    onChange({ ...currentData, items: newItems, subtotal, total });
  };
  // ------------------------------------

  const handleInputChange = (field: keyof InvoiceData, value: string | number) => {
    if (data) {
      if (field === 'tax' || field === 'subtotal' || field === 'total') {
        const newValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        
        if (field === 'tax') {
            const subtotal = data.subtotal;
            const total = subtotal + newValue;
            onChange({ ...data, tax: newValue, total });
        } else {
            onChange({ ...data, [field]: newValue });
        }
        
      } else {
        onChange({ ...data, [field]: value });
      }
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    if (data) {
      const newItems = [...data.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate amount if quantity or unitPrice changes
      if (field === 'quantity' || field === 'unitPrice') {
        const quantity = parseFloat(newItems[index].quantity.toString()) || 0;
        const unitPrice = parseFloat(newItems[index].unitPrice.toString()) || 0;

        newItems[index].quantity = quantity;
        newItems[index].unitPrice = unitPrice;
        newItems[index].amount = quantity * unitPrice;
      }
      
      recalculateTotals(data, newItems);
    }
  };
  
  const handleAddItem = () => {
    if (data) {
        const newItem = { description: '', quantity: 0, unitPrice: 0, amount: 0 };
        const newItems = [...data.items, newItem];
        recalculateTotals(data, newItems);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (data) {
        const newItems = data.items.filter((_, i) => i !== index);
        recalculateTotals(data, newItems);
    }
  };

  const handleAddTax = () => {
    const taxValue = prompt("Enter Tax Amount (e.g., 15.50):");
    const numericTax = parseFloat(taxValue || '0');
    
    if (numericTax > 0 && data) {
        const newTax = data.tax + numericTax;
        const newTotal = data.subtotal + newTax;
        
        onChange({ ...data, tax: newTax, total: newTotal });
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const getInputBorderClass = (fieldName: string) => 
    errors[fieldName] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500';

  if (isExtracting) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-600">Validating form data against invoice...</p>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <Save className="w-12 h-12 text-gray-400" />
        </div>
        <p className="text-gray-600">Form is not initialized.</p>
        <p className="text-gray-400 text-sm mt-2">
          An error might have occurred or data is missing.
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
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass('invoiceNumber')}`}
              placeholder="e.g., INV-2024-001"
            />
            {errors.invoiceNumber && <ValidationError message={errors.invoiceNumber} />}
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm mb-1">Invoice Date</label>
            <input
              type="date"
              value={data.invoiceDate}
              onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass('invoiceDate')}`}
              placeholder="Select Invoice Date"
            />
            {errors.invoiceDate && <ValidationError message={errors.invoiceDate} />}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-1">Due Date</label>
          <input
            type="date"
            value={data.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass('dueDate')}`}
            placeholder="Select Due Date"
          />
          {errors.dueDate && <ValidationError message={errors.dueDate} />}
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass('vendorName')}`}
            placeholder="e.g., Acme Solutions Inc."
          />
          {errors.vendorName && <ValidationError message={errors.vendorName} />}
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-1">Vendor Email</label>
          <input
            type="email"
            value={data.vendorEmail}
            onChange={(e) => handleInputChange('vendorEmail', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass('vendorEmail')}`}
            placeholder="e.g., billing@vendor.com"
          />
          {errors.vendorEmail && <ValidationError message={errors.vendorEmail} />}
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-1">Vendor Address</label>
          <textarea
            value={data.vendorAddress}
            onChange={(e) => handleInputChange('vendorAddress', e.target.value)}
            rows={2}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass('vendorAddress')}`}
            placeholder="e.g., 100 Corporate Blvd, City, State, Zip"
          />
          {errors.vendorAddress && <ValidationError message={errors.vendorAddress} />}
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass('billToName')}`}
            placeholder="e.g., John Smith"
          />
          {errors.billToName && <ValidationError message={errors.billToName} />}
        </div>

        <div>
          <label className="block text-gray-700 text-sm mb-1">Customer Address</label>
          <textarea
            value={data.billToAddress}
            onChange={(e) => handleInputChange('billToAddress', e.target.value)}
            rows={2}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass('billToAddress')}`}
            placeholder="e.g., 456 User St, City, State, Zip"
          />
          {errors.billToAddress && <ValidationError message={errors.billToAddress} />}
        </div>
      </div>
      
      {/* Line Items */}
      <div className="space-y-4">
        <h3 className="text-indigo-900 pb-2 border-b border-gray-200">Line Items</h3>
        
        {data.items.map((item, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3 relative">
            
            {data.items.length > 0 && (
                <button 
                    type="button" 
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-1 right-1 text-red-500 hover:text-red-700 p-1 rounded-full bg-white transition-colors"
                    title="Remove Item"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            <div>
              <label className="block text-gray-700 text-sm mb-1">Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass(`items[${index}].description`)}`}
                placeholder="e.g., Consulting Service"
              />
              {errors[`items[${index}].description`] && <ValidationError message={errors[`items[${index}].description`]} />}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-700 text-sm mb-1">Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass(`items[${index}].quantity`)}`}
                  placeholder="0"
                />
                {errors[`items[${index}].quantity`] && <ValidationError message={errors[`items[${index}].quantity`]} />}
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-1">Unit Price</label>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${getInputBorderClass(`items[${index}].unitPrice`)}`}
                  placeholder="0.00"
                />
                {errors[`items[${index}].unitPrice`] && <ValidationError message={errors[`items[${index}].unitPrice`]} />}
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm mb-1">Amount</label>
                <input
                  type="number"
                  value={item.amount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-600"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        ))}
        
        {/* Add Product Button */}
        <button
            type="button"
            onClick={handleAddItem}
            className="w-full bg-indigo-50 border border-indigo-200 text-indigo-700 py-2 px-4 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
        >
            <PlusCircle className="w-5 h-5" />
            Add Product/Service
        </button>
      </div>

      {/* Totals */}
      <div className="space-y-3 bg-indigo-50 p-4 rounded-lg border-2">
        <div className="flex justify-between">
          <span className="text-gray-700">Subtotal:</span>
          <span className={`text-gray-900 ${errors.subtotal ? 'font-bold text-red-600' : ''}`}>${data.subtotal.toFixed(2)}</span>
        </div>
        {errors.subtotal && <ValidationError message={errors.subtotal} />}
        
        {/* Tax field for user to manually verify against invoice */}
        <div className="flex justify-between items-center">
            <span className="text-gray-700 flex-grow">Tax:</span>
            <div className="flex flex-col items-end">
                <input
                    type="number"
                    value={data.tax}
                    onChange={(e) => handleInputChange('tax', parseFloat(e.target.value) || 0)}
                    className={`w-28 px-2 py-1 border rounded-lg text-right ${getInputBorderClass('tax')}`}
                    placeholder="0.00"
                />
                <button
                    type="button"
                    onClick={handleAddTax}
                    className="text-xs text-indigo-600 hover:underline mt-1 flex items-center"
                >
                    <PlusCircle className="w-3 h-3 mr-1" /> Add Tax Entry
                </button>
            </div>
        </div>
        {errors.tax && <ValidationError message={errors.tax} />}
        
        <div className="flex justify-between pt-3 border-t border-indigo-200">
          <span className="text-indigo-900">Total:</span>
          <span className={`text-indigo-900 font-bold ${errors.total ? 'text-red-600' : ''}`}>${data.total.toFixed(2)}</span>
        </div>
        {errors.total && <ValidationError message={errors.total} />}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isExtracting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-indigo-400"
      >
        {isExtracting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
            <Save className="w-5 h-5" />
        )}
        {isExtracting ? 'Validating...' : 'Submit & Validate Invoice'}
      </button>
    </form>
  );
}