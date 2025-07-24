import { useEffect, useState, useRef } from 'react';
import { Button, Stack, Message, toaster, Input, InputGroup, SelectPicker, Checkbox } from 'rsuite';
import { useRouter } from 'next/router';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MuiButton from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import * as XLSX from 'xlsx';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(null); // id of expanded receipt
  const [editState, setEditState] = useState({
    company_name: '',
    receipt_type: '',
    date: '',
    image_name: '',
    price: '',
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const selectAllRef = useRef();

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
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        setInvoices(data);
        setFilteredInvoices(data);
        const users = [...new Set(data.map(invoice => invoice.uploader_name))];
        setUniqueUsers(users.map(user => ({ label: user, value: user })));
        const types = [...new Set(data.map(invoice => invoice.receipt_type).filter(Boolean))];
        setUniqueTypes(types.map(type => ({ label: type, value: type })));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const filtered = invoices.filter(invoice => {
      const matchesSearch = 
        invoice.company_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        invoice.price?.toString().includes(searchText) ||
        invoice.date?.toLowerCase().includes(searchText) ||
        invoice.raw_ocr?.toLowerCase().includes(searchText);
      const matchesUser = !selectedUser || invoice.uploader_name === selectedUser;
      const matchesType = !selectedType || invoice.receipt_type === selectedType;
      return matchesSearch && matchesUser && matchesType;
    });
    setFilteredInvoices(filtered);
  }, [searchText, invoices, selectedUser, selectedType]);

  // Update edit state when expanded invoice changes
  useEffect(() => {
    if (expanded) {
      const inv = filteredInvoices.find(inv => inv.id === expanded);
      if (inv) {
        setEditState({
          company_name: inv.company_name || '',
          receipt_type: inv.receipt_type || '',
          date: inv.date || '',
          image_name: inv.image_name || '',
          price: inv.price || '',
        });
      }
    }
  }, [expanded, filteredInvoices]);

  if (!user) return null;

  const handleEditChange = (field, value) => {
    setEditState(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectInvoice = (id, checked) => {
    if (checked) {
      setSelectedInvoices(prev => [...prev, id]);
    } else {
      setSelectedInvoices(prev => prev.filter(invoiceId => invoiceId !== id));
    }
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedInvoices(filteredInvoices.map(inv => inv.id));
    } else {
      setSelectedInvoices([]);
    }
  };

  const exportToExcel = () => {
    if (selectedInvoices.length === 0) {
      toaster.push(<Message type="warning">Please select at least one invoice to export</Message>);
      return;
    }

    const selectedData = invoices
      .filter(inv => selectedInvoices.includes(inv.id))
      .map(inv => ({
        'Receipt ID': inv.id,
        'Company Name': inv.company_name || 'N/A',
        'Receipt Type': inv.receipt_type || 'N/A',
        'Date': inv.date || 'N/A',
        'Price': inv.price || 'N/A',
        'Uploader': inv.uploader_name || 'N/A',
        'File Name': inv.image_name || 'N/A',
        'Created At': new Date(inv.created_at).toLocaleString()
      }));

    const worksheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');
    
    // Generate Excel file
    XLSX.writeFile(workbook, `invoices_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toaster.push(<Message type="success">Exported {selectedInvoices.length} invoices to Excel</Message>);
  };

  const handleSave = async () => {
    if (!expanded) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/invoices?id=${expanded}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editState),
      });
      if (res.ok) {
        toaster.push(<Message type="success">Saved!</Message>);
        // Update local state
        setInvoices(invoices => invoices.map(i => i.id === expanded ? { ...i, ...editState } : i));
        setExpanded(null);
    } else {
        const data = await res.json();
        toaster.push(<Message type="error">{data.error || 'Save failed'}</Message>);
      }
    } catch (e) {
      toaster.push(<Message type="error">Save failed</Message>);
    }
    setSaving(false);
  };

  // Helper to get image src from file_path
  const getImageSrc = (file_path) => {
    if (!file_path) return '/placeholder.png';
    if (file_path.startsWith('http://') || file_path.startsWith('https://')) {
      return file_path;
    }
    // fallback for local files
    const filename = file_path.split('/').pop();
    return `/temp/${filename}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12">
      <div className="w-full animate-fade-in-up p-0 m-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 mb-8 w-full px-4">
          <div className="flex items-center gap-4">
            <h2 className="font-extrabold text-3xl text-red-700 m-0">Receipts Gallery</h2>
            {selectMode && (
              <div className="flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                <span className="text-red-700 font-medium">{selectedInvoices.length} selected</span>
                <button 
                  onClick={() => setSelectMode(false)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 w-full sm:flex-row sm:gap-4 sm:w-auto">
            {selectMode ? (
              <>
                <Button 
                  appearance="primary" 
                  color="red" 
                  onClick={exportToExcel}
                  disabled={selectedInvoices.length === 0}
                  className="flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Export ({selectedInvoices.length})
                </Button>
                <Button 
                  appearance="ghost" 
                  onClick={() => setSelectMode(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button 
                  appearance="ghost" 
                  onClick={() => setSelectMode(true)}
                  className="flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Select
                </Button>
                <SelectPicker
                  data={uniqueUsers}
                  placeholder="Filter by user"
                  value={selectedUser}
                  onChange={setSelectedUser}
                  style={{ width: '100%', maxWidth: 180 }}
                  className="w-full"
                  cleanable
                />
                <SelectPicker
                  data={uniqueTypes}
                  placeholder="Filter by type"
                  value={selectedType}
                  onChange={setSelectedType}
                  style={{ width: '100%', maxWidth: 180 }}
                  className="w-full"
                  cleanable
                />
                <InputGroup className="w-full">
                  <Input 
                    placeholder="Search receipts..."
                    value={searchText}
                    onChange={setSearchText}
                    style={{ width: '100%', maxWidth: 180 }}
                    className="w-full"
                  />
                </InputGroup>
              </>
            )}
          </div>
        </div>
        {loading ? (
          <div className="text-lg text-gray-500">Loading...</div>
        ) : filteredInvoices.length === 0 ? (
          <Message type="info" style={{ marginTop: 24 }}>No invoices found.</Message>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-8 w-full px-4">
            {filteredInvoices.map(inv => (
              <div
                key={inv.id}
                className={`bg-white rounded-2xl shadow-lg border ${selectMode ? 'border-2' : 'border-gray-100'} p-6 flex flex-col ${selectMode ? 'cursor-default' : 'cursor-pointer hover:shadow-2xl'} transition relative w-full min-w-0 ${selectedInvoices.includes(inv.id) ? 'border-red-400 ring-2 ring-red-200' : ''}`}
                onClick={(e) => {
                  if (!selectMode) setExpanded(inv.id);
                }}
              >
                {selectMode && (
                  <div 
                    className="absolute -left-2 -top-2 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectInvoice(inv.id, !selectedInvoices.includes(inv.id));
                    }}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${selectedInvoices.includes(inv.id) ? 'bg-red-500' : 'bg-white border-2 border-gray-300'}`}>
                      {selectedInvoices.includes(inv.id) && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                )}
                {/* Receipt type pill at top right */}
                <div className="absolute top-2 right-2">
                  {inv.receipt_type && (
                    <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
                      {inv.receipt_type}
                    </span>
                  )}
                </div>
                <img
                  src={getImageSrc(inv.file_path)}
                  alt={inv.company_name || 'Receipt'}
                  className="w-full h-40 object-contain rounded-xl bg-gray-50 mb-3"
                  style={{ maxHeight: 160 }}
                  onError={e => { e.target.src = '/placeholder.png'; }}
                />
                <div className="font-semibold text-gray-800 truncate w-full text-left">{inv.company_name || 'No Company'}</div>
                <div className="text-xs text-gray-500 w-full text-left truncate">{inv.image_name || 'No file'}</div>
                {/* Bottom row: No. and date, same style and row, normal flow */}
                <div className="flex justify-between w-full mt-2 text-xs text-gray-600">
                  <span>No: {inv.id}</span>
                  <span>{inv.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Expanded view modal */}
        <Dialog
          open={!!expanded}
          onClose={(event, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
              setExpanded(null);
            }
          }}
          disableEscapeKeyDown
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: 8,
              overflow: 'auto',
              p: 0,
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              minWidth: { xs: '95vw', sm: 900 },
              maxWidth: 900,
              minHeight: { xs: 400, sm: 400 },
            },
          }}
        >
          {(() => {
            const inv = filteredInvoices.find(inv => inv.id === expanded);
            if (!inv) return null;
            let items = [];
            try {
              items = inv.items_json ? JSON.parse(inv.items_json) : [];
            } catch { items = []; }
            return (
              <div
                style={{ width: '100%', position: 'relative' }}
                className="mui-modal-flex"
              >
                <div
                  style={{
                    background: 'linear-gradient(135deg, #f3f4f6 0%, #e0e7ef 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    minHeight: 200,
                    padding: 24,
                    borderTopLeftRadius: 32, borderBottomLeftRadius: 32,
                    borderTopRightRadius: 0, borderBottomRightRadius: 0,
                  }}
                  className="mui-modal-image"
                >
                  <Card elevation={0} sx={{ boxShadow: 'none', bgcolor: 'transparent', width: '100%' }}>
                    <CardMedia
                      component="img"
                      image={getImageSrc(inv.file_path)}
                      alt={inv.company_name || 'Receipt'}
                      sx={{
                        maxHeight: { xs: '30vh', sm: '60vh' },
                        width: 'auto',
                        borderRadius: 4,
                        boxShadow: 3,
                        mx: 'auto',
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'scale(1.03)' },
                        background: '#f3f4f6',
                        objectFit: 'contain',
                        cursor: 'zoom-in',
                      }}
                      onClick={() => setImagePreviewOpen(true)}
                      onError={e => { e.target.src = '/placeholder.png'; }}
                      title="Click to view fullscreen"
                    />
                  </Card>
                </div>
                <div
                  style={{ width: 1, background: '#e5e7eb', margin: '0', alignSelf: 'stretch', display: 'block' }}
                  className="mui-modal-divider"
                />
                <div
                  style={{
                    background: 'white',
                    padding: 24,
                    minWidth: 0,
                    maxWidth: 600,
                    overflowY: 'auto',
                    position: 'relative',
                  }}
                  className="mui-modal-form"
                >
                  <IconButton
                    aria-label="close"
                    onClick={() => setExpanded(null)}
                    sx={{ position: 'absolute', right: 16, top: 16, color: 'grey.500', zIndex: 2 }}
                  >
                    <CloseIcon fontSize="large" />
                  </IconButton>
                  <DialogTitle sx={{ p: 0, mb: 2 }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
                      Receipt Details
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Edit receipt information
                    </Typography>
                  </DialogTitle>
                  <DialogContent sx={{ p: 0 }}>
                    <Grid container spacing={3} sx={{ mb: 2, mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Company Name"
                          value={editState.company_name}
                          onChange={e => handleEditChange('company_name', e.target.value)}
                          variant="outlined"
                          size="medium"
                          sx={{ width: { xs: '100%', sm: 260 }, mb: { xs: 2, sm: 0 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Receipt Type"
                          value={editState.receipt_type}
                          onChange={e => handleEditChange('receipt_type', e.target.value)}
                          variant="outlined"
                          size="medium"
                          sx={{ width: { xs: '100%', sm: 260 }, mb: { xs: 2, sm: 0 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Date"
                          type="date"
                          value={editState.date || ''}
                          onChange={e => handleEditChange('date', e.target.value)}
                          variant="outlined"
                          size="medium"
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: { xs: '100%', sm: 260 }, mb: { xs: 2, sm: 0 } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Amount"
                          value={editState.price}
                          onChange={e => handleEditChange('price', e.target.value)}
                          variant="outlined"
                          size="medium"
                          sx={{ width: { xs: '100%', sm: 260 }, mb: { xs: 2, sm: 0 } }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Receipt Name"
                          value={editState.image_name}
                          onChange={e => handleEditChange('image_name', e.target.value)}
                          variant="outlined"
                          size="medium"
                          sx={{ width: { xs: '100%', sm: 400 }, mb: { xs: 2, sm: 0 } }}
                        />
                      </Grid>
                    </Grid>
                    {(() => {
                      const inv = filteredInvoices.find(inv => inv.id === expanded);
                      if (!inv) return null;
                      let items = [];
                      try {
                        items = inv.items_json ? JSON.parse(inv.items_json) : [];
                      } catch { items = []; }
                      return (
                        <Card elevation={1} sx={{ mb: 3, borderRadius: 3, bgcolor: '#f8fafc' }}>
                          <CardContent sx={{ p: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                              Receipt Items
                            </Typography>
                            <table style={{ width: '100%', fontSize: 14 }}>
                              <thead>
                                <tr style={{ background: '#f1f5f9' }}>
                                  <th style={{ textAlign: 'left', padding: 8 }}>Item Name</th>
                                  <th style={{ textAlign: 'center', padding: 8 }}>Qty</th>
                                  <th style={{ textAlign: 'right', padding: 8 }}>Unit Price</th>
                                  <th style={{ textAlign: 'right', padding: 8 }}>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((item, idx) => (
                                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: 8 }}>{item.name}</td>
                                    <td style={{ textAlign: 'center', padding: 8 }}>{item.qty}</td>
                                    <td style={{ textAlign: 'right', padding: 8 }}>{item.unit_price}</td>
                                    <td style={{ textAlign: 'right', padding: 8, fontWeight: 600 }}>{item.total}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </CardContent>
                        </Card>
                      );
                    })()}
                    <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mt: { xs: 1, sm: 2 } }}>
                      <Grid item xs={6}>
                        <MuiButton
                          variant="contained"
                          color="primary"
                          fullWidth
                          size="large"
                          onClick={handleSave}
                          disabled={saving}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          {saving ? 'Saving...' : 'Save Changes'}
                        </MuiButton>
                      </Grid>
                      <Grid item xs={6}>
                        <MuiButton
                          variant="outlined"
                          color="inherit"
                          fullWidth
                          size="large"
                          onClick={() => setExpanded(null)}
                          sx={{ borderRadius: 2, fontWeight: 600 }}
                        >
                          Cancel
                        </MuiButton>
                      </Grid>
                    </Grid>
                  </DialogContent>
                </div>
              </div>
            );
          })()}
        </Dialog>
        {/* Fullscreen image preview dialog */}
        <Dialog
          open={imagePreviewOpen}
          onClose={() => setImagePreviewOpen(false)}
          maxWidth={false}
          PaperProps={{
            sx: {
              boxShadow: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0,
              background: 'transparent',
            },
          }}
          BackdropProps={{
            sx: { backgroundColor: 'rgba(0,0,0,0.8)' }
          }}
        >
          <IconButton
            aria-label="close"
            onClick={() => setImagePreviewOpen(false)}
            sx={{ position: 'fixed', top: 24, right: 24, color: 'white', zIndex: 1001, background: 'rgba(0,0,0,0.3)' }}
          >
            <CloseIcon fontSize="large" />
          </IconButton>
          <DialogContent
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0,
              minWidth: { xs: '100vw', sm: '100vw' },
              minHeight: { xs: '100vh', sm: '100vh' },
              background: 'transparent',
            }}
            onClick={e => { if (e.target === e.currentTarget) setImagePreviewOpen(false); }}
          >
            <img
              src={getImageSrc(filteredInvoices.find(inv => inv.id === expanded)?.file_path)}
              alt="Receipt Fullscreen"
              style={{
                maxWidth: '98vw',
                maxHeight: '92vh',
                margin: 'auto',
                borderRadius: 12,
                boxShadow: '0 4px 32px rgba(0,0,0,0.7)',
                background: '#fff',
                display: 'block',
              }}
              onError={e => { e.target.src = '/placeholder.png'; }}
              onClick={e => e.stopPropagation()}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}