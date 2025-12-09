"use client";

import { useState } from "react";
import { InvoiceUpload } from "../components/InvoiceUpload";
import { InvoiceForm } from "../components/InvoiceForm";
import { FileText } from "lucide-react";
import { Buffer } from "buffer"; // Ensure Buffer is imported

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  vendorName: string;
  vendorEmail: string;
  vendorAddress: string;
  billToName: string;
  billToAddress: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}

const emptyItem = {
    description: '',
    quantity: 0,
    unitPrice: 0,
    amount: 0,
};

// Initial state with empty values, but one line item to ensure form visibility.
const initialInvoice: InvoiceData = {
  invoiceNumber: "",
  invoiceDate: "",
  dueDate: "",
  vendorName: "",
  vendorEmail: "",
  vendorAddress: "",
  billToName: "",
  billToAddress: "",
  items: [emptyItem], // Start with one empty item
  subtotal: 0.00,
  tax: 0.00,
  total: 0.00,
};

export default function Home() {
  const [formData, setFormData] = useState<InvoiceData>(initialInvoice);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(false);

  const handleUpload = (file: File) => {
    setUploadedFile(file);
    setUploadedImage(URL.createObjectURL(file));
    setValidationErrors({});
  };

  const handleReset = () => {
    setUploadedFile(null);
    setUploadedImage(null);
    setValidationErrors({});
    setFormData(initialInvoice);
  };

  // SUBMISSION/VALIDATION LOGIC
  const handleSubmit = async () => {
    if (!uploadedFile) {
      alert("Please upload an invoice image before submitting for validation.");
      return;
    }

    setLoading(true);
    setValidationErrors({});

    try {
      const buffer = await uploadedFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      const res = await fetch("/api/extract", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          imageBase64: base64,
          fileType: uploadedFile.type,
        }),
      });
      
      const json = await res.json();

      if (res.status === 400 && json.errors) {
        setValidationErrors(json.errors);
        alert("Validation failed. Please check the form for errors.");
      } else if (res.ok) {
        alert("Validation successful! Form data matches the invoice image.");
      } else {
        alert(`An error occurred during validation: ${json.error || 'Unknown error'}`);
      }

    } catch (error) {
        console.error("Submission error:", error);
        alert("An unexpected error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-indigo-900">AI Invoice Validator</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Fill the form manually → Upload invoice → AI validates accuracy on submit
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-indigo-900 mb-4">Invoice Form</h2>
            <InvoiceForm
              data={formData}
              errors={validationErrors}
              onChange={setFormData}
              onSubmit={handleSubmit}
              isExtracting={loading}
            />
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 order-first lg:order-last">
            <h2 className="text-indigo-900 mb-4">Invoice Upload</h2>
            <InvoiceUpload
              onUpload={handleUpload}
              uploadedImage={uploadedImage}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </div>
  );
}