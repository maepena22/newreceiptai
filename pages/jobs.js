import { useEffect, useState } from 'react';
import { Progress } from 'rsuite';

function statusColor(status) {
  switch (status) {
    case 'done': return 'bg-green-100 text-green-700';
    case 'processing': return 'bg-yellow-100 text-yellow-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  // Group jobs by batch_id
  const batches = {};
  jobs.forEach(job => {
    if (!batches[job.batch_id]) batches[job.batch_id] = [];
    batches[job.batch_id].push(job);
  });

  // Expand/collapse logic
  const handleToggle = batchId => {
    setExpanded(prev => ({ ...prev, [batchId]: !prev[batchId] }));
  };
  const handleExpandAll = () => {
    const newState = {};
    Object.keys(batches).forEach(batchId => { newState[batchId] = true; });
    setExpanded(newState);
    setAllExpanded(true);
  };
  const handleCollapseAll = () => {
    setExpanded({});
    setAllExpanded(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Job Batches</h1>
        <div className="space-x-2">
          <button onClick={handleExpandAll} className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition">Expand All</button>
          <button onClick={handleCollapseAll} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Collapse All</button>
        </div>
      </div>
      {loading ? (
        <div className="text-lg text-gray-500">Loading jobs...</div>
      ) : Object.keys(batches).length === 0 ? (
        <div className="text-lg text-gray-500">No jobs found.</div>
      ) : (
        <div className="space-y-8">
          {Object.entries(batches).map(([batchId, jobs]) => {
            const batchProgress = Math.round(jobs.reduce((acc, j) => acc + (j.progress || 0), 0) / jobs.length);
            const batchStatus = jobs.every(j => j.status === 'done')
              ? 'done'
              : jobs.some(j => j.status === 'failed')
                ? 'failed'
                : jobs.some(j => j.status === 'processing')
                  ? 'processing'
                  : 'pending';
            const isOpen = expanded[batchId] || allExpanded;
            return (
              <div key={batchId} className="bg-white shadow-xl rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-red-50 rounded-t-2xl transition" onClick={() => handleToggle(batchId)}>
                  <div className="flex items-center gap-4">
                    <button
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition focus:outline-none focus:ring-2 focus:ring-red-200"
                      aria-label={isOpen ? 'Collapse batch' : 'Expand batch'}
                      tabIndex={0}
                    >
                      <span className={`transform transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                    </button>
                    <span className="text-lg font-bold text-gray-700">Batch #{batchId}</span>
                    <span className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${statusColor(batchStatus)}`}>{batchStatus.toUpperCase()}</span>
                  </div>
                  <div className="w-64">
                    <Progress percent={batchProgress} showInfo={true} strokeColor="#ef4444" />
                  </div>
                </div>
                {isOpen && (
                  <div className="overflow-x-auto px-6 pb-6">
                    <table className="min-w-full text-sm border-separate border-spacing-y-1">
                      <thead className="sticky top-0 z-10 bg-white/90">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">Job ID</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">Uploader</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">Status</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">Progress</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">Created</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map(job => (
                          <tr key={job.id} className="bg-gray-50 hover:bg-red-50 transition rounded-xl shadow-sm">
                            <td className="px-4 py-3 font-mono border-b border-gray-100">{job.id}</td>
                            <td className="px-4 py-3 border-b border-gray-100">{job.uploader_name}</td>
                            <td className="px-4 py-3 border-b border-gray-100">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(job.status)}`}>{job.status.toUpperCase()}</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-100">
                              <Progress percent={job.progress} showInfo={false} strokeColor="#ef4444" />
                              <span className="ml-2 text-xs text-gray-500">{job.progress}%</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-100">{job.created_at}</td>
                            <td className="px-4 py-3 border-b border-gray-100">{job.updated_at}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 