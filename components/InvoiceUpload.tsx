import { useRef, useState } from "react";
import { Upload, X, CheckCircle2, FileText } from "lucide-react";

interface InvoiceUploadProps {
  onUpload: (file: File) => void;
  uploadedImage: string | null;
  onReset: () => void;
}

export function InvoiceUpload({
  onUpload,
  uploadedImage,
  onReset,
}: InvoiceUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {!uploadedImage ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
            transition-all duration-200 h-96 flex flex-col items-center justify-center
            ${
              isDragging
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
            }
          `}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="bg-indigo-100 p-4 rounded-full">
              <Upload className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-700 mb-1">
                Drop your invoice here or click to browse
              </p>
              <p className="text-gray-500 text-sm">
                Supports PNG, JPG, PDF (max 10MB)
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
            {/* Display uploaded image/PDF placeholder */}
            {uploadedImage.endsWith('.pdf') ? (
                <div className="w-full h-96 flex items-center justify-center bg-gray-50 text-gray-500">
                    <FileText className="w-12 h-12 mr-2" />
                    PDF File Uploaded (Preview not available)
                </div>
            ) : (
                <img
                    src={uploadedImage}
                    alt="Uploaded invoice"
                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                />
            )}

            <button
              onClick={onReset}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-blue-900">Invoice document uploaded!</p>
                <p className="text-blue-600 text-sm">
                  Review and edit the form, then click **Submit & Validate** below.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}