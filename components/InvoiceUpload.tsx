import { useRef, useState } from 'react';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';

interface InvoiceUploadProps {
  onUpload: (file: File) => void;
  uploadedImage: string | null;
  isExtracting: boolean;
  onReset: () => void;
}

export function InvoiceUpload({ onUpload, uploadedImage, isExtracting, onReset }: InvoiceUploadProps) {
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
    if (file && file.type.startsWith('image/')) {
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
            transition-all duration-200
            ${isDragging
              ? 'border-indigo-600 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
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
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
            <img
              src={uploadedImage}
              alt="Uploaded invoice"
              className="w-full h-auto max-h-96 object-contain bg-gray-50"
            />
            {!isExtracting && (
              <button
                onClick={onReset}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {isExtracting && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <div>
                  <p className="text-indigo-900">Extracting data...</p>
                  <p className="text-indigo-600 text-sm">AI is analyzing your invoice</p>
                </div>
              </div>
            </div>
          )}

          {!isExtracting && uploadedImage && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-green-900">Data extracted successfully!</p>
                  <p className="text-green-600 text-sm">Review and edit the form as needed</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
