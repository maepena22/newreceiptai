import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from '../lib/useTranslation';

export default function Upload() {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (res.ok) return res.json();
      throw new Error('Not authenticated');
    }).then(data => setUser(data.user)).catch(() => {
      setUser(null);
      router.replace('/login');
    });
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    const formData = new FormData();
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
        <h1 className="text-5xl font-extrabold text-red-700 mb-4 tracking-tight">{t('pages.upload.title')}</h1>
        <p className="text-lg text-gray-700 mb-6">{t('pages.upload.subtitle')}</p>
      </section>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center animate-fade-in-up">
        <div className="flex-1 w-full">
          <div className="bg-white shadow-2xl rounded-3xl p-12 border border-gray-100 mx-auto max-w-xl">
            {user ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div className="text-gray-700 font-semibold">{t('pages.upload.loggedInAs')} {user.email}</div>
                </div>
                <form onSubmit={handleUpload} className="flex flex-col gap-8">
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-700 font-semibold">{t('pages.upload.selectImages')}</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-red-200 rounded-xl cursor-pointer bg-red-50 hover:bg-red-100 transition">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={e => setFiles(e.target.files)}
                        className="hidden"
                      />
                      <span className="text-red-600 font-medium mb-2">{t('pages.upload.clickOrDrag')}</span>
                      <span className="text-sm text-gray-500">{files.length ? `${files.length} ${t('pages.upload.filesSelected')}` : t('pages.upload.noFileSelected')}</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={!files.length || loading}
                    className="bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white font-semibold py-3 rounded-xl shadow transition disabled:opacity-50 text-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        {t('pages.upload.processing')}
                      </span>
                    ) : t('pages.upload.uploadAndExtract')}
                  </button>
                </form>
                {result && (
                  <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-6 text-base overflow-x-auto animate-fade-in">
                    <h3 className="text-xl font-semibold mb-3 text-blue-700">{t('pages.upload.uploadComplete')}</h3>
                    <p className="mb-2 text-gray-700">{t('pages.upload.processingAsync')}</p>
                    <p className="mb-2 text-gray-700">{t('pages.upload.checkJobsPage')} <a href="/jobs" className="text-blue-600 underline">Jobs page</a> for status and results.</p>
                    {result.batchId && (
                      <div className="mb-2"><strong>{t('pages.upload.batchId')}</strong> {result.batchId}</div>
                    )}
                    {result.jobIds && (
                      <div><strong>{t('pages.upload.jobIds')}</strong> {result.jobIds.join(', ')}</div>
                    )}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
} 