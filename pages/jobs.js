import { useEffect, useState, useRef, useCallback } from 'react';
import { Progress } from 'rsuite';
import { useRouter } from 'next/router';
import { useTranslation } from '../lib/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';

function statusColor(status) {
  switch (status) {
    case 'done': return 'bg-green-100 text-green-700';
    case 'processing': return 'bg-yellow-100 text-yellow-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function statusIcon(status) {
  switch (status) {
    case 'done': return '✅';
    case 'processing': return '⏳';
    case 'failed': return '❌';
    default: return '⏸️';
  }
}

export default function JobsPage() {
  const { t, loading: translationLoading, currentLocale, translations } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [user, setUser] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);
  const router = useRouter();
  const eventSourceRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const savedScrollPosition = useRef(0);

  // SSE connection for real-time updates
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      eventSourceRef.current = new EventSource('/api/jobs/sse');
      
      eventSourceRef.current.onopen = () => {
        setConnectionStatus('connected');
        console.log('SSE connected');
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'jobs_update') {
            // Save current scroll position
            if (scrollContainerRef.current) {
              savedScrollPosition.current = scrollContainerRef.current.scrollTop;
            }

            // Update jobs with smooth transition
            setJobs(prevJobs => {
              const newJobs = data.jobs;
              
              // Only update if data is actually different
              if (JSON.stringify(prevJobs) !== JSON.stringify(newJobs)) {
                setLastUpdate(new Date());
                return newJobs;
              }
              return prevJobs;
            });

            // Restore scroll position after a brief delay
            setTimeout(() => {
              if (scrollContainerRef.current && savedScrollPosition.current > 0) {
                scrollContainerRef.current.scrollTop = savedScrollPosition.current;
              }
            }, 50);
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        console.error('SSE error:', error);
        setConnectionStatus('error');
        
        // Reconnect after 5 seconds
        setTimeout(() => {
          if (connectionStatus !== 'connected') {
            connectSSE();
          }
        }, 5000);
      };

      eventSourceRef.current.onclose = () => {
        setConnectionStatus('disconnected');
        console.log('SSE disconnected');
      };
    } catch (error) {
      console.error('Failed to connect to SSE:', error);
      setConnectionStatus('error');
    }
  }, [connectionStatus]);

  // Initial data fetch
  const fetchInitialJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching initial jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    fetch('/api/auth/me').then(res => {
      if (res.ok) return res.json();
      throw new Error('Not authenticated');
    }).then(data => setUser(data.user)).catch(() => {
      setUser(null);
      router.replace('/login');
    });
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchInitialJobs();
      connectSSE();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [user, connectSSE]);

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
    
    const lines = error.split('\n');
    return lines.map((line, index) => (
      <div key={index} className="font-mono text-xs">
        {line}
      </div>
    ));
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };


  
  // Debug: Check if translations are loaded
  console.log('Translations loaded:', Object.keys(translations || {}));
  console.log('Jobs translations:', translations?.pages?.jobs);
  console.log('Translation test - pages.jobs.title:', t('pages.jobs.title'));
  console.log('Translation test - pages.jobs.loading:', t('pages.jobs.loading'));
  
  // Only render the jobs UI if user is authenticated and translations are loaded
  if (!user || translationLoading) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-500">Loading translations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header with connection status */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-extrabold text-gray-800">{t('pages.jobs.title')}</h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' : 
              connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {connectionStatus === 'connected' ? t('pages.jobs.connected') :
               connectionStatus === 'connecting' ? t('pages.jobs.connecting') : t('pages.jobs.disconnected')}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              {t('pages.jobs.lastUpdate')}: {formatTime(lastUpdate)}
            </span>
          )}
          <div className="space-x-2">
            <button 
              onClick={handleExpandAll} 
              className="px-4 py-2 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition-colors"
            >
              {t('pages.jobs.expandAll')}
            </button>
            <button 
              onClick={handleCollapseAll} 
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            >
              {t('pages.jobs.collapseAll')}
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-lg text-gray-500">{t('pages.jobs.loading')}</div>
        </motion.div>
      ) : Object.keys(batches).length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-lg text-gray-500">{t('pages.jobs.noJobs')}</div>
        </motion.div>
      ) : (
        <motion.div 
          className="space-y-6 overflow-y-auto" 
          ref={scrollContainerRef}
          style={{ maxHeight: 'calc(100vh - 200px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence>
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
                <motion.div 
                  key={batchId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white shadow-xl rounded-2xl border border-gray-100 hover:shadow-2xl transition-shadow"
                >
                  <div 
                    className="flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-red-50 rounded-t-2xl transition-colors" 
                    onClick={() => handleToggle(batchId)}
                  >
                    <div className="flex items-center gap-4">
                      <motion.button
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
                        aria-label={isOpen ? t('jobs.collapseBatch') : t('jobs.expandBatch')}
                        tabIndex={0}
                        animate={{ rotate: isOpen ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        ▶
                      </motion.button>
                      <span className="text-lg font-bold text-gray-700">{t('pages.jobs.batch')} #{batchId}</span>
                      <span className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${statusColor(batchStatus)}`}>
                        {statusIcon(batchStatus)} {batchStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="w-64">
                      <Progress 
                        percent={batchProgress} 
                        showInfo={true} 
                        strokeColor="#ef4444"
                        trailColor="#f3f4f6"
                      />
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="overflow-x-auto px-6 pb-6">
                          <table className="min-w-full text-sm border-separate border-spacing-y-1">
                            <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm">
                              <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">{t('pages.jobs.jobId')}</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">{t('pages.jobs.uploader')}</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">{t('pages.jobs.status')}</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">{t('pages.jobs.progress')}</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">{t('pages.jobs.error')}</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">{t('pages.jobs.created')}</th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 border-b border-gray-100">{t('pages.jobs.updated')}</th>
                              </tr>
                            </thead>
                            <tbody>
                              <AnimatePresence>
                                {jobs.map((job, index) => (
                                  <motion.tr 
                                    key={job.id} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className="bg-gray-50 hover:bg-red-50 transition-colors rounded-xl shadow-sm"
                                  >
                                    <td className="px-4 py-3 font-mono border-b border-gray-100">
                                      <button 
                                        onClick={() => handleJobClick(job.id)}
                                        className="text-blue-600 hover:text-blue-800 underline transition-colors"
                                      >
                                        {job.id}
                                      </button>
                                    </td>
                                    <td className="px-4 py-3 border-b border-gray-100">{job.uploader_name}</td>
                                    <td className="px-4 py-3 border-b border-gray-100">
                                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(job.status)}`}>
                                        {statusIcon(job.status)} {job.status.toUpperCase()}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 border-b border-gray-100">
                                      <div className="flex items-center gap-2">
                                        <Progress 
                                          percent={job.progress} 
                                          showInfo={false} 
                                          strokeColor="#ef4444"
                                          trailColor="#f3f4f6"
                                          style={{ width: '60px' }}
                                        />
                                        <span className="text-xs text-gray-500">{job.progress}%</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 border-b border-gray-100">
                                      {job.error ? (
                                        <div className="max-w-xs">
                                          <div className="text-red-600 text-xs font-semibold">{t('pages.jobs.error')}:</div>
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
                                  </motion.tr>
                                ))}
                              </AnimatePresence>
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Job Details Modal */}
      <AnimatePresence>
        {showJobModal && selectedJob && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowJobModal(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('pages.jobs.jobDetails')} - #{selectedJob.id}</h2>
                <button 
                  onClick={() => setShowJobModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">{t('pages.jobs.basicInfo')}</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>{t('pages.jobs.uploader')}:</strong> {selectedJob.uploader_name}</div>
                    <div><strong>{t('pages.jobs.status')}:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${statusColor(selectedJob.status)}`}>
                        {statusIcon(selectedJob.status)} {selectedJob.status.toUpperCase()}
                      </span>
                    </div>
                    <div><strong>{t('pages.jobs.progress')}:</strong> {selectedJob.progress}%</div>
                    <div><strong>{t('pages.jobs.filePath')}:</strong> <code className="text-xs bg-gray-100 px-1 rounded">{selectedJob.file_path}</code></div>
                    <div><strong>{t('pages.jobs.created')}:</strong> {selectedJob.created_at}</div>
                    <div><strong>{t('pages.jobs.updated')}:</strong> {selectedJob.updated_at}</div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">{t('pages.jobs.results')}</h3>
                  {selectedJob.result && (
                    <div className="bg-gray-50 p-3 rounded text-xs font-mono overflow-x-auto">
                      <pre>{selectedJob.result}</pre>
                    </div>
                  )}
                </div>
              </div>

              {selectedJob.error && (
                <div>
                  <h3 className="font-semibold text-red-700 mb-2">{t('pages.jobs.errorDetails')}</h3>
                  <div className="bg-red-50 border border-red-200 p-4 rounded text-sm">
                    {formatError(selectedJob.error)}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 