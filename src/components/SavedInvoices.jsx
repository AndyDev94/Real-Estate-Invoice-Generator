import React from 'react';
import { FileText, Trash2, Calendar, User, Building, CornerDownLeft, Plus, X, History, Layers, Search, Link, RefreshCw, Copy, Clock, Edit3 } from 'lucide-react';
import { formatIndianCurrency, formatDateToIndian } from '../utils/numberToWords';

export default function SavedInvoices({ 
  invoices, 
  onLoad, 
  onDelete, 
  onSaveCurrent, 
  onNewInvoice,
  exportHistory = [],
  onDeleteHistory, 
  onClearHistory,
  onUpdateSharedLink,
  onClose 
}) {
  const [activeTab, setActiveTab] = React.useState('drafts'); // 'drafts', 'history'
  const [searchQuery, setSearchQuery] = React.useState('');

  // Filter helper — matches any of the key fields
  const filterList = (list) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;
    return list.filter(item =>
      (item.invoiceNumber || '').toLowerCase().includes(q) ||
      (item.clientName || '').toLowerCase().includes(q) ||
      (item.clientCompany || '').toLowerCase().includes(q) ||
      (item.projectName || '').toLowerCase().includes(q) ||
      (item.agentCompany || '').toLowerCase().includes(q)
    );
  };

  const filteredDrafts = filterList(invoices);
  const filteredHistory = filterList(exportHistory);

  const copyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      // Brief visual feedback via alert-free approach
    }).catch(() => prompt('Share URL:', url));
  };

  return (
    <div className="saved-invoices-sidebar-overlay">
      <div className="saved-invoices-sidebar glassmorphic animate-slide-in">
        <div className="sidebar-header">
          <h3>Workspace Manager</h3>
          <button className="close-btn animate-hover" onClick={onClose} aria-label="Close Sidebar">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="sidebar-search-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search by invoice #, client, project…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search invoices"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="signature-tabs mb-3 flex gap-2 border-b border-[rgba(255,255,255,0.08)]">
          <button 
            className={`sig-tab-btn flex-1 justify-center py-2 ${activeTab === 'drafts' ? 'active font-bold' : ''}`}
            onClick={() => setActiveTab('drafts')}
          >
            <Layers size={14} className="mr-1 inline" /> Drafts ({invoices.length})
          </button>
          <button 
            className={`sig-tab-btn flex-1 justify-center py-2 ${activeTab === 'history' ? 'active font-bold' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={14} className="mr-1 inline" /> History ({exportHistory.length})
          </button>
        </div>

        {activeTab === 'drafts' ? (
          <>
            <div className="sidebar-actions flex flex-col gap-2">
              <button className="btn-primary w-full animate-hover" onClick={onSaveCurrent}>
                <Plus size={16} /> Save Current as Draft
              </button>
              <button className="btn-accent w-full animate-hover flex justify-center items-center gap-2" onClick={onNewInvoice}>
                <Plus size={16} /> Start New Invoice
              </button>
            </div>

            <div className="sidebar-body mt-3 scrollbar-thin overflow-y-auto pr-1">
              {invoices.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} className="empty-icon" />
                  <p>No saved drafts found</p>
                  <span className="subtext">Your drafts will appear here when you click "Save Current as Draft"</span>
                </div>
              ) : filteredDrafts.length === 0 ? (
                <div className="empty-state">
                  <Search size={40} className="empty-icon" />
                  <p>No matching drafts</p>
                  <span className="subtext">Try a different search term</span>
                </div>
              ) : (
                <div className="invoice-list animate-fade-in">
                  {filteredDrafts.map((inv) => {
                    const brokerageVal = parseFloat(inv.commissionAmount) || 0;
                    const totalAmount = brokerageVal + (inv.gstEnabled ? (brokerageVal * (parseFloat(inv.gstRate) || 18) / 100) : 0);
                    const isShared = !!inv.shareId;
                    return (
                      <div key={inv.id} className={`invoice-card hover-lift ${isShared ? 'invoice-card-shared' : ''}`}>
                        <div className="card-header">
                          <div className="card-title-row">
                            <span className="invoice-num">{inv.invoiceNumber || 'Draft (No #)'}</span>
                            {isShared && (
                              <span className="shared-badge" title={`Shared on ${inv.sharedAt}`}>
                                <Link size={10} /> Shared
                              </span>
                            )}
                          </div>
                          <div className="card-actions">
                            <button 
                              className="action-icon-btn load-btn animate-hover"
                              onClick={() => onLoad(inv)}
                              title="Edit / Load Invoice"
                              aria-label={`Edit draft ${inv.invoiceNumber}`}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              className="action-icon-btn delete-btn animate-hover"
                              onClick={() => onDelete(inv.id)}
                              title="Delete Draft"
                              aria-label={`Delete draft ${inv.invoiceNumber}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="card-details">
                          <div className="detail-item">
                            <User size={12} />
                            <span>{inv.clientName || 'Unnamed Client'}</span>
                          </div>
                          {inv.projectName && (
                            <div className="detail-item">
                              <Building size={12} />
                              <span>{inv.projectName}</span>
                            </div>
                          )}
                          <div className="detail-item">
                            <Calendar size={12} />
                            <span>{formatDateToIndian(inv.invoiceDate) || 'No Date'}</span>
                          </div>
                          {isShared && inv.sharedAt && (
                            <div className="detail-item shared-date-item">
                              <Clock size={12} />
                              <span>Shared: {inv.sharedAt}</span>
                            </div>
                          )}
                        </div>

                        <div className="card-footer-details">
                          <span className="invoice-total">
                            {formatIndianCurrency(totalAmount)}
                          </span>
                          {isShared && (
                            <div className="shared-link-actions">
                              <button
                                className="shared-action-btn update-link-btn animate-hover"
                                onClick={() => onUpdateSharedLink && onUpdateSharedLink(inv.shareId, inv)}
                                title="Re-save latest data to this link"
                              >
                                <RefreshCw size={11} /> Update Link
                              </button>
                              <button
                                className="shared-action-btn copy-link-btn animate-hover"
                                onClick={() => copyLink(inv.shareUrl)}
                                title="Copy share URL"
                              >
                                <Copy size={11} /> Copy Link
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {exportHistory.length > 0 && (
              <div className="sidebar-actions">
                <button 
                  className="btn-danger-sm w-full animate-hover py-2 text-xs uppercase font-bold tracking-wider" 
                  onClick={onClearHistory}
                >
                  <Trash2 size={12} className="inline mr-1" /> Clear Export History
                </button>
              </div>
            )}

            <div className="sidebar-body mt-3 scrollbar-thin overflow-y-auto pr-1">
              {exportHistory.length === 0 ? (
                <div className="empty-state">
                  <History size={48} className="empty-icon" />
                  <p>No export history found</p>
                  <span className="subtext">Invoices you download as PDF or print will be automatically tracked here!</span>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="empty-state">
                  <Search size={40} className="empty-icon" />
                  <p>No matching history</p>
                  <span className="subtext">Try a different search term</span>
                </div>
              ) : (
                <div className="invoice-list animate-fade-in">
                  {filteredHistory.map((item) => {
                    const brokerageVal = parseFloat(item.commissionAmount) || 0;
                    const totalAmount = brokerageVal + (item.gstEnabled ? (brokerageVal * (parseFloat(item.gstRate) || 18) / 100) : 0);
                    return (
                      <div key={item.id} className="invoice-card hover-lift">
                        <div className="card-header">
                          <span className="invoice-num">{item.invoiceNumber || 'Exported Invoice'}</span>
                          <div className="card-actions">
                            <button 
                              className="action-icon-btn load-btn animate-hover"
                              onClick={() => onLoad(item)}
                              title="Re-populate Invoice Data"
                              aria-label={`Load exported invoice ${item.invoiceNumber}`}
                            >
                              <CornerDownLeft size={16} />
                            </button>
                            <button 
                              className="action-icon-btn delete-btn animate-hover"
                              onClick={() => onDeleteHistory(item.id)}
                              title="Delete from History"
                              aria-label={`Delete history item ${item.invoiceNumber}`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="card-details">
                          <div className="detail-item">
                            <User size={12} />
                            <span>{item.clientName || 'Unnamed Client'}</span>
                          </div>
                          {item.projectName && (
                            <div className="detail-item">
                              <Building size={12} />
                              <span>{item.projectName}</span>
                            </div>
                          )}
                          <div className="detail-item font-mono text-[10px] text-cyan-500">
                            <span>Exported: {item.timestamp}</span>
                          </div>
                        </div>

                        <div className="card-footer-details">
                          <span className="invoice-total">
                            {formatIndianCurrency(totalAmount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
