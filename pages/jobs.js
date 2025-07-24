import { useEffect, useState, useRef } from 'react';
import { Progress } from 'rsuite';
import { useRouter } from 'next/router';

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
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const scrollContainerRef = useRef(null);
  const savedScrollPosition = useRef(0);

  const fetchJobs = async () => {
    // Save current scroll position
    if (scrollContainerRef.current) {
      savedScrollPosition.current = scrollContainerRef.current.scrollTop;
    }
    
    setLoading(true);
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setLoading(false);
    
    // Only update if data is different
    if (JSON.stringify(jobs) !== JSON.stringify(data)) {
      setJobs(data);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me').then(res => {
      if (res.ok) return res.json();
      throw new Error('Not authenticated');
    }).then(data => setUser(data.user)).catch(() => {
      setUser(null);
      router.replace('/login');
    });
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, []);

  // Restore scroll position after jobs update
  useEffect(() => {
    if (scrollContainerRef.current && savedScrollPosition.current > 0) {
      scrollContainerRef.current.scrollTop = savedScrollPosition.current;
    }
  }, [jobs]);

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

  const handleJobClick = async (jobId) => {
    try {
      const res = await fetch(`/api/jobs?id=${jobId}`);
      const job = await res.json();
      setSelectedJob(job);
      setShowJobModal(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  const formatError = (error) => {
    if (!error) return '';
    
    // Split error into lines for better display
    const lines = error.split('\n');
    return lines.map((line, index) => (
      <div key={index} className="font-mono text-xs">
        {line}
      </div>
    ));
  };

  // Only render the jobs UI if user is authenticated
  if (!user) return null;

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
        <div 
          className="space-y-8 overflow-y-auto" 
          ref={scrollContainerRef}
          style={{ maxHeight: 'calc(100vh - 200px)' }}
        >
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
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">Error</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">Created</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map(job => (
                          <tr key={job.id} className="bg-gray-50 hover:bg-red-50 transition rounded-xl shadow-sm">
                            <td className="px-4 py-3 font-mono border-b border-gray-100">
                              <button 
                                onClick={() => handleJobClick(job.id)}
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {job.id}
                              </button>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-100">{job.uploader_name}</td>
                            <td className="px-4 py-3 border-b border-gray-100">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(job.status)}`}>{job.status.toUpperCase()}</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-100">
                              <Progress percent={job.progress} showInfo={false} strokeColor="#ef4444" />
                              <span className="ml-2 text-xs text-gray-500">{job.progress}%</span>
                            </td>
                            <td className="px-4 py-3 border-b border-gray-100">
                              {job.error ? (
                                <div className="max-w-xs">
                                  <div className="text-red-600 text-xs font-semibold">Error:</div>
                                  <div className="text-xs text-gray-700 truncate" title={job.error}>
                                    {job.error.split('\n')[0]}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">-</span>
                              )}
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

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Job Details - #{selectedJob.id}</h2>
              <button 
                onClick={() => setShowJobModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Basic Information</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Uploader:</strong> {selectedJob.uploader_name}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${statusColor(selectedJob.status)}`}>
                      {selectedJob.status.toUpperCase()}
                    </span>
                  </div>
                  <div><strong>Progress:</strong> {selectedJob.progress}%</div>
                  <div><strong>File Path:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{selectedJob.file_path}</code></div>
                  <div><strong>Created:</strong> {selectedJob.created_at}</div>
                  <div><strong>Updated:</strong> {selectedJob.updated_at}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Results</h3>
                {selectedJob.result && (
                  <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                    <pre>{selectedJob.result}</pre>
                  </div>
                )}
              </div>
            </div>

            {selectedJob.error && (
              <div>
                <h3 className="font-semibold text-red-700 mb-2">Error Details</h3>
                <div className="bg-red-50 border border-red-200 p-4 rounded text-sm">
                  {formatError(selectedJob.error)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 