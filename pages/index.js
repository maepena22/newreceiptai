import { useState } from 'react';

export default function Home() {
  const [files, setFiles] = useState([]);
  const [uploaderName, setUploaderName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('uploader_name', uploaderName);
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 bg-gradient-to-br from-red-50 via-white to-blue-50">
      <section className="w-full max-w-5xl mx-auto text-center mb-12 animate-fade-in">
        <h1 className="text-5xl font-extrabold text-red-700 mb-4 tracking-tight">Japanese Receipt OCR SaaS</h1>
        <p className="text-lg text-gray-700 mb-6">Effortlessly extract, organize, and manage your Japanese receipts with AI-powered OCR and GPT. Upload in bulk, track progress, and export results—all in a beautiful SaaS dashboard.</p>
      </section>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center animate-fade-in-up">
        {/* Illustration removed for cleaner look */}
        <div className="flex-1 w-full">
          <div className="bg-white shadow-2xl rounded-3xl p-12 border border-gray-100 mx-auto max-w-xl">
            <div className="mb-8 flex items-center gap-4 justify-center">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-700 font-bold">1</span>
                <span className="font-semibold text-gray-700">Enter Name</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200 mx-2" />
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-700 font-bold">2</span>
                <span className="font-semibold text-gray-700">Select Images</span>
              </div>
              <div className="w-8 h-0.5 bg-gray-200 mx-2" />
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-700 font-bold">3</span>
                <span className="font-semibold text-gray-700">Upload</span>
              </div>
            </div>
            <form onSubmit={handleUpload} className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-semibold">Uploader Name</label>
                <input
                  type="text"
                  placeholder="Uploader Name"
                  value={uploaderName}
                  onChange={e => setUploaderName(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-200 focus:outline-none"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-700 font-semibold">Select Receipt Images</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-red-200 rounded-xl cursor-pointer bg-red-50 hover:bg-red-100 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={e => setFiles(e.target.files)}
                    className="hidden"
                  />
                  <span className="text-red-600 font-medium mb-2">Click or drag files here</span>
                  <span className="text-sm text-gray-500">{files.length ? `${files.length} file(s) selected` : 'No file selected'}</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={!files.length || !uploaderName || loading}
                className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow transition disabled:opacity-50 text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : 'Upload and Extract'}
              </button>
            </form>
            {result && (
              <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-6 text-base overflow-x-auto animate-fade-in">
                <h3 className="text-xl font-semibold mb-3 text-blue-700">Upload Complete</h3>
                <p className="mb-2 text-gray-700">Your file(s) are being processed asynchronously.</p>
                <p className="mb-2 text-gray-700">Check the <a href="/jobs" className="text-blue-600 underline">Jobs page</a> for status and results.</p>
                {result.batchId && (
                  <div className="mb-2"><strong>Batch ID:</strong> {result.batchId}</div>
                )}
                {result.jobIds && (
                  <div><strong>Job IDs:</strong> {result.jobIds.join(', ')}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}