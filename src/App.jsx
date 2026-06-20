import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Eye, Landmark, Database, Sun, Moon, Download, Printer, FileText, Plus, ChevronDown, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Custom components
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import SignatureCanvas from './components/SignatureCanvas';
import SavedInvoices from './components/SavedInvoices';

const templates = [
  { id: 'classic', name: 'Classic Professional', desc: 'Minimalist, formal structure with crisp lines' },
  { id: 'modern', name: 'Modern Teal', desc: 'Structured grid with clean color bands' },
  { id: 'luxury', name: 'Luxury Serif', desc: 'Elegant gold frames with classic serif typography' },
  { id: 'bold', name: 'Bold Accent', desc: 'Dark solid headers with tech-broker feel' }
];

const fonts = [
  { id: 'font-sans', name: 'Inter (Modern Sans)', family: "'Inter', sans-serif" },
  { id: 'font-serif', name: 'Playfair (Elegant Serif)', family: "'Playfair Display', serif" },
  { id: 'font-outfit', name: 'Outfit (Geometric)', family: "'Outfit', sans-serif" },
  { id: 'font-montserrat', name: 'Montserrat (Clean Corporate)', family: "'Montserrat', sans-serif" },
  { id: 'font-roboto', name: 'Roboto (Standard Classic)', family: "'Roboto', sans-serif" },
  { id: 'font-merriweather', name: 'Merriweather (Soft Serif)', family: "'Merriweather', serif" },
  { id: 'font-mono', name: 'Courier Prime (Typewriter)', family: "'Courier Prime', monospace" }
];

const colorPresets = [
  { name: 'Teal Blue', value: '#06b6d4' },
  { name: 'Royal Indigo', value: '#6366f1' },
  { name: 'Emerald Green', value: '#10b981' },
  { name: 'Luxury Amber', value: '#b45309' },
  { name: 'Crimson Red', value: '#dc2626' },
  { name: 'Classic Dark Slate', value: '#334155' }
];

const defaultInvoiceData = {
  activeTemplate: 'modern',
  accentColor: '#0891b2',
  activeFont: 'font-sans',

  invoiceNumber: 'MERA/2026/042',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

  // Agent / Broker Profile
  agentCompany: 'Aneesh Enterprises',
  agentName: 'Sarita Sunil Gupta',
  agentAddress: 'Office Suite 402, Quantum Towers,\nS.V. Road, Malad West, Mumbai - 400064',
  agentPhone: '+91 98200 12345',
  agentEmail: 'info@aneeshenterprises.in',
  agentMahaRera: 'A51700022290',
  agentGstin: '27AAAAA1111A1Z1',
  agentPan: 'ABCDE1234F',
  agentLogo: '',

  // Client Info
  clientCompany: 'Sumer Developers Private Limited',
  clientName: 'Mr. Rajeev Sumer (Managing Director)',
  clientAddress: 'Sumer Chambers, 8th Floor,\nNariman Point, Mumbai - 400021',
  clientPhone: '+91 22 6654 9900',
  clientEmail: 'billing@sumerdevelopers.com',
  clientGstin: '27BBBBB2222B2Z2',

  // Deal / Property details
  dealType: 'sale',
  projectName: 'Sumer Sky Heights',
  projectMahaRera: 'P51800098765',
  unitNumber: '1802',
  wingName: 'B Wing',
  floorNumber: '18th Floor',
  agreementValue: '25000000', // ₹2.5 Crore

  // Commission Calculations
  commissionType: 'percentage',
  commissionRate: '2.0',
  commissionAmount: '500000',

  // GST
  gstEnabled: true,
  gstType: 'cgst_sgst',
  gstRate: '18',

  // Bank Credentials
  bankBeneficiary: 'Aneesh Enterprises',
  bankName: 'ICICI Bank',
  bankBranch: 'Malad West Branch, Mumbai',
  bankAccount: '001205009876',
  bankIfsc: 'ICIC0000012',
  bankUpi: 'sarita@okaxis',
  showUpiQr: true,

  // Extra Details
  signatureData: '',
  notes: 'Brokerage fee is due upon the registration of the agreement of sale or execution of lease deed.',
  terms: '1. Payment should be made within 15 days of invoice date via bank transfer/NEFT/RTGS.\n2. Delay in payment will attract interest @ 12% p.a.\n3. All disputes are subject to Mumbai Jurisdiction.',

  // Labels
  billToLabel: 'Bill To',
  bankDetailsLabel: 'Bank details for payment',
  paymentMethodLabel: 'Payment Method',
  termsLabel: 'Terms & Conditions',
  notesLabel: 'Notes',
  declarationLabel: 'Declaration'
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn(`LocalStorage write failed for key "${key}":`, e);
  }
};

