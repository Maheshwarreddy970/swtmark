'use client';

import { useState } from 'react';
import { uploadCSV } from '@/actions/upload-csv';

export default function UploadForm() {
  const [state, setState] = useState<{
    loading: boolean;
    success: boolean;
    error?: string;
    count?: number;
  }>({ loading: false, success: false });

  const handleSubmit = async (formData: FormData) => {
    setState({ loading: true, success: false });
    const result = await uploadCSV(formData);
    
    if (result.success) {
      setState({ loading: false, success: true, count: result.count });
      setTimeout(() => window.location.href = "/dashboard", 2000);
    } else {
      setState({ loading: false, success: false, error: result.error });
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <form action={handleSubmit} className="space-y-4">
        {/* List Name Input */}
        <div>
          <label htmlFor="listName" className="block mb-2 font-medium">
            List Name *
          </label>
          <input
            type="text"
            id="listName"
            name="listName"
            required
            className="w-full p-2 border rounded"
            placeholder="e.g., 25 List"
            disabled={state.loading}
          />
        </div>

        {/* CSV File Input */}
        <div>
          <label htmlFor="csvFile" className="block mb-2 font-medium">
            Select CSV File *
          </label>
          <input
            type="file"
            id="csvFile"
            name="csvFile"
            accept=".csv"
            required
            className="w-full p-2 border rounded"
            disabled={state.loading}
          />
        </div>

        <button
          type="submit"
          disabled={state.loading}
          className={`px-4 py-2 rounded text-white ${
            state.loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {state.loading ? 'Uploading...' : 'Upload'}
        </button>

        {state.error && (
          <p className="text-red-500">{state.error}</p>
        )}
        {state.success && (
          <p className="text-green-600">
            Success! Uploaded {state.count} records to Redirecting...
          </p>
        )}
      </form>
    </div>
  );
}