"use client";

import { useState } from "react";
import { InvoiceUpload } from "../components/InvoiceUpload";
import { InvoiceForm } from "../components/InvoiceForm";
import { FileText } from "lucide-react";

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

export default function Home() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  function normalizeInvoiceData(raw: any): InvoiceData {
    return {
      invoiceNumber: raw.invoiceNumber ?? "",
      invoiceDate: raw.invoiceDate ?? "",
      dueDate: raw.dueDate ?? "",
      vendorName: raw.vendor?.name ?? raw.vendorName ?? "",
      vendorEmail: raw.vendor?.email ?? raw.vendorEmail ?? "",
      vendorAddress: raw.vendor?.address ?? raw.vendorAddress ?? "",
      billToName: raw.customer?.name ?? raw.billToName ?? "",
      billToAddress: raw.customer?.address ?? raw.billToAddress ?? "",

      items: Array.isArray(raw.items)
        ? raw.items.map((item: any) => ({
            description: item.description ?? "",
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unitPrice) || 0,
            amount: Number(item.amount) || 0,
          }))
        : [],

      subtotal:
        Number(raw.subtotal) ||
        (Array.isArray(raw.items)
          ? raw.items.reduce(
              (sum: number, it: any) => sum + (Number(it.amount) || 0),
              0
            )
          : 0),

      tax: Number(raw.tax) || 0,
      total: Number(raw.total) || 0,
    };
  }

  const handleImageUpload = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setIsExtracting(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/extract", {
      method: "POST",
      body: formData,
    });

    const raw = await res.json();

    const clean: InvoiceData = normalizeInvoiceData(raw);

    setInvoiceData(clean);
    setIsExtracting(false);
  };

  const handleFormChange = (data: InvoiceData) => {
    setInvoiceData(data);
  };

  const handleReset = () => {
    setInvoiceData(null);
    setUploadedImage(null);
    setIsExtracting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-indigo-600 p-3 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-indigo-900">AI Invoice Data Extractor</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your invoice image and let AI automatically extract and fill
            in the details
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-indigo-900 mb-4">Upload Invoice</h2>
            <InvoiceUpload
              onUpload={handleImageUpload}
              uploadedImage={uploadedImage}
              isExtracting={isExtracting}
              onReset={handleReset}
            />
          </div>

          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-indigo-900 mb-4">Extracted Data</h2>
            <InvoiceForm
              data={invoiceData}
              onChange={handleFormChange}
              isExtracting={isExtracting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