// Generate a short unique ID for share links
const generateShareId = () => {
  try {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
};

export default function App() {
  const [invoiceData, setInvoiceData] = useState(defaultInvoiceData);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [exportHistory, setExportHistory] = useState([]);
  const [theme, setTheme] = useState('light'); // default 'light'
  // Synchronously detect view-only mode from URL to avoid flash
  const [viewOnly, setViewOnly] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !!(params.get('inv') || params.get('id'));
  });
  // Track if currently editing a live shared invoice (so changes auto-sync to the share slot)
  const [editingSharedId, setEditingSharedId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || null;
  });
  const [activeTab, setActiveTab] = useState('editor'); // For mobile: 'editor', 'preview'
  const [signatureCanvasOpen, setSignatureCanvasOpen] = useState(false);
  const [savedInvoicesOpen, setSavedInvoicesOpen] = useState(false);
  const previewPanelRef = useRef(null); // ref to PreviewPanel for PDF capture
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActionsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Initialize and load saved state from localStorage
  useEffect(() => {
    // Check for shared invoice state in url first
    const urlParams = new URLSearchParams(window.location.search);
    const sharedId = urlParams.get('id');       // new UUID-based link
    const sharedData = urlParams.get('inv');    // legacy base64 link

    if (sharedId) {
      const stored = localStorage.getItem('maharera_shared_' + sharedId);
      
      if (sharedData) {
        // If there is new fallback data in the URL (e.g. from an updated link),
        // always prioritize it to avoid cache-locking on clients' devices.
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
          const merged = { ...defaultInvoiceData, ...decoded };
          setInvoiceData(merged);
          setViewOnly(true);
          // Overwrite local storage cache with this latest version from URL
          safeSetItem('maharera_shared_' + sharedId, JSON.stringify(decoded));
          console.log('Shared invoice loaded from URL fallback data for id:', sharedId);
        } catch (e) {
          console.error('Failed to parse fallback share data:', e);
          if (stored) {
            try {
              const decoded = JSON.parse(stored);
              setInvoiceData({ ...defaultInvoiceData, ...decoded });
              setViewOnly(true);
            } catch (err) {
              setViewOnly(true);
              setInvoiceData(prev => ({ ...prev, _notFound: true, _shareId: sharedId }));
            }
          } else {
            setViewOnly(true);
            setInvoiceData(prev => ({ ...prev, _notFound: true, _shareId: sharedId }));
          }
        }
      } else if (stored) {
        // No inv parameter in URL, but we have stored data in localStorage
        try {
          const decoded = JSON.parse(stored);
          setInvoiceData({ ...defaultInvoiceData, ...decoded });
          setViewOnly(true);
          console.log('Live shared invoice loaded for id:', sharedId);
        } catch (e) {
          console.error('Failed to parse live shared invoice from localStorage:', e);
          setViewOnly(true);
          setInvoiceData(prev => ({ ...prev, _notFound: true, _shareId: sharedId }));
        }
      } else {
        // Truly not found
        setViewOnly(true);
        setInvoiceData(prev => ({ ...prev, _notFound: true, _shareId: sharedId }));
      }
    } else if (sharedData) {
      // Legacy ?inv=base64 link
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(sharedData))));
        // Load data, merging with defaults
        const merged = { ...defaultInvoiceData, ...decoded };
        setInvoiceData(merged);
        setViewOnly(true);
        console.log('Shared invoice loaded in client view-only presentation mode.');
      } catch (e) {
        console.error('Failed to parse shared URL state:', e);
        alert('Failed to load shared invoice link data.');
      }
    } else {
      const draft = localStorage.getItem('maharera_draft_invoice');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          if (
            parsed.agentCompany === 'Apex Property Advisors' ||
            parsed.agentCompany === 'Elite Realtors Mumbai' ||
            parsed.agentName === 'Vikram A. Salunkhe'
          ) {
            const migrated = {
              ...parsed,
              agentCompany: defaultInvoiceData.agentCompany,
              agentName: defaultInvoiceData.agentName,
              agentAddress: defaultInvoiceData.agentAddress,
              agentPhone: defaultInvoiceData.agentPhone,
              agentEmail: defaultInvoiceData.agentEmail,
              agentMahaRera: defaultInvoiceData.agentMahaRera,
              agentGstin: defaultInvoiceData.agentGstin,
              agentPan: defaultInvoiceData.agentPan,
              bankBeneficiary: defaultInvoiceData.bankBeneficiary,
              bankName: defaultInvoiceData.bankName,
              bankBranch: defaultInvoiceData.bankBranch,
              bankAccount: defaultInvoiceData.bankAccount,
              bankIfsc: defaultInvoiceData.bankIfsc,
              bankUpi: defaultInvoiceData.bankUpi
            };
            setInvoiceData(migrated);
            safeSetItem('maharera_draft_invoice', JSON.stringify(migrated));
            console.log('Migrated old default draft config to Aneesh Enterprises.');
          } else {
            setInvoiceData(parsed);
          }
        } catch (e) {
          console.error('Error loading invoice draft', e);
        }
      } else {
        // Save initial default configuration
        safeSetItem('maharera_draft_invoice', JSON.stringify(defaultInvoiceData));
      }
    }

    const saved = localStorage.getItem('maharera_saved_invoices');
    if (saved) {
      try {
        setSavedInvoices(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved invoices', e);
      }
    }

    const history = localStorage.getItem('maharera_export_history');
    if (history) {
      try {
        setExportHistory(JSON.parse(history));
      } catch (e) {
        console.error('Error loading export history', e);
      }
    }

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }

    // Listen for storage events (enables live tab-to-tab sync on same device)
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('maharera_shared_') && e.newValue) {
        const keyId = e.key.replace('maharera_shared_', '');
        const currentParams = new URLSearchParams(window.location.search);
        const currentActiveId = currentParams.get('id');
        if (keyId === currentActiveId) {
          try {
            const decoded = JSON.parse(e.newValue);
            setInvoiceData(prev => ({ ...prev, ...decoded }));
            console.log('Instant live sync update received from storage change:', keyId);
          } catch (err) {
            console.error('Failed to parse storage sync event payload:', err);
          }
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleFieldChange = (field, value) => {
    setInvoiceData(prev => {
      let updated = { ...prev, [field]: value };
      if (field === 'activeTemplate') {
        if (value === 'luxury') {
          updated.activeFont = 'font-serif';
        } else if (value === 'bold') {
          updated.activeFont = 'font-outfit';
        } else {
          updated.activeFont = 'font-sans';
        }
      }
      safeSetItem('maharera_draft_invoice', JSON.stringify(updated));
      // If editing a live shared invoice, also sync to its share slot so the link stays current
      if (editingSharedId) {
        const cleanPayload = {
          activeTemplate: updated.activeTemplate,
          accentColor: updated.accentColor,
          activeFont: updated.activeFont,
          invoiceNumber: updated.invoiceNumber,
          invoiceDate: updated.invoiceDate,
          dueDate: updated.dueDate,
          agentCompany: updated.agentCompany,
          agentName: updated.agentName,
          agentAddress: updated.agentAddress,
          agentPhone: updated.agentPhone,
          agentEmail: updated.agentEmail,
          agentMahaRera: updated.agentMahaRera,
          agentGstin: updated.agentGstin,
          agentPan: updated.agentPan,
          clientCompany: updated.clientCompany,
          clientName: updated.clientName,
          clientAddress: updated.clientAddress,
          clientPhone: updated.clientPhone,
          clientEmail: updated.clientEmail,
          clientGstin: updated.clientGstin,
          dealType: updated.dealType,
          projectName: updated.projectName,
          projectMahaRera: updated.projectMahaRera,
          unitNumber: updated.unitNumber,
          wingName: updated.wingName,
          floorNumber: updated.floorNumber,
          agreementValue: updated.agreementValue,
          commissionType: updated.commissionType,
          commissionRate: updated.commissionRate,
          commissionAmount: updated.commissionAmount,
          gstEnabled: updated.gstEnabled,
          gstType: updated.gstType,
          gstRate: updated.gstRate,
          bankBeneficiary: updated.bankBeneficiary,
          bankName: updated.bankName,
          bankBranch: updated.bankBranch,
          bankAccount: updated.bankAccount,
          bankIfsc: updated.bankIfsc,
          bankUpi: updated.bankUpi,
          showUpiQr: updated.showUpiQr,
          notes: updated.notes,
          terms: updated.terms,
          billToLabel: updated.billToLabel,
          bankDetailsLabel: updated.bankDetailsLabel,
          termsLabel: updated.termsLabel,
          notesLabel: updated.notesLabel,
          declarationLabel: updated.declarationLabel
        };
        safeSetItem('maharera_shared_' + editingSharedId, JSON.stringify(cleanPayload));

        // Sync changes live to the draft entry in SavedInvoices list
        setSavedInvoices(prevList => {
          const updatedList = prevList.map(i => {
            if (i.shareId === editingSharedId) {
              const base64Fallback = btoa(unescape(encodeURIComponent(JSON.stringify(cleanPayload))));
              const shareUrl = `${window.location.origin}${window.location.pathname}?id=${editingSharedId}&inv=${base64Fallback}`;
              return {
                ...i,
                ...cleanPayload,
                shareUrl,
                sharedAt: new Date().toLocaleString('en-IN')
              };
            }
            return i;
          });
          safeSetItem('maharera_saved_invoices', JSON.stringify(updatedList));
          return updatedList;
        });
      }
      return updated;
    });
  };

  const handleSaveCurrent = () => {
    const newInvoice = {
      ...invoiceData,
      id: Date.now().toString()
    };
    const updatedList = [newInvoice, ...savedInvoices];
    setSavedInvoices(updatedList);
    safeSetItem('maharera_saved_invoices', JSON.stringify(updatedList));
    alert('Invoice saved to drafts successfully!');
  };

  const handleLoadInvoice = (inv) => {
    // Preserve local logo and signature if they exist but the loaded one doesn't (to help shared links)
    const logoToPreserve = invoiceData.agentLogo;
    const sigToPreserve = invoiceData.signatureData;
    
    const loadedData = {
      ...inv,
      agentLogo: inv.agentLogo || logoToPreserve,
      signatureData: inv.signatureData || sigToPreserve
    };

    setInvoiceData(loadedData);
    safeSetItem('maharera_draft_invoice', JSON.stringify(loadedData));
    
    if (inv.shareId) {
      setEditingSharedId(inv.shareId);
    } else {
      setEditingSharedId(null);
    }
    
    setSavedInvoicesOpen(false);
  };

  const handleNewInvoice = () => {
    if (window.confirm('Start a new invoice? This will reset client and deal details in the editor, but keep your agent profile and bank details.')) {
      const today = new Date().toISOString().split('T')[0];
      const due = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      setInvoiceData(prev => {
        const fresh = {
          ...defaultInvoiceData,
          // Keep agent/broker profile details from previous state
          agentCompany: prev.agentCompany || defaultInvoiceData.agentCompany,
          agentName: prev.agentName || defaultInvoiceData.agentName,
          agentAddress: prev.agentAddress || defaultInvoiceData.agentAddress,
          agentPhone: prev.agentPhone || defaultInvoiceData.agentPhone,
          agentEmail: prev.agentEmail || defaultInvoiceData.agentEmail,
          agentMahaRera: prev.agentMahaRera || defaultInvoiceData.agentMahaRera,
          agentGstin: prev.agentGstin || defaultInvoiceData.agentGstin,
          agentPan: prev.agentPan || defaultInvoiceData.agentPan,
          agentLogo: prev.agentLogo || defaultInvoiceData.agentLogo,
          // Keep bank details
          bankBeneficiary: prev.bankBeneficiary || defaultInvoiceData.bankBeneficiary,
          bankName: prev.bankName || defaultInvoiceData.bankName,
          bankBranch: prev.bankBranch || defaultInvoiceData.bankBranch,
          bankAccount: prev.bankAccount || defaultInvoiceData.bankAccount,
          bankIfsc: prev.bankIfsc || defaultInvoiceData.bankIfsc,
          bankUpi: prev.bankUpi || defaultInvoiceData.bankUpi,
          showUpiQr: prev.showUpiQr !== undefined ? prev.showUpiQr : defaultInvoiceData.showUpiQr,
          
          // Reset client and deal details
          clientCompany: '',
          clientName: '',
          clientAddress: '',
          clientPhone: '',
          clientEmail: '',
          clientGstin: '',
          projectName: '',
          projectMahaRera: '',
          unitNumber: '',
          wingName: '',
          floorNumber: '',
          agreementValue: '',
          commissionAmount: '',
          commissionRate: '2.0',
          
          signatureData: prev.signatureData || '', // Keep signature if exists
          notes: defaultInvoiceData.notes,
          terms: defaultInvoiceData.terms,
          
          // Automatically set to today's date
          invoiceDate: today,
          dueDate: due,
          invoiceNumber: `MERA/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`, // dynamic new number placeholder
        };
        // Clear shareId so it is a fresh invoice
        delete fresh.shareId;
        
        safeSetItem('maharera_draft_invoice', JSON.stringify(fresh));
        return fresh;
      });

      setEditingSharedId(null);
      // Clear URL query parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      setSavedInvoicesOpen(false);
      
      const t = showToast('✨ Started a new invoice with today\'s date!', '#0891b2');
      setTimeout(() => document.body.removeChild(t), 3000);
    }
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm('Are you sure you want to delete this draft?')) {
      const updatedList = savedInvoices.filter(i => i.id !== id);
      setSavedInvoices(updatedList);
      safeSetItem('maharera_saved_invoices', JSON.stringify(updatedList));
    }
  };

  // Export History Tracker Function
  const trackExportEvent = () => {
    const item = {
      id: Date.now().toString(),
      invoiceNumber: invoiceData.invoiceNumber,
      clientName: invoiceData.clientName,
      projectName: invoiceData.projectName,
      invoiceDate: invoiceData.invoiceDate,
      commissionAmount: invoiceData.commissionAmount,
      gstEnabled: invoiceData.gstEnabled,
      gstRate: invoiceData.gstRate,
      timestamp: new Date().toLocaleString(),
      
      // Save full template parameters so it can be restored on load!
      activeTemplate: invoiceData.activeTemplate,
      accentColor: invoiceData.accentColor,
      activeFont: invoiceData.activeFont,
      dueDate: invoiceData.dueDate,
      agentCompany: invoiceData.agentCompany,
      agentName: invoiceData.agentName,
      agentAddress: invoiceData.agentAddress,
      agentPhone: invoiceData.agentPhone,
      agentEmail: invoiceData.agentEmail,
      agentMahaRera: invoiceData.agentMahaRera,
      agentGstin: invoiceData.agentGstin,
      agentPan: invoiceData.agentPan,
      agentLogo: invoiceData.agentLogo,
      clientCompany: invoiceData.clientCompany,
      clientAddress: invoiceData.clientAddress,
      clientPhone: invoiceData.clientPhone,
      clientEmail: invoiceData.clientEmail,
      clientGstin: invoiceData.clientGstin,
      dealType: invoiceData.dealType,
      projectMahaRera: invoiceData.projectMahaRera,
      unitNumber: invoiceData.unitNumber,
      wingName: invoiceData.wingName,
      floorNumber: invoiceData.floorNumber,
      agreementValue: invoiceData.agreementValue,
      commissionType: invoiceData.commissionType,
      commissionRate: invoiceData.commissionRate,
      gstType: invoiceData.gstType,
      bankBeneficiary: invoiceData.bankBeneficiary,
      bankName: invoiceData.bankName,
      bankBranch: invoiceData.bankBranch,
      bankAccount: invoiceData.bankAccount,
      bankIfsc: invoiceData.bankIfsc,
      bankUpi: invoiceData.bankUpi,
      showUpiQr: invoiceData.showUpiQr,
      signatureData: invoiceData.signatureData,
      notes: invoiceData.notes,
      terms: invoiceData.terms
    };

    setExportHistory(prev => {
      const updated = [item, ...prev];
      safeSetItem('maharera_export_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteHistory = (id) => {
    if (window.confirm('Are you sure you want to delete this invoice from your history?')) {
      const updated = exportHistory.filter(h => h.id !== id);
      setExportHistory(updated);
      safeSetItem('maharera_export_history', JSON.stringify(updated));
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire generated invoice export history?')) {
      setExportHistory([]);
      safeSetItem('maharera_export_history', JSON.stringify([]));
    }
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  const handleExitViewOnly = () => {
    const draft = localStorage.getItem('maharera_draft_invoice');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (
          parsed.agentCompany === 'Apex Property Advisors' ||
          parsed.agentCompany === 'Elite Realtors Mumbai' ||
          parsed.agentName === 'Vikram A. Salunkhe'
        ) {
          const migrated = {
            ...parsed,
            agentCompany: defaultInvoiceData.agentCompany,
            agentName: defaultInvoiceData.agentName,
            agentAddress: defaultInvoiceData.agentAddress,
            agentPhone: defaultInvoiceData.agentPhone,
            agentEmail: defaultInvoiceData.agentEmail,
            agentMahaRera: defaultInvoiceData.agentMahaRera,
            agentGstin: defaultInvoiceData.agentGstin,
            agentPan: defaultInvoiceData.agentPan,
            bankBeneficiary: defaultInvoiceData.bankBeneficiary,
            bankName: defaultInvoiceData.bankName,
            bankBranch: defaultInvoiceData.bankBranch,
            bankAccount: defaultInvoiceData.bankAccount,
            bankIfsc: defaultInvoiceData.bankIfsc,
            bankUpi: defaultInvoiceData.bankUpi
          };
          setInvoiceData(migrated);
        } else {
          setInvoiceData(parsed);
        }
      } catch (e) {
        setInvoiceData(defaultInvoiceData);
      }
    } else {
      setInvoiceData(defaultInvoiceData);
    }
    setViewOnly(false);
    setEditingSharedId(null);
    // Clear URL query parameters
    window.history.replaceState({}, document.title, window.location.pathname);
  };



  // Build the shareable data subset (no logo/signature to keep URL size small)
  const buildSharePayload = () => ({
    activeTemplate: invoiceData.activeTemplate,
    accentColor: invoiceData.accentColor,
    activeFont: invoiceData.activeFont,
    invoiceNumber: invoiceData.invoiceNumber,
    invoiceDate: invoiceData.invoiceDate,
    dueDate: invoiceData.dueDate,
    agentCompany: invoiceData.agentCompany,
    agentName: invoiceData.agentName,
    agentAddress: invoiceData.agentAddress,
    agentPhone: invoiceData.agentPhone,
    agentEmail: invoiceData.agentEmail,
    agentMahaRera: invoiceData.agentMahaRera,
    agentGstin: invoiceData.agentGstin,
    agentPan: invoiceData.agentPan,
    clientCompany: invoiceData.clientCompany,
    clientName: invoiceData.clientName,
    clientAddress: invoiceData.clientAddress,
    clientPhone: invoiceData.clientPhone,
    clientEmail: invoiceData.clientEmail,
    clientGstin: invoiceData.clientGstin,
    dealType: invoiceData.dealType,
    projectName: invoiceData.projectName,
    projectMahaRera: invoiceData.projectMahaRera,
    unitNumber: invoiceData.unitNumber,
    wingName: invoiceData.wingName,
    floorNumber: invoiceData.floorNumber,
    agreementValue: invoiceData.agreementValue,
    commissionType: invoiceData.commissionType,
    commissionRate: invoiceData.commissionRate,
    commissionAmount: invoiceData.commissionAmount,
    gstEnabled: invoiceData.gstEnabled,
    gstType: invoiceData.gstType,
    gstRate: invoiceData.gstRate,
    bankBeneficiary: invoiceData.bankBeneficiary,
    bankName: invoiceData.bankName,
    bankBranch: invoiceData.bankBranch,
    bankAccount: invoiceData.bankAccount,
    bankIfsc: invoiceData.bankIfsc,
    bankUpi: invoiceData.bankUpi,
    showUpiQr: invoiceData.showUpiQr,
    notes: invoiceData.notes,
    terms: invoiceData.terms,
    billToLabel: invoiceData.billToLabel,
    bankDetailsLabel: invoiceData.bankDetailsLabel,
    termsLabel: invoiceData.termsLabel,
    notesLabel: invoiceData.notesLabel,
    declarationLabel: invoiceData.declarationLabel
  });

  const handleShareLink = () => {
    try {
      // Reuse existing shareId or generate a new one
      const shareId = invoiceData.shareId || generateShareId();
      const payload = buildSharePayload();

      // Store the invoice data in localStorage under its shareId (enables live editing on this device)
      safeSetItem('maharera_shared_' + shareId, JSON.stringify(payload));

      // Also embed data as base64 fallback so the link works on ANY device / browser
      const base64Fallback = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));

      // Build the hybrid share URL: ?id= for live editing + &inv= for cross-device fallback
      const shareUrl = `${window.location.origin}${window.location.pathname}?id=${shareId}&inv=${base64Fallback}`;
      const sharedAt = new Date().toLocaleString('en-IN');

      // Update invoiceData with the shareId so it persists
      const updatedData = { ...invoiceData, shareId };
      setInvoiceData(updatedData);
      safeSetItem('maharera_draft_invoice', JSON.stringify(updatedData));

      // Auto-save / update this invoice in the Drafts with share metadata
      setSavedInvoices(prev => {
        const existing = prev.find(i => i.shareId === shareId || i.invoiceNumber === invoiceData.invoiceNumber);
        let updated;
        if (existing) {
          updated = prev.map(i =>
            (i.shareId === shareId || i.id === existing.id)
              ? { ...i, ...payload, shareId, shareUrl, sharedAt, id: i.id }
              : i
          );
        } else {
          const newDraft = {
            ...payload, shareId, shareUrl, sharedAt,
            id: Date.now().toString()
          };
          updated = [newDraft, ...prev];
        }
        safeSetItem('maharera_saved_invoices', JSON.stringify(updated));
        return updated;
      });

      navigator.clipboard.writeText(shareUrl).then(() => {
        const t = showToast('🔗 Link copied! Works on any device.', '#0891b2');
        setTimeout(() => document.body.removeChild(t), 3000);
      }).catch(() => {
        prompt('Copy this shareable link:', shareUrl);
      });
    } catch (e) {
      console.error('Failed to generate sharing URL:', e);
      alert('Failed to generate sharing link.');
    }
  };

  // Called from SavedInvoices when agent clicks "Update Link" on a shared draft
  const handleUpdateSharedLink = (shareId, draftData) => {
    try {
      const payload = {
        activeTemplate: draftData.activeTemplate,
        accentColor: draftData.accentColor,
        activeFont: draftData.activeFont,
        invoiceNumber: draftData.invoiceNumber,
        invoiceDate: draftData.invoiceDate,
        dueDate: draftData.dueDate,
        agentCompany: draftData.agentCompany,
        agentName: draftData.agentName,
        agentAddress: draftData.agentAddress,
        agentPhone: draftData.agentPhone,
        agentEmail: draftData.agentEmail,
        agentMahaRera: draftData.agentMahaRera,
        agentGstin: draftData.agentGstin,
        agentPan: draftData.agentPan,
        clientCompany: draftData.clientCompany,
        clientName: draftData.clientName,
        clientAddress: draftData.clientAddress,
        clientPhone: draftData.clientPhone,
        clientEmail: draftData.clientEmail,
        clientGstin: draftData.clientGstin,
        dealType: draftData.dealType,
        projectName: draftData.projectName,
        projectMahaRera: draftData.projectMahaRera,
        unitNumber: draftData.unitNumber,
        wingName: draftData.wingName,
        floorNumber: draftData.floorNumber,
        agreementValue: draftData.agreementValue,
        commissionType: draftData.commissionType,
        commissionRate: draftData.commissionRate,
        commissionAmount: draftData.commissionAmount,
        gstEnabled: draftData.gstEnabled,
        gstType: draftData.gstType,
        gstRate: draftData.gstRate,
        bankBeneficiary: draftData.bankBeneficiary,
        bankName: draftData.bankName,
        bankBranch: draftData.bankBranch,
        bankAccount: draftData.bankAccount,
        bankIfsc: draftData.bankIfsc,
        bankUpi: draftData.bankUpi,
        showUpiQr: draftData.showUpiQr,
        notes: draftData.notes,
        terms: draftData.terms,
        billToLabel: draftData.billToLabel,
        bankDetailsLabel: draftData.bankDetailsLabel,
        termsLabel: draftData.termsLabel,
        notesLabel: draftData.notesLabel,
        declarationLabel: draftData.declarationLabel
      };
      safeSetItem('maharera_shared_' + shareId, JSON.stringify(payload));
      const base64Fallback = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const shareUrl = `${window.location.origin}${window.location.pathname}?id=${shareId}&inv=${base64Fallback}`;
      const sharedAt = new Date().toLocaleString('en-IN');

      // Update the draft's metadata
      setSavedInvoices(prev => {
        const updated = prev.map(i =>
          i.shareId === shareId ? { ...i, ...payload, shareUrl, sharedAt } : i
        );
        safeSetItem('maharera_saved_invoices', JSON.stringify(updated));
        return updated;
      });

      navigator.clipboard.writeText(shareUrl).then(() => {
        const t = showToast('🔗 Link updated & copied!', '#059669');
        setTimeout(() => document.body.removeChild(t), 3000);
      }).catch(() => {
        prompt('Updated share link:', shareUrl);
      });
    } catch (e) {
      console.error('handleUpdateSharedLink error:', e);
    }
  };

  // Shared canvas capture helper — neutralizes zoom transform for clean capture
  const captureInvoiceCanvas = async () => {
    const element = document.getElementById('invoice-capture-area');
    if (!element) return null;

    // Temporarily remove CSS zoom transform so html2canvas captures at true 1:1 scale
    const scaleContainer = previewPanelRef.current?.getScaleContainer();
    const origTransform = scaleContainer ? scaleContainer.style.transform : null;
    const origMarginBottom = scaleContainer ? scaleContainer.style.marginBottom : null;
    const origWidth = scaleContainer ? scaleContainer.style.width : null;
    if (scaleContainer) {
      scaleContainer.style.transform = 'none';
      scaleContainer.style.marginBottom = '0';
      scaleContainer.style.width = 'auto';
    }

    // Wait a frame for the DOM to repaint without the transform
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      return canvas;
    } finally {
      // Always restore the transform
      if (scaleContainer) {
        scaleContainer.style.transform = origTransform || '';
        scaleContainer.style.marginBottom = origMarginBottom || '';
        scaleContainer.style.width = origWidth || '';
      }
    }
  };

  const showToast = (msg, color = '#0891b2') => {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:20px;right:20px;background:${color};color:#fff;padding:10px 20px;border-radius:6px;z-index:9999;font-weight:600;`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    return toast;
  };

  const handleDownloadPDF = async () => {
    const toast = showToast('Generating PDF…', '#0891b2');
    try {
      const canvas = await captureInvoiceCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      // Page sized to match content exactly — no stretch
      const pdfW = 210;
      const pdfH = (canvas.height / canvas.width) * pdfW;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pdfW, pdfH] });
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');
      pdf.save(`maharera_invoice_${invoiceData.invoiceNumber || 'draft'}.pdf`);
      trackExportEvent();
    } catch (err) {
      console.error('PDF error:', err);
      alert('PDF generation failed. Use "Print / Save PDF" instead.');
    } finally {
      document.body.removeChild(toast);
    }
  };

  // Force strict A4 (210×297mm) — scales to fit; ideal for physical printing
  const handleDownloadA4PDF = async () => {
    const toast = showToast('Generating A4 PDF…', '#4f46e5');
    try {
      const canvas = await captureInvoiceCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const A4_W = 210, A4_H = 297;
      const contentH = (canvas.height / canvas.width) * A4_W;

      let imgW = A4_W, imgH = contentH, offsetX = 0, offsetY = 0;
      if (contentH > A4_H) {
        const scale = A4_H / contentH;
        imgH = A4_H; imgW = A4_W * scale;
        offsetX = (A4_W - imgW) / 2;
      } else {
        offsetY = (A4_H - contentH) / 2;
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', offsetX, offsetY, imgW, imgH, undefined, 'FAST');
      pdf.save(`maharera_invoice_A4_${invoiceData.invoiceNumber || 'draft'}.pdf`);
      trackExportEvent();
    } catch (err) {
      console.error('A4 PDF error:', err);
      alert('A4 PDF generation failed. Use "Print / Save PDF" instead.');
    } finally {
      document.body.removeChild(toast);
    }
  };

  const handleDownloadBlankA4PDF = async () => {
    const originalData = { ...invoiceData };
    const blankData = {
      ...originalData,
      _isBlankPDF: true
    };

    setInvoiceData(blankData);
    // Wait a brief tick for react to update the A4 template rendering in DOM
    await new Promise(resolve => setTimeout(resolve, 150));

    const toast = showToast('Generating Blank PDF…', '#6366f1');
    try {
      const canvas = await captureInvoiceCanvas();
      if (!canvas) return;

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const A4_W = 210, A4_H = 297;
      const contentH = (canvas.height / canvas.width) * A4_W;

      let imgW = A4_W, imgH = contentH, offsetX = 0, offsetY = 0;
      if (contentH > A4_H) {
        const scale = A4_H / contentH;
        imgH = A4_H; imgW = A4_W * scale;
        offsetX = (A4_W - imgW) / 2;
      } else {
        offsetY = (A4_H - contentH) / 2;
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', offsetX, offsetY, imgW, imgH, undefined, 'FAST');
      pdf.save(`maharera_blank_invoice_A4.pdf`);
    } catch (err) {
      console.error('Blank A4 PDF error:', err);
      alert('Blank A4 PDF generation failed. Please try again.');
    } finally {
      document.body.removeChild(toast);
      // Restore the original data immediately after capture
      setInvoiceData(originalData);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
    // Track into history
    trackExportEvent();
  };

  const selectedFontObj = fonts.find(f => f.id === invoiceData.activeFont) || fonts[0];

  return (
    <div className="app-main-wrapper flex flex-col min-h-screen">
      
      {/* Header Bar */}
      {viewOnly ? (
        <header className="app-header client-viewer-header">
          <div className="brand-section">
            <div className="brand-icon">A</div>
            <h1 className="brand-title">
              Aneesh Gupta <span>Client Viewer</span>
            </h1>
          </div>

          <div className="client-header-actions" ref={dropdownRef}>
            <button
              className="theme-toggle-btn animate-hover"
              onClick={() => setInfoModalOpen(true)}
              title="Learn why this app was built"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
            >
              <Info size={16} /> Why this was built?
            </button>

            <a 
              href="https://digitalheroesco.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary animate-hover flex items-center gap-1.5 text-sm py-1.5 px-3 h-auto"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', textDecoration: 'none', color: '#ffffff' }}
            >
              Built for Digital Heroes
            </a>

            <div className="client-actions-dropdown">
              <button
                className="client-view-btn client-view-btn-primary animate-hover flex items-center gap-1.5"
                onClick={() => setActionsDropdownOpen(!actionsDropdownOpen)}
                title="Download or Print Options"
              >
                <Download size={15} />
                <span className="client-btn-text">Download / Print</span>
                <ChevronDown size={14} className={`dropdown-caret-icon ${actionsDropdownOpen ? 'rotated' : ''}`} />
              </button>

              {actionsDropdownOpen && (
                <div className="dropdown-menu-list glassmorphic animate-fade-in">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      handleDownloadPDF();
                      setActionsDropdownOpen(false);
                    }}
                    title="Download PDF sized to invoice content"
                  >
                    <Download size={14} />
                    <span>Download PDF</span>
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      handleDownloadA4PDF();
                      setActionsDropdownOpen(false);
                    }}
                    title="Download strict A4 PDF — perfect for printing"
                  >
                    <FileText size={14} />
                    <span>Download A4 PDF</span>
                  </button>
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      handlePrintInvoice();
                      setActionsDropdownOpen(false);
                    }}
                    title="Print / Save as PDF via browser"
                  >
                    <Printer size={14} />
                    <span>Print Invoice</span>
                  </button>
                </div>
              )}
            </div>

            <button
              className="theme-toggle-btn animate-hover ml-1"
              onClick={handleToggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </header>
      ) : (
        <header className="app-header">
          <div className="brand-section">
            <div className="brand-icon">A</div>
            <h1 className="brand-title">
              Aneesh Gupta <span
                onDoubleClick={() => {
                  navigator.clipboard.writeText('aneeshgupta.work@gmail.com');
                  const t = showToast('📋 Email copied to clipboard!', '#10b981');
                  setTimeout(() => {
                    if (t && t.parentNode) t.parentNode.removeChild(t);
                  }, 2000);
                }}
                style={{ cursor: 'pointer' }}
                title="Double-click to copy email"
              >
                aneeshgupta.work@gmail.com
              </span>
              {editingSharedId && (
                <span className="live-sync-badge animate-fade-in" title="Edits automatically sync to your share link. Click the '×' to stop.">
                  <span className="live-sync-dot"></span> Live Syncing
                  <button 
                    className="live-sync-stop-x" 
                    onClick={() => {
                      setEditingSharedId(null);
                      const t = showToast('Stopped live sync. Edits now only save locally.', '#64748b');
                      setTimeout(() => {
                        if (t && t.parentNode) t.parentNode.removeChild(t);
                      }, 3000);
                    }}
                    title="Stop Live Sync"
                  >
                    ×
                  </button>
                </span>
              )}
            </h1>
          </div>

          <div className="header-actions">
            <button
              className="theme-toggle-btn animate-hover"
              onClick={() => setInfoModalOpen(true)}
              title="Learn why this app was built"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}
            >
              <Info size={16} /> Why this was built?
            </button>

            <a 
              href="https://digitalheroesco.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary animate-hover flex items-center gap-1.5 text-sm py-1.5 px-3 h-auto"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', textDecoration: 'none', color: '#ffffff' }}
            >
              Built for Digital Heroes
            </a>

            <button 
              className="btn-primary animate-hover flex items-center gap-1 text-sm py-1.5 px-3 h-auto"
              onClick={handleNewInvoice}
              title="Start a fresh invoice draft"
            >
              <Plus size={14} /> New Invoice
            </button>

            <button 
              className="theme-toggle-btn animate-hover"
              onClick={handleToggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <button 
              className="header-ghost-btn animate-hover"
              onClick={() => setSavedInvoicesOpen(true)}
              aria-label="Manage Workspace"
            >
              <Database size={16} /> Manage
            </button>
          </div>
        </header>
      )}

      {/* Main Workspace */}
      {viewOnly ? (
        <main className="view-only-workspace">
          {invoiceData._notFound ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: '60vh', gap: '1rem', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'
            }}>
              <div style={{ fontSize: '3rem' }}>🔗</div>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>Invoice Link Not Found</h2>
              <p style={{ maxWidth: '380px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                This link was generated on a different device. Invoice data is stored locally on the agent's browser.
                Please ask your agent to resend the updated link.
              </p>
              <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.5 }}>
                Link ID: {invoiceData._shareId}
              </p>
            </div>
          ) : (
            <PreviewPanel 
              ref={previewPanelRef}
              className="view-only-preview scrollbar-thin"
              style={{ fontFamily: selectedFontObj.family }}
              data={invoiceData}
              onFieldChange={handleFieldChange}
              onDownloadPDF={handleDownloadPDF}
              onDownloadA4PDF={handleDownloadA4PDF}
              onPrintInvoice={handlePrintInvoice}
              viewOnly={true}
            />
          )}
        </main>
      ) : (
        <main className="app-workspace-container flex-1">

          {/* Editor accordion - left side */}
          <EditorPanel 
            className={`editor-panel-wrapper scrollbar-thin ${activeTab === 'editor' ? 'mobile-active' : ''}`}
            data={invoiceData}
            onFieldChange={handleFieldChange}
            onOpenSignatureCanvas={() => setSignatureCanvasOpen(true)}
            onOpenSavedInvoices={() => setSavedInvoicesOpen(true)}
            templates={templates}
            fonts={fonts}
            colorPresets={colorPresets}
          />

          {/* Live preview - right side */}
          <PreviewPanel 
            ref={previewPanelRef}
            className={`preview-panel-wrapper ${activeTab === 'preview' ? 'mobile-active' : ''}`}
            style={{ fontFamily: selectedFontObj.family }}
            data={invoiceData}
            onFieldChange={handleFieldChange}
            onDownloadPDF={handleDownloadPDF}
            onDownloadA4PDF={handleDownloadA4PDF}
            onDownloadBlankPDF={handleDownloadBlankA4PDF}
            onPrintInvoice={handlePrintInvoice}
            onShareLink={handleShareLink}
            viewOnly={false}
          />
        </main>
      )}

      {/* Mobile Tab Swapper Navigation */}
      {!viewOnly && (
        <div className="mobile-tab-bar">
          <button 
            className={`mobile-tab-btn ${activeTab === 'editor' ? 'active' : ''}`}
            onClick={() => setActiveTab('editor')}
          >
            <Edit3 size={18} />
            <span>Editor</span>
          </button>
          
          <button 
            className={`mobile-tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            <Eye size={18} />
            <span>Preview</span>
          </button>
        </div>
      )}

      {/* Overlay Modals */}
      {infoModalOpen && (
        <div className="signature-overlay animate-fade-in" style={{ zIndex: 2000 }}>
          <div className="signature-modal glassmorphic animate-slide-in" style={{ width: '600px', maxWidth: '90vw', padding: '2rem' }}>
            <div className="signature-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={24} style={{ color: 'var(--primary-accent)' }} />
                <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
                  Why This Was Built
                </h2>
              </div>
              <button 
                className="close-btn" 
                onClick={() => setInfoModalOpen(false)}
                style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <div className="signature-body" style={{ color: 'var(--text-main)', fontSize: '0.92rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1.25rem', overflowY: 'auto', maxHeight: '60vh', paddingRight: '0.5rem' }}>
              <p>
                Hi! I'm <strong>Aneesh Gupta</strong>. I built this tool to solve a real-life challenge for my parents.
              </p>
              
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid var(--primary-accent)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--primary-accent)' }}>The Problem</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  My mom and dad work in the challenging and fast-paced real estate industry. For years, I watched them spend hours manually typing and formatting complex MahaRERA-compliant commission invoices in Microsoft Word. It was tedious, frustrating, and prone to formatting issues.
                </p>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderLeft: '4px solid var(--secondary-accent)', padding: '1rem', borderRadius: '0 8px 8px 0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--secondary-accent)' }}>The Solution</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                  I wished they had a simple, free, online tool to generate professional invoices instantly. Since I couldn't find one that fit their exact needs, I built this generator. Now, they can customize details, manage templates, draw signatures, and download print-ready A4 PDFs in just under a minute.
                </p>
              </div>

              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.5rem', textAlign: 'center' }}>
                Built with ❤️ to simplify operations for independent real estate heroes.
              </p>
            </div>

            <div className="signature-footer" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn-primary animate-hover" 
                onClick={() => setInfoModalOpen(false)}
                style={{ height: '2.25rem', padding: '0 1.5rem', cursor: 'pointer' }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {signatureCanvasOpen && (
        <SignatureCanvas 
          onSave={(sig) => handleFieldChange('signatureData', sig)}
          onClose={() => setSignatureCanvasOpen(false)}
        />
      )}

      {savedInvoicesOpen && (
        <SavedInvoices 
          invoices={savedInvoices}
          onLoad={handleLoadInvoice}
          onDelete={handleDeleteInvoice}
          onSaveCurrent={handleSaveCurrent}
          onNewInvoice={handleNewInvoice}
          exportHistory={exportHistory}
          onDeleteHistory={handleDeleteHistory}
          onClearHistory={handleClearHistory}
          onUpdateSharedLink={handleUpdateSharedLink}
          onClose={() => setSavedInvoicesOpen(false)}
        />
      )}

    </div>
  );
}
