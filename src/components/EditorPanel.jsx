import React, { useState } from 'react';
import { 
  Palette, User, Building, Landmark, Settings, 
  ChevronDown, ChevronUp, Image, PenTool, Database, HelpCircle, Trash2
} from 'lucide-react';

export default function EditorPanel({ 
  className,
  data, 
  onFieldChange, 
  onOpenSignatureCanvas, 
  onOpenSavedInvoices,
  onShareLink,
  templates,
  fonts,
  colorPresets
}) {
  const [activeSection, setActiveSection] = useState('templates');

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onFieldChange('agentLogo', event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onFieldChange('agentLogo', '');
  };

  // Helper to sync calculated brokerage when Agreement Value or Rate changes
  const handleAgreementValueChange = (e) => {
    const val = e.target.value;
    onFieldChange('agreementValue', val);
    
    // If percentage, update the numeric brokerage amount
    if (data.commissionType === 'percentage') {
      const rate = parseFloat(data.commissionRate) || 0;
      const numVal = parseFloat(val) || 0;
      onFieldChange('commissionAmount', (numVal * rate / 100).toString());
    }
  };

  const handleCommissionRateChange = (e) => {
    const rate = e.target.value;
    onFieldChange('commissionRate', rate);
    
    if (data.commissionType === 'percentage') {
      const numVal = parseFloat(data.agreementValue) || 0;
      const numRate = parseFloat(rate) || 0;
      onFieldChange('commissionAmount', (numVal * numRate / 100).toString());
    }
  };

  const handleCommissionTypeChange = (e) => {
    const type = e.target.value;
    onFieldChange('commissionType', type);
    
    if (type === 'percentage') {
      const numVal = parseFloat(data.agreementValue) || 0;
      const rate = parseFloat(data.commissionRate) || 0;
      onFieldChange('commissionAmount', (numVal * rate / 100).toString());
    }
  };

  const handleCommissionAmountChange = (e) => {
    onFieldChange('commissionAmount', e.target.value);
  };

  return (
    <div className={`${className || 'editor-panel-wrapper'} glassmorphic`}>
      {/* Accordion List */}
      <div className="editor-accordion">
        
        {/* SECTION 1: TEMPLATE & CUSTOMIZATION */}
        <div className={`accordion-item ${activeSection === 'templates' ? 'open' : ''}`}>
          <button className="accordion-trigger" onClick={() => toggleSection('templates')}>
            <span className="trigger-title"><Palette size={18} /> Style & Templates</span>
            {activeSection === 'templates' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="accordion-content">
            <div className="form-group">
              <label>Select Template Layout</label>
              <div className="template-grid">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    className={`template-select-card animate-hover ${data.activeTemplate === t.id ? 'active' : ''}`}
                    onClick={() => onFieldChange('activeTemplate', t.id)}
                  >
                    <span className="template-card-title">{t.name}</span>
                    <span className="template-card-desc">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Select Typography Font</label>
              <select
                value={data.activeFont}
                onChange={(e) => onFieldChange('activeFont', e.target.value)}
                className="theme-input"
              >
                {fonts.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Accent Brand Color</label>
              <div className="color-presets-row">
                {colorPresets.map((color) => (
                  <button
                    key={color.value}
                    className={`color-preset-btn ${data.accentColor === color.value ? 'active' : ''}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => onFieldChange('accentColor', color.value)}
                    title={color.name}
                    aria-label={`Color preset ${color.name}`}
                  />
                ))}
                
                {/* Custom Color Picker */}
                <div className="custom-color-picker-container" title="Custom Color">
                  <input
                    type="color"
                    value={data.accentColor}
                    onChange={(e) => onFieldChange('accentColor', e.target.value)}
                    className="custom-color-input"
                    id="custom-color-picker"
                  />
                  <label htmlFor="custom-color-picker" className="custom-color-label" style={{ backgroundColor: data.accentColor }}>
                    <span>🎨</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: BROKER PROFILE */}
        <div className={`accordion-item ${activeSection === 'broker' ? 'open' : ''}`}>
          <button className="accordion-trigger" onClick={() => toggleSection('broker')}>
            <span className="trigger-title"><User size={18} /> Broker/Agent Profile</span>
            {activeSection === 'broker' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="accordion-content">
            <div className="logo-upload-group form-group">
              <label>Agency Logo / Image</label>
              {data.agentLogo ? (
                <div className="logo-uploaded-preview">
                  <img src={data.agentLogo} alt="Logo preview" />
                  <button className="btn-danger-sm" onClick={removeLogo}>Remove Logo</button>
                </div>
              ) : (
                <div className="logo-upload-box">
                  <input 
                    type="file" 
                    id="agent-logo-input" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="agent-logo-input" className="logo-upload-label">
                    <Image size={24} />
                    <span>Upload Logo Image</span>
                  </label>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="agent-company-name">Agency / Company Name</label>
                <input 
                  id="agent-company-name"
                  type="text" 
                  value={data.agentCompany}
                  onChange={(e) => onFieldChange('agentCompany', e.target.value)}
                  placeholder="e.g. Landmark Realty Services"
                  className="theme-input"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="agent-individual-name">Agent Name</label>
                <input 
                  id="agent-individual-name"
                  type="text" 
                  value={data.agentName}
                  onChange={(e) => onFieldChange('agentName', e.target.value)}
                  placeholder="e.g. Ramesh K. Mehta"
                  className="theme-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label htmlFor="agent-maharera-num">MahaRERA Registration Number *</label>
                <span className="info-tag text-xs font-mono text-cyan-400">Compulsory</span>
              </div>
              <input 
                id="agent-maharera-num"
                type="text" 
                value={data.agentMahaRera}
                onChange={(e) => onFieldChange('agentMahaRera', e.target.value)}
                placeholder="e.g. A51900012345"
                className="theme-input font-mono"
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="agent-email-addr">Broker Email</label>
                <input 
                  id="agent-email-addr"
                  type="email" 
                  value={data.agentEmail}
                  onChange={(e) => onFieldChange('agentEmail', e.target.value)}
                  placeholder="broker@domain.com"
                  className="theme-input"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="agent-phone-num">Broker Phone</label>
                <input 
                  id="agent-phone-num"
                  type="text" 
                  value={data.agentPhone}
                  onChange={(e) => onFieldChange('agentPhone', e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="theme-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="agent-address-details">Address</label>
              <textarea 
                id="agent-address-details"
                value={data.agentAddress}
                onChange={(e) => onFieldChange('agentAddress', e.target.value)}
                placeholder="Office Address"
                className="theme-input rows-2"
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="agent-gstin-num">GSTIN (Optional)</label>
                <input 
                  id="agent-gstin-num"
                  type="text" 
                  value={data.agentGstin}
                  onChange={(e) => onFieldChange('agentGstin', e.target.value)}
                  placeholder="e.g. 27AAAAA1111A1Z1"
                  className="theme-input font-mono"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="agent-pan-num">PAN (Optional)</label>
                <input 
                  id="agent-pan-num"
                  type="text" 
                  value={data.agentPan}
                  onChange={(e) => onFieldChange('agentPan', e.target.value)}
                  placeholder="e.g. ABCDE1234F"
                  className="theme-input font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: CLIENT INFO */}
        <div className={`accordion-item ${activeSection === 'client' ? 'open' : ''}`}>
          <button className="accordion-trigger" onClick={() => toggleSection('client')}>
            <span className="trigger-title"><Building size={18} /> Client Details</span>
            {activeSection === 'client' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="accordion-content">
            <div className="form-group">
              <label htmlFor="client-company-name">Client Company / Developer</label>
              <input 
                id="client-company-name"
                type="text" 
                value={data.clientCompany}
                onChange={(e) => onFieldChange('clientCompany', e.target.value)}
                placeholder="e.g. Lodha Group / Godrej Properties"
                className="theme-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="client-individual-name">Contact Person / Owner Name</label>
              <input 
                id="client-individual-name"
                type="text" 
                value={data.clientName}
                onChange={(e) => onFieldChange('clientName', e.target.value)}
                placeholder="e.g. Mr. Amit Shah (Director)"
                className="theme-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="client-address-details">Billing Address</label>
              <textarea 
                id="client-address-details"
                value={data.clientAddress}
                onChange={(e) => onFieldChange('clientAddress', e.target.value)}
                placeholder="Full billing address of builder or client"
                className="theme-input rows-2"
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="client-email-addr">Client Email</label>
                <input 
                  id="client-email-addr"
                  type="email" 
                  value={data.clientEmail}
                  onChange={(e) => onFieldChange('clientEmail', e.target.value)}
                  placeholder="client@domain.com"
                  className="theme-input"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="client-phone-num">Client Phone</label>
                <input 
                  id="client-phone-num"
                  type="text" 
                  value={data.clientPhone}
                  onChange={(e) => onFieldChange('clientPhone', e.target.value)}
                  placeholder="Contact Number"
                  className="theme-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="client-gstin-num">Client GSTIN (Optional)</label>
              <input 
                id="client-gstin-num"
                type="text" 
                value={data.clientGstin}
                onChange={(e) => onFieldChange('clientGstin', e.target.value)}
                placeholder="Client GST Identification Number"
                className="theme-input font-mono"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PROPERTY & TRANSACTION DETAILS */}
        <div className={`accordion-item ${activeSection === 'property' ? 'open' : ''}`}>
          <button className="accordion-trigger" onClick={() => toggleSection('property')}>
            <span className="trigger-title"><Settings size={18} /> Property & Deal Details</span>
            {activeSection === 'property' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="accordion-content">
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="deal-type-select">Transaction Service</label>
                <select
                  id="deal-type-select"
                  value={data.dealType}
                  onChange={(e) => onFieldChange('dealType', e.target.value)}
                  className="theme-input"
                >
                  <option value="sale">Sale / Outright Purchase</option>
                  <option value="lease">Lease / Renting Services</option>
                  <option value="resale">Resale Transaction</option>
                </select>
              </div>
              
              <div className="form-group flex-1">
                <label htmlFor="project-name-input">Project Name</label>
                <input 
                  id="project-name-input"
                  type="text" 
                  value={data.projectName}
                  onChange={(e) => onFieldChange('projectName', e.target.value)}
                  placeholder="e.g. Lodha World Towers"
                  className="theme-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="flex justify-between items-center">
                <label htmlFor="project-maharera-num">MahaRERA Project Registration No</label>
                <span className="info-tag text-xs font-mono">P518000XXXXX</span>
              </div>
              <input 
                id="project-maharera-num"
                type="text" 
                value={data.projectMahaRera}
                onChange={(e) => onFieldChange('projectMahaRera', e.target.value)}
                placeholder="e.g. P51900067890"
                className="theme-input font-mono"
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="property-unit-num">Unit / Flat No</label>
                <input 
                  id="property-unit-num"
                  type="text" 
                  value={data.unitNumber}
                  onChange={(e) => onFieldChange('unitNumber', e.target.value)}
                  placeholder="e.g. 501"
                  className="theme-input"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="property-wing-name">Wing / Block</label>
                <input 
                  id="property-wing-name"
                  type="text" 
                  value={data.wingName}
                  onChange={(e) => onFieldChange('wingName', e.target.value)}
                  placeholder="e.g. A Wing"
                  className="theme-input"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="property-floor-num">Floor</label>
                <input 
                  id="property-floor-num"
                  type="text" 
                  value={data.floorNumber}
                  onChange={(e) => onFieldChange('floorNumber', e.target.value)}
                  placeholder="e.g. 5th Floor"
                  className="theme-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="property-agreement-val">Property Consideration / Agreement Value (INR)</label>
              <div className="input-with-symbol">
                <span className="input-symbol">₹</span>
                <input 
                  id="property-agreement-val"
                  type="number" 
                  value={data.agreementValue}
                  onChange={handleAgreementValueChange}
                  placeholder="e.g. 15000000 (1.5 Crore)"
                  className="theme-input pl-6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: CALCULATIONS & TAX */}
        <div className={`accordion-item ${activeSection === 'calculations' ? 'open' : ''}`}>
          <button className="accordion-trigger" onClick={() => toggleSection('calculations')}>
            <span className="trigger-title"><Landmark size={18} /> Financials & Invoicing</span>
            {activeSection === 'calculations' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="accordion-content">
            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="commission-model-select">Commission Model</label>
                <select
                  id="commission-model-select"
                  value={data.commissionType}
                  onChange={handleCommissionTypeChange}
                  className="theme-input"
                >
                  <option value="percentage">Percentage-based (%)</option>
                  <option value="fixed">Fixed Commission Fee (INR)</option>
                </select>
              </div>

              {data.commissionType === 'percentage' ? (
                <div className="form-group flex-1">
                  <label htmlFor="commission-rate-pct">Commission Rate (%)</label>
                  <input 
                    id="commission-rate-pct"
                    type="number" 
                    step="0.01"
                    value={data.commissionRate}
                    onChange={handleCommissionRateChange}
                    placeholder="e.g. 2%"
                    className="theme-input"
                  />
                </div>
              ) : null}
            </div>

            <div className="form-group">
              <label htmlFor="base-brokerage-amt">Base Brokerage Amount (INR)</label>
              <div className="input-with-symbol">
                <span className="input-symbol">₹</span>
                <input 
                  id="base-brokerage-amt"
                  type="number" 
                  value={data.commissionAmount}
                  onChange={handleCommissionAmountChange}
                  placeholder="Base Brokerage Amount"
                  className="theme-input pl-6"
                  disabled={data.commissionType === 'percentage'}
                />
              </div>
              {data.commissionType === 'percentage' && (
                <span className="input-helper-text">Calculated as {data.commissionRate}% of {data.agreementValue || 0}</span>
              )}
            </div>

            <div className="gst-toggle-group form-group glass-panel p-3 rounded-lg mb-3">
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-sm">Charge GST (18%)</label>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={data.gstEnabled} 
                    onChange={(e) => onFieldChange('gstEnabled', e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {data.gstEnabled && (
                <div className="gst-config-subfields animate-fade-in">
                  <div className="form-row mb-2">
                    <div className="form-group flex-1">
                      <label htmlFor="gst-type-select">GST Location Type</label>
                      <select
                        id="gst-type-select"
                        value={data.gstType}
                        onChange={(e) => onFieldChange('gstType', e.target.value)}
                        className="theme-input"
                      >
                        <option value="cgst_sgst">CGST (9%) + SGST (9%) - Local</option>
                        <option value="igst">IGST (18%) - Inter-state</option>
                      </select>
                    </div>

                    <div className="form-group flex-1">
                      <label htmlFor="gst-rate-input">GST Rate (%)</label>
                      <input 
                        id="gst-rate-input"
                        type="number" 
                        value={data.gstRate}
                        onChange={(e) => onFieldChange('gstRate', e.target.value)}
                        className="theme-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="invoice-num-input">Invoice Number</label>
                <input 
                  id="invoice-num-input"
                  type="text" 
                  value={data.invoiceNumber}
                  onChange={(e) => onFieldChange('invoiceNumber', e.target.value)}
                  placeholder="e.g. MERA/2026/001"
                  className="theme-input font-mono"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="invoice-date-input">Invoice Date</label>
                <input 
                  id="invoice-date-input"
                  type="date" 
                  value={data.invoiceDate}
                  onChange={(e) => onFieldChange('invoiceDate', e.target.value)}
                  className="theme-input"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="due-date-input">Due Date</label>
                <input 
                  id="due-date-input"
                  type="date" 
                  value={data.dueDate}
                  onChange={(e) => onFieldChange('dueDate', e.target.value)}
                  className="theme-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: BANK DETAILS */}
        <div className={`accordion-item ${activeSection === 'bank' ? 'open' : ''}`}>
          <button className="accordion-trigger" onClick={() => toggleSection('bank')}>
            <span className="trigger-title"><Landmark size={18} /> Bank & Payments</span>
            {activeSection === 'bank' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="accordion-content">
            <div className="form-group">
              <label htmlFor="bank-beneficiary-name">Account Holder / Beneficiary Name</label>
              <input 
                id="bank-beneficiary-name"
                type="text" 
                value={data.bankBeneficiary}
                onChange={(e) => onFieldChange('bankBeneficiary', e.target.value)}
                placeholder="Name on bank account"
                className="theme-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="bank-name-input">Bank Name</label>
                <input 
                  id="bank-name-input"
                  type="text" 
                  value={data.bankName}
                  onChange={(e) => onFieldChange('bankName', e.target.value)}
                  placeholder="e.g. HDFC Bank"
                  className="theme-input"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="bank-branch-name">Branch Name</label>
                <input 
                  id="bank-branch-name"
                  type="text" 
                  value={data.bankBranch}
                  onChange={(e) => onFieldChange('bankBranch', e.target.value)}
                  placeholder="e.g. Bandra West, Mumbai"
                  className="theme-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="bank-account-num">Account Number</label>
                <input 
                  id="bank-account-num"
                  type="text" 
                  value={data.bankAccount}
                  onChange={(e) => onFieldChange('bankAccount', e.target.value)}
                  placeholder="Account Number"
                  className="theme-input font-mono"
                />
              </div>
              <div className="form-group flex-1">
                <label htmlFor="bank-ifsc-code">IFSC Code</label>
                <input 
                  id="bank-ifsc-code"
                  type="text" 
                  value={data.bankIfsc}
                  onChange={(e) => onFieldChange('bankIfsc', e.target.value)}
                  placeholder="Bank IFSC Code"
                  className="theme-input font-mono"
                />
              </div>
            </div>

            <div className="gst-toggle-group form-group glass-panel p-3 rounded-lg mt-3">
              <div className="flex justify-between items-center mb-2">
                <label className="font-semibold text-sm">Add UPI QR Code</label>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={data.showUpiQr || false} 
                    onChange={(e) => onFieldChange('showUpiQr', e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {data.showUpiQr && (
                <div className="form-group animate-fade-in">
                  <label htmlFor="bank-upi-id">UPI ID (VPA)</label>
                  <input 
                    id="bank-upi-id"
                    type="text" 
                    value={data.bankUpi || ''}
                    onChange={(e) => onFieldChange('bankUpi', e.target.value)}
                    placeholder="e.g. aneesh@okaxis"
                    className="theme-input font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 7: SIGNATURE & NOTES */}
        <div className={`accordion-item ${activeSection === 'signature' ? 'open' : ''}`}>
          <button className="accordion-trigger" onClick={() => toggleSection('signature')}>
            <span className="trigger-title"><PenTool size={18} /> Signature & Terms</span>
            {activeSection === 'signature' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          <div className="accordion-content">
            <div className="form-group">
              <label>Digital Signature</label>
              {data.signatureData ? (
                <div className="editor-signature-preview">
                  <div className="img-wrap">
                    <img src={data.signatureData} alt="Signature stamp" />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="btn-accent-sm flex-1" onClick={onOpenSignatureCanvas}>
                      Update Signature
                    </button>
                    <button 
                      className="btn-danger-sm flex-shrink-0 flex items-center justify-center p-2" 
                      onClick={() => onFieldChange('signatureData', '')}
                      title="Remove Signature"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="btn-accent flex w-full justify-center items-center gap-2"
                  onClick={onOpenSignatureCanvas}
                >
                  <PenTool size={16} /> Add Digital Signature
                </button>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="notes-text-area">Invoice Notes (Optional)</label>
              <textarea 
                id="notes-text-area"
                value={data.notes}
                onChange={(e) => onFieldChange('notes', e.target.value)}
                placeholder="e.g. Thank you for your business!"
                className="theme-input rows-2"
              />
            </div>

            <div className="form-group">
              <label htmlFor="terms-text-area">Terms and Conditions</label>
              <textarea 
                id="terms-text-area"
                value={data.terms}
                onChange={(e) => onFieldChange('terms', e.target.value)}
                placeholder="Standard Brokerage terms"
                className="theme-input rows-3"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
