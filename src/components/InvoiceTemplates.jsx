import React from 'react';
import { formatIndianCurrency as origFormatIndianCurrency, numberToWords as origNumberToWords, formatDateToIndian } from '../utils/numberToWords';

export default function InvoiceTemplates({ 
  data, 
  onFieldChange, 
  activeTemplate, 
  accentColor,
  viewOnly = false
}) {
  const {
    invoiceNumber: rawInvoiceNumber, invoiceDate: rawInvoiceDate, dueDate: rawDueDate,
    agentName, agentCompany, agentAddress, agentPhone, agentEmail, agentMahaRera, agentGstin, agentPan, agentLogo,
    clientName: rawClientName, clientCompany: rawClientCompany, clientAddress: rawClientAddress, clientPhone: rawClientPhone, clientEmail: rawClientEmail, clientGstin: rawClientGstin,
    dealType, projectName: rawProjectName, projectMahaRera: rawProjectMahaRera, unitNumber: rawUnitNumber, wingName: rawWingName, floorNumber: rawFloorNumber,
    agreementValue, commissionRate: rawCommissionRate, commissionAmount, commissionType: rawCommissionType,
    gstEnabled, gstType, gstRate,
    bankName, bankBranch, bankAccount, bankIfsc, bankBeneficiary, bankUpi, showUpiQr: rawShowUpiQr,
    signatureData: rawSignatureData, notes, terms,
    billToLabel, bankDetailsLabel, paymentMethodLabel, termsLabel, notesLabel, declarationLabel
  } = data;

  const isBlank = data._isBlankPDF;

  // Shadow properties for Blank PDF mode
  const clientCompany = isBlank ? '__________________________________' : rawClientCompany;
  const clientName = isBlank ? '__________________________________' : rawClientName;
  const clientAddress = isBlank ? '__________________________________\n__________________________________' : rawClientAddress;
  const clientPhone = isBlank ? '__________________' : rawClientPhone;
  const clientEmail = isBlank ? '__________________' : rawClientEmail;
  const clientGstin = isBlank ? '__________________' : rawClientGstin;

  const projectName = isBlank ? '__________________________________' : rawProjectName;
  const projectMahaRera = isBlank ? '__________________' : rawProjectMahaRera;
  const unitNumber = isBlank ? '_______' : rawUnitNumber;
  const wingName = isBlank ? '_______' : rawWingName;
  const floorNumber = isBlank ? '_______' : rawFloorNumber;

  const invoiceNumber = isBlank ? '__________________' : rawInvoiceNumber;
  const invoiceDate = isBlank ? '__________________' : rawInvoiceDate;
  const dueDate = isBlank ? '__________________' : rawDueDate;

  const commissionRate = isBlank ? '______' : rawCommissionRate;
  const commissionType = isBlank ? 'percentage' : rawCommissionType;
  const showUpiQr = isBlank ? false : rawShowUpiQr;
  const signatureData = isBlank ? '' : rawSignatureData;

  const formatIndianCurrency = (val) => {
    if (isBlank) return '₹ __________________';
    return origFormatIndianCurrency(val);
  };

  const numberToWords = (val) => {
    if (isBlank) return '________________________________________________________________________';
    return origNumberToWords(val);
  };

  // Numerical parsers
  const valAgreement = parseFloat(agreementValue) || 0;
  const valRate = parseFloat(rawCommissionRate) || 0;
  
  // Calculate commission
  const calculatedCommission = commissionType === 'percentage' 
    ? (valAgreement * valRate / 100) 
    : (parseFloat(commissionAmount) || 0);

  // GST calculations
  const gstPct = parseFloat(gstRate) || 18;
  const taxAmount = gstEnabled ? (calculatedCommission * gstPct / 100) : 0;
  const totalInvoiceVal = calculatedCommission + taxAmount;

  // Split tax for local GST
  const cgstAmt = gstEnabled && gstType === 'cgst_sgst' ? (taxAmount / 2) : 0;
  const sgstAmt = gstEnabled && gstType === 'cgst_sgst' ? (taxAmount / 2) : 0;
  const igstAmt = gstEnabled && gstType === 'igst' ? taxAmount : 0;

  const amountInWordsText = numberToWords(totalInvoiceVal);

  const payeeName = encodeURIComponent(agentCompany || agentName || '');
  const payeeAddress = encodeURIComponent(bankUpi || '');
  const upiNotes = encodeURIComponent(`Invoice ${invoiceNumber || 'Draft'}`);
  const upiString = `upi://pay?pa=${payeeAddress}&pn=${payeeName}&am=${totalInvoiceVal.toFixed(2)}&cu=INR&tn=${upiNotes}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiString)}`;

  const handleBlur = (field, event) => {
    onFieldChange(field, event.target.textContent);
  };

  // Generate description for invoice table
  const defaultDescription = isBlank
    ? `Brokerage fee/Commission for professional services rendered towards facilitating ____________ of Unit No. __________ Wing __________ Floor __________ in project "________________________________________________" located at Maharashtra, India. (MahaRERA Project Reg No: __________________________)`
    : `Brokerage fee/Commission for professional services rendered towards facilitating ${dealType.toUpperCase()} of Unit No. ${unitNumber || ''} ${wingName ? 'Wing ' + wingName : ''} ${floorNumber ? 'Floor ' + floorNumber : ''} in project "${projectName || ''}" located at Maharashtra, India. ${projectMahaRera ? '(MahaRERA Project Reg No: ' + projectMahaRera + ')' : ''}`;

  return (
    <div 
      className={`invoice-template-container template-${activeTemplate}`} 
      style={{ '--invoice-accent': accentColor }}
    >
      {/* ======================================================== */}
      {/* CLASSIC TEMPLATE */}
      {/* ======================================================== */}
      {activeTemplate === 'classic' && (
        <div className="invoice-classic-wrapper">
          {/* Header Row */}
          <div className="classic-header">
            <div className="classic-brand">
              {agentLogo ? (
                <img src={agentLogo} alt="Agent Logo" className="invoice-logo" />
              ) : (
                <div className="invoice-logo-placeholder">MahaRERA Agent</div>
              )}
              <div>
                <h1 
                  contentEditable={!viewOnly} 
                  suppressContentEditableWarning 
                  onBlur={(e) => handleBlur('agentCompany', e)}
                  className="editable-text-field font-semibold"
                >
                  {agentCompany || 'Real Estate Agency Name'}
                </h1>
                <p 
                  contentEditable={!viewOnly} 
                  suppressContentEditableWarning 
                  onBlur={(e) => handleBlur('agentName', e)}
                  className="editable-text-field sub-info"
                >
                  {agentName || 'Agent/Broker Name'}
                </p>
                {agentMahaRera && (
                  <p className="maharera-badge">
                    MahaRERA Reg No:{' '}
                    <span 
                      contentEditable={!viewOnly} 
                      suppressContentEditableWarning 
                      onBlur={(e) => handleBlur('agentMahaRera', e)}
                      className="editable-text-field font-mono text-accent"
                    >
                      {agentMahaRera}
                    </span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="classic-title-block">
              <h2 className="title-text text-accent">INVOICE</h2>
              <div className="details-table">
                <p><strong>Invoice No:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('invoiceNumber', e)} className="editable-text-field font-mono">{invoiceNumber || 'INV-001'}</span></p>
                {invoiceDate && <p><strong>Date:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('invoiceDate', e)} className="editable-text-field">{formatDateToIndian(invoiceDate)}</span></p>}
                {dueDate && <p><strong>Due Date:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('dueDate', e)} className="editable-text-field">{formatDateToIndian(dueDate)}</span></p>}
              </div>
            </div>
          </div>

          <hr className="divider-line" />

          {/* Addresses Row */}
          <div className="classic-addresses">
            <div className="address-col">
              <h4 className="section-title text-accent">From:</h4>
              <p 
                contentEditable={!viewOnly} 
                suppressContentEditableWarning 
                onBlur={(e) => handleBlur('agentAddress', e)}
                className="editable-text-field whitespace-pre-line"
              >
                {agentAddress || 'Agent Contact Address Details'}
              </p>
              {agentEmail && <p>Email: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentEmail', e)} className="editable-text-field">{agentEmail}</span></p>}
              {agentPhone && <p>Phone: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentPhone', e)} className="editable-text-field">{agentPhone}</span></p>}
              {agentGstin && <p>GSTIN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentGstin', e)} className="editable-text-field font-mono">{agentGstin}</span></p>}
              {agentPan && <p>PAN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentPan', e)} className="editable-text-field font-mono">{agentPan}</span></p>}
            </div>

            <div className="address-col">
              <h4 className="section-title text-accent">
                <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('billToLabel', e)} className="editable-text-field">
                  {billToLabel || 'Bill To'}
                </span>
                :
              </h4>
              <p className="font-semibold"><span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientCompany', e)} className="editable-text-field">{clientCompany || 'Client Company Name'}</span></p>
              <p><span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientName', e)} className="editable-text-field">{clientName || 'Contact Person Name'}</span></p>
              <p 
                contentEditable={!viewOnly} 
                suppressContentEditableWarning 
                onBlur={(e) => handleBlur('clientAddress', e)}
                className="editable-text-field whitespace-pre-line"
              >
                {clientAddress || 'Client Office/Home Address'}
              </p>
              {clientEmail && <p>Email: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientEmail', e)} className="editable-text-field">{clientEmail}</span></p>}
              {clientPhone && <p>Phone: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientPhone', e)} className="editable-text-field">{clientPhone}</span></p>}
              {clientGstin && <p>GSTIN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientGstin', e)} className="editable-text-field font-mono">{clientGstin}</span></p>}
            </div>
          </div>

          {/* Deal & Property Details Summary Bar */}
          <div className="deal-summary-bar">
            <h4 className="text-accent font-semibold">Deal/Property Context</h4>
            <div className="summary-grid">
              <div><strong>Project:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('projectName', e)} className="editable-text-field">{projectName || 'Project Name'}</span></div>
              {projectMahaRera && <div><strong>Project MahaRERA:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('projectMahaRera', e)} className="editable-text-field font-mono">{projectMahaRera}</span></div>}
              <div><strong>Unit:</strong> Wing <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('wingName', e)} className="editable-text-field">{wingName || 'N/A'}</span>, Flat <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('unitNumber', e)} className="editable-text-field">{unitNumber || 'N/A'}</span>, Floor <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('floorNumber', e)} className="editable-text-field">{floorNumber || 'N/A'}</span></div>
              <div><strong>Deal Value:</strong> {formatIndianCurrency(valAgreement)}</div>
            </div>
          </div>

          {/* Transaction Table */}
          <table className="classic-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--invoice-accent)', color: '#ffffff' }}>
                <th style={{ width: '60%' }}>Description of Services</th>
                <th className="text-right" style={{ width: '15%' }}>Rate</th>
                <th className="text-right" style={{ width: '25%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="desc-cell">
                  <div className="default-desc">{defaultDescription}</div>
                </td>
                <td className="text-right border-cell font-mono">
                  {commissionType === 'percentage' ? `${commissionRate}%` : 'Fixed'}
                </td>
                <td className="text-right border-cell font-mono">
                  {formatIndianCurrency(calculatedCommission)}
                </td>
              </tr>
              <tr className="subtotal-row">
                <td colSpan="2" className="text-right font-semibold">Subtotal:</td>
                <td className="text-right font-mono">{formatIndianCurrency(calculatedCommission)}</td>
              </tr>
              {gstEnabled && gstType === 'cgst_sgst' && (
                <>
                  <tr className="tax-row">
                    <td colSpan="2" className="text-right">CGST ({(gstPct / 2).toFixed(1)}%):</td>
                    <td className="text-right font-mono">{formatIndianCurrency(cgstAmt)}</td>
                  </tr>
                  <tr className="tax-row">
                    <td colSpan="2" className="text-right">SGST ({(gstPct / 2).toFixed(1)}%):</td>
                    <td className="text-right font-mono">{formatIndianCurrency(sgstAmt)}</td>
                  </tr>
                </>
              )}
              {gstEnabled && gstType === 'igst' && (
                <tr className="tax-row">
                  <td colSpan="2" className="text-right">IGST ({gstPct}%):</td>
                  <td className="text-right font-mono">{formatIndianCurrency(igstAmt)}</td>
                </tr>
              )}
              <tr className="total-row" style={{ borderTop: '2px solid var(--invoice-accent)', borderBottom: '2px solid var(--invoice-accent)' }}>
                <td colSpan="2" className="text-right font-bold text-accent">Grand Total:</td>
                <td className="text-right font-bold text-accent font-mono">{formatIndianCurrency(totalInvoiceVal)}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount in words */}
          <div className="words-box">
            <span className="font-semibold text-accent">Total Amount in Words:</span>
            <span className="italic block mt-1 font-semibold">{amountInWordsText}</span>
          </div>

          {/* Bank Details & Signature Section */}
          <div className="classic-footer-sections">
            <div className="bank-details-card flex justify-between items-center gap-4">
              <div>
                <h4 className="text-accent font-semibold">
                  <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankDetailsLabel', e)} className="editable-text-field">
                    {bankDetailsLabel || 'Bank Details'}
                  </span>
                </h4>
                <p><strong>Beneficiary:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankBeneficiary', e)} className="editable-text-field">{bankBeneficiary || agentName}</span></p>
                <p><strong>Bank Name:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankName', e)} className="editable-text-field">{bankName || 'HDFC Bank'}</span></p>
                <p><strong>Account No:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankAccount', e)} className="editable-text-field font-mono">{bankAccount || 'XXXXXXXXXX'}</span></p>
                <p><strong>IFSC Code:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankIfsc', e)} className="editable-text-field font-mono">{bankIfsc || 'HDFC0000XXX'}</span></p>
                <p><strong>Branch:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankBranch', e)} className="editable-text-field">{bankBranch || 'Mumbai'}</span></p>
              </div>
              {showUpiQr && bankUpi && (
                <div className="upi-qr-code-block">
                  <img src={qrCodeUrl} alt="UPI QR Code" />
                  <span className="upi-qr-label">Scan to Pay<br/>{bankUpi}</span>
                </div>
              )}
            </div>

            <div className="signature-display-box">
              <p className="sig-title font-semibold text-accent">Authorized Signatory</p>
              <div className="sig-image-container">
                {signatureData ? (
                  <img src={signatureData} alt="Authorized Signature" />
                ) : viewOnly ? (
                  <div className="sig-digitally-signed">✦ Digitally Signed ✦</div>
                ) : (
                  <div className="sig-placeholder">Sign Canvas Here</div>
                )}
              </div>
              <p className="sig-agent-company">{agentCompany || 'Agency Name'}</p>
            </div>
          </div>

          {/* Notes and Declarations */}
          <div className="classic-terms-declarations">
            <div className="terms-col">
              {notes && (
                <div className="terms-block">
                  <h5 className="font-semibold text-accent">
                    <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('notesLabel', e)} className="editable-text-field">
                      {notesLabel || 'Notes'}
                    </span>
                  </h5>
                  <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('notes', e)} className="editable-text-field text-sm italic">{notes}</p>
                </div>
              )}
              {terms && (
                <div className="terms-block mt-2">
                  <h5 className="font-semibold text-accent">
                    <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('termsLabel', e)} className="editable-text-field">
                      {termsLabel || 'Terms & Conditions'}
                    </span>
                  </h5>
                  <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('terms', e)} className="editable-text-field text-sm whitespace-pre-line">{terms}</p>
                </div>
              )}
            </div>
            
            <div className="declaration-col">
              <h5 className="font-semibold text-accent">
                <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('declarationLabel', e)} className="editable-text-field">
                  {declarationLabel || 'Declaration'}
                </span>
              </h5>
              <p className="text-xs text-justify">
                We declare that this invoice shows the actual price of the services described and that all particulars are true and correct. Real estate agency services subject to Maharashtra jurisdiction and legal guidelines.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODERN TEMPLATE */}
      {/* ======================================================== */}
      {activeTemplate === 'modern' && (
        <div className="invoice-modern-wrapper">
          <div className="modern-top-bar" style={{ backgroundColor: 'var(--invoice-accent)' }} />
          
          <div className="modern-header">
            <div className="modern-logo-section">
              {agentLogo ? (
                <img src={agentLogo} alt="Agent Logo" className="invoice-logo" />
              ) : (
                <div className="invoice-logo-placeholder">MahaRERA Agent</div>
              )}
              <div>
                <h1 contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentCompany', e)} className="editable-text-field text-accent font-bold text-2xl">
                  {agentCompany || 'Real Estate Agency Name'}
                </h1>
                <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentName', e)} className="editable-text-field font-medium text-sm">
                  {agentName || 'Agent/Broker Name'}
                </p>
                {agentMahaRera && (
                  <p className="modern-rera-tag">
                    MahaRERA: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentMahaRera', e)} className="editable-text-field font-mono font-semibold">{agentMahaRera}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="modern-title-box">
              <h2 className="title-text text-accent font-bold">INVOICE</h2>
              <div className="title-meta-grid">
                <div><span>INVOICE NO:</span> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('invoiceNumber', e)} className="editable-text-field font-mono">{invoiceNumber || 'INV-001'}</span></div>
                {invoiceDate && <div><span>DATE:</span> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('invoiceDate', e)} className="editable-text-field">{formatDateToIndian(invoiceDate)}</span></div>}
                {dueDate && <div><span>DUE DATE:</span> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('dueDate', e)} className="editable-text-field">{formatDateToIndian(dueDate)}</span></div>}
              </div>
            </div>
          </div>

          <div className="modern-address-block">
            <div className="address-box">
              <span className="box-header" style={{ color: 'var(--invoice-accent)' }}>From Broker:</span>
              <div className="box-content">
                <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentAddress', e)} className="editable-text-field font-semibold whitespace-pre-line">{agentAddress}</p>
                {agentEmail && <p>Email: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentEmail', e)} className="editable-text-field">{agentEmail}</span></p>}
                {agentPhone && <p>Phone: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentPhone', e)} className="editable-text-field">{agentPhone}</span></p>}
                {agentGstin && <p>GSTIN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentGstin', e)} className="editable-text-field font-mono">{agentGstin}</span></p>}
                {agentPan && <p>PAN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentPan', e)} className="editable-text-field font-mono">{agentPan}</span></p>}
              </div>
            </div>

            <div className="address-box">
              <span className="box-header" style={{ color: 'var(--invoice-accent)' }}>
                <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('billToLabel', e)} className="editable-text-field">
                  {billToLabel || 'Bill To'}
                </span>
                :
              </span>
              <div className="box-content">
                <p className="font-bold"><span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientCompany', e)} className="editable-text-field">{clientCompany}</span></p>
                <p><span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientName', e)} className="editable-text-field">{clientName}</span></p>
                <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientAddress', e)} className="editable-text-field whitespace-pre-line">{clientAddress}</p>
                {clientEmail && <p>Email: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientEmail', e)} className="editable-text-field">{clientEmail}</span></p>}
                {clientPhone && <p>Phone: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientPhone', e)} className="editable-text-field">{clientPhone}</span></p>}
                {clientGstin && <p>GSTIN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientGstin', e)} className="editable-text-field font-mono">{clientGstin}</span></p>}
              </div>
            </div>
          </div>

          <div className="modern-deal-ribbon" style={{ borderLeft: '4px solid var(--invoice-accent)' }}>
            <div className="deal-grid">
              <div><strong>Deal Property:</strong> Unit {unitNumber || 'N/A'}, Wing {wingName || 'N/A'}, Floor {floorNumber || 'N/A'}, {projectName || 'Project Name'}</div>
              {projectMahaRera && <div><strong>Project MahaRERA:</strong> <span className="font-mono">{projectMahaRera}</span></div>}
              <div><strong>Sale Value:</strong> {formatIndianCurrency(valAgreement)}</div>
              <div><strong>Service Type:</strong> {dealType.toUpperCase()}</div>
            </div>
          </div>

          {/* Table */}
          <table className="modern-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--invoice-accent)', color: '#ffffff' }}>
                <th>Service Description</th>
                <th className="text-center" style={{ width: '15%' }}>Rate</th>
                <th className="text-right" style={{ width: '25%' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="desc-cell">{defaultDescription}</td>
                <td className="text-center font-semibold font-mono">
                  {commissionType === 'percentage' ? `${commissionRate}%` : 'Fixed'}
                </td>
                <td className="text-right font-semibold font-mono">{formatIndianCurrency(calculatedCommission)}</td>
              </tr>
              <tr className="subtotal-row">
                <td colSpan="2" className="text-right">Subtotal:</td>
                <td className="text-right font-mono">{formatIndianCurrency(calculatedCommission)}</td>
              </tr>
              {gstEnabled && gstType === 'cgst_sgst' && (
                <>
                  <tr className="tax-row">
                    <td colSpan="2" className="text-right">CGST ({(gstPct / 2).toFixed(1)}%):</td>
                    <td className="text-right font-mono">{formatIndianCurrency(cgstAmt)}</td>
                  </tr>
                  <tr className="tax-row">
                    <td colSpan="2" className="text-right">SGST ({(gstPct / 2).toFixed(1)}%):</td>
                    <td className="text-right font-mono">{formatIndianCurrency(sgstAmt)}</td>
                  </tr>
                </>
              )}
              {gstEnabled && gstType === 'igst' && (
                <tr className="tax-row">
                  <td colSpan="2" className="text-right">IGST ({gstPct}%):</td>
                  <td className="text-right font-mono">{formatIndianCurrency(igstAmt)}</td>
                </tr>
              )}
              <tr className="total-row" style={{ color: 'var(--invoice-accent)' }}>
                <td colSpan="2" className="text-right font-bold text-lg">Grand Total:</td>
                <td className="text-right font-bold text-lg font-mono">{formatIndianCurrency(totalInvoiceVal)}</td>
              </tr>
            </tbody>
          </table>

          {/* Words and Bank */}
          <div className="modern-footer-layout">
            <div className="left-panel">
              <div className="words-box">
                <span className="header-span" style={{ color: 'var(--invoice-accent)' }}>Total in Words:</span>
                <span className="italic block mt-1 font-semibold">{amountInWordsText}</span>
              </div>

              <div className="bank-details-card flex justify-between items-center gap-4">
                <div>
                  <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--invoice-accent)' }}>
                    <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankDetailsLabel', e)} className="editable-text-field">
                      {bankDetailsLabel || 'Bank Details'}
                    </span>
                  </h4>
                  <p><strong>Beneficiary:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankBeneficiary', e)} className="editable-text-field">{bankBeneficiary || agentName}</span></p>
                  <p><strong>Bank:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankName', e)} className="editable-text-field">{bankName}</span></p>
                  <p><strong>Account:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankAccount', e)} className="editable-text-field font-mono">{bankAccount}</span></p>
                  <p><strong>IFSC:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankIfsc', e)} className="editable-text-field font-mono">{bankIfsc}</span></p>
                  <p><strong>Branch:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankBranch', e)} className="editable-text-field">{bankBranch}</span></p>
                </div>
                {showUpiQr && bankUpi && (
                  <div className="upi-qr-code-block">
                    <img src={qrCodeUrl} alt="UPI QR Code" />
                    <span className="upi-qr-label">Scan to Pay<br/>{bankUpi}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="right-panel">
              <div className="signature-display-box">
                <p className="sig-title font-semibold text-xs" style={{ color: 'var(--invoice-accent)' }}>Authorized Signature</p>
                <div className="sig-image-container">
                  {signatureData ? (
                    <img src={signatureData} alt="Signature" />
                  ) : viewOnly ? (
                    <div className="sig-digitally-signed">✦ Digitally Signed ✦</div>
                  ) : (
                    <div className="sig-placeholder">Sign Here</div>
                  )}
                </div>
                <p className="sig-agent-company">{agentCompany || 'Agency Name'}</p>
              </div>
            </div>
          </div>

          <div className="modern-disclaimers">
            {notes && <p className="notes-para"><strong>Notes:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('notes', e)} className="editable-text-field">{notes}</span></p>}
            {terms && <p className="terms-para"><strong>Terms:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('terms', e)} className="editable-text-field">{terms}</span></p>}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* LUXURY TEMPLATE */}
      {/* ======================================================== */}
      {activeTemplate === 'luxury' && (
        <div className="invoice-luxury-wrapper">
          <div className="luxury-border-decor" style={{ borderColor: 'var(--invoice-accent)' }} />
          
          <div className="luxury-header text-center">
            <h2 className="luxury-pre-title text-accent uppercase tracking-widest text-xs">P r e m i e r   R e a l   E s t a t e   S e r v i c e s</h2>
            
            {agentLogo && (
              <div className="luxury-logo-holder">
                <img src={agentLogo} alt="Luxury Logo" />
              </div>
            )}

            <h1 contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentCompany', e)} className="editable-text-field luxury-company font-serif text-3xl font-light">
              {agentCompany || 'Real Estate Agency Name'}
            </h1>
            
            <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentName', e)} className="editable-text-field luxury-agent-name uppercase tracking-widest text-xs mt-1">
              {agentName || 'Agent/Broker Name'}
            </p>
            
            {agentMahaRera && (
              <div className="luxury-rera" style={{ color: 'var(--invoice-accent)' }}>
                MAHARERA AGENT REGISTRATION NO: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentMahaRera', e)} className="editable-text-field font-mono">{agentMahaRera}</span>
              </div>
            )}

            <div className="luxury-accent-line" style={{ backgroundColor: 'var(--invoice-accent)' }} />
          </div>

          <div className="luxury-meta-details-row" style={{ gridTemplateColumns: `repeat(${[true, !!invoiceDate, !!dueDate].filter(Boolean).length}, 1fr)` }}>
            <div className="meta-col">
              <span className="meta-label">INVOICE NUMBER</span>
              <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('invoiceNumber', e)} className="meta-value font-mono">{invoiceNumber || 'INV-001'}</span>
            </div>
            {invoiceDate && (
              <div className="meta-col">
                <span className="meta-label">INVOICE DATE</span>
                <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('invoiceDate', e)} className="meta-value">{formatDateToIndian(invoiceDate)}</span>
              </div>
            )}
            {dueDate && (
              <div className="meta-col">
                <span className="meta-label">DUE DATE</span>
                <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('dueDate', e)} className="meta-value">{formatDateToIndian(dueDate)}</span>
              </div>
            )}
          </div>

          <div className="luxury-billing-row">
            <div className="bill-col">
              <h4 className="luxury-section-header font-serif" style={{ color: 'var(--invoice-accent)' }}>The Consultant</h4>
              <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentAddress', e)} className="editable-text-field whitespace-pre-line font-light text-sm">{agentAddress}</p>
              {agentPhone && <p className="text-xs mt-1 font-light">Tel: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentPhone', e)} className="editable-text-field">{agentPhone}</span></p>}
              {agentEmail && <p className="text-xs font-light">Email: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentEmail', e)} className="editable-text-field">{agentEmail}</span></p>}
              {agentGstin && <p className="text-xs font-light">GSTIN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentGstin', e)} className="editable-text-field font-mono">{agentGstin}</span></p>}
              {agentPan && <p className="text-xs font-light">PAN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentPan', e)} className="editable-text-field font-mono">{agentPan}</span></p>}
            </div>

            <div className="bill-col text-right">
              <h4 className="luxury-section-header font-serif" style={{ color: 'var(--invoice-accent)' }}>
                <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('billToLabel', e)} className="editable-text-field">
                  {billToLabel || 'Prepared Exclusively For'}
                </span>
              </h4>
              <p className="font-serif text-base"><span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientCompany', e)} className="editable-text-field">{clientCompany}</span></p>
              <p className="font-light text-sm"><span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientName', e)} className="editable-text-field">{clientName}</span></p>
              <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientAddress', e)} className="editable-text-field whitespace-pre-line font-light text-sm text-right">{clientAddress}</p>
              {clientPhone && <p className="text-xs mt-1 font-light">Tel: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientPhone', e)} className="editable-text-field">{clientPhone}</span></p>}
              {clientEmail && <p className="text-xs font-light">Email: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientEmail', e)} className="editable-text-field">{clientEmail}</span></p>}
              {clientGstin && <p className="text-xs font-light text-right">GSTIN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientGstin', e)} className="editable-text-field font-mono">{clientGstin}</span></p>}
            </div>
          </div>

          <div className="luxury-property-banner" style={{ borderColor: 'var(--invoice-accent)' }}>
            <h5 className="font-serif text-sm uppercase tracking-widest text-center" style={{ color: 'var(--invoice-accent)' }}>Property Transaction Profile</h5>
            <div className="banner-grid font-light text-sm mt-2">
              <div><strong>Project Portfolio:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('projectName', e)} className="editable-text-field">{projectName}</span></div>
              {projectMahaRera && <div><strong>MahaRERA Registry:</strong> <span className="font-mono">{projectMahaRera}</span></div>}
              <div><strong>Residence Profile:</strong> Unit {unitNumber}, Wing {wingName}, Floor {floorNumber}</div>
              <div><strong>Consideration Value:</strong> {formatIndianCurrency(valAgreement)}</div>
            </div>
          </div>

          {/* Table */}
          <table className="luxury-table font-serif">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--invoice-accent)', color: 'var(--invoice-accent)' }}>
                <th className="text-left font-normal py-2">Consultation Statement</th>
                <th className="text-center font-normal py-2" style={{ width: '15%' }}>Rate</th>
                <th className="text-right font-normal py-2" style={{ width: '25%' }}>Amount</th>
              </tr>
            </thead>
            <tbody className="font-sans font-light">
              <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                <td className="desc-cell text-sm py-4">{defaultDescription}</td>
                <td className="text-center py-4 font-mono font-normal">
                  {commissionType === 'percentage' ? `${commissionRate}%` : 'Fixed'}
                </td>
                <td className="text-right py-4 font-mono font-normal">{formatIndianCurrency(calculatedCommission)}</td>
              </tr>
              <tr className="subtotal-row">
                <td colSpan="2" className="text-right py-2 text-xs">Subtotal Base Commission:</td>
                <td className="text-right py-2 font-mono text-sm">{formatIndianCurrency(calculatedCommission)}</td>
              </tr>
              {gstEnabled && gstType === 'cgst_sgst' && (
                <>
                  <tr className="tax-row">
                    <td colSpan="2" className="text-right py-1 text-xs">CGST ({(gstPct / 2).toFixed(1)}%):</td>
                    <td className="text-right py-1 font-mono text-sm">{formatIndianCurrency(cgstAmt)}</td>
                  </tr>
                  <tr className="tax-row">
                    <td colSpan="2" className="text-right py-1 text-xs">SGST ({(gstPct / 2).toFixed(1)}%):</td>
                    <td className="text-right py-1 font-mono text-sm">{formatIndianCurrency(sgstAmt)}</td>
                  </tr>
                </>
              )}
              {gstEnabled && gstType === 'igst' && (
                <tr className="tax-row">
                  <td colSpan="2" className="text-right py-1 text-xs">IGST ({gstPct}%):</td>
                  <td className="text-right py-1 font-mono text-sm">{formatIndianCurrency(igstAmt)}</td>
                </tr>
              )}
              <tr className="total-row" style={{ borderTop: '1px double var(--invoice-accent)', borderBottom: '1px double var(--invoice-accent)' }}>
                <td colSpan="2" className="text-right py-3 font-serif font-bold text-accent text-lg">Acquisition Fee Total:</td>
                <td className="text-right py-3 font-serif font-bold text-accent text-lg font-mono">{formatIndianCurrency(totalInvoiceVal)}</td>
              </tr>
            </tbody>
          </table>

          {/* Footer layout */}
          <div className="luxury-footer">
            <div className="words-box font-serif">
              <span className="label text-accent italic">The Sum of:</span>
              <span className="val italic block font-semibold">{amountInWordsText}</span>
            </div>

            <div className="luxury-settlement-block">
              <div className="bank-card flex justify-between items-center gap-4">
                <div>
                  <h4 className="font-serif text-accent uppercase tracking-wider text-xs mb-2">Settlement Details</h4>
                  <p><strong>Beneficiary:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankBeneficiary', e)} className="editable-text-field">{bankBeneficiary || agentName}</span></p>
                  <p><strong>Bank:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankName', e)} className="editable-text-field">{bankName}</span></p>
                  <p><strong>Account:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankAccount', e)} className="editable-text-field font-mono">{bankAccount}</span></p>
                  <p><strong>IFSC Code:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankIfsc', e)} className="editable-text-field font-mono">{bankIfsc}</span></p>
                  <p><strong>Branch:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankBranch', e)} className="editable-text-field">{bankBranch}</span></p>
                </div>
                {showUpiQr && bankUpi && (
                  <div className="upi-qr-code-block">
                    <img src={qrCodeUrl} alt="UPI QR Code" />
                    <span className="upi-qr-label">Scan to Pay<br/>{bankUpi}</span>
                  </div>
                )}
              </div>

              <div className="signature-area text-center">
                <p className="sig-header font-serif uppercase tracking-widest text-xs" style={{ color: 'var(--invoice-accent)' }}>A u t h o r i z e d   E n d o r s e m e n t</p>
                <div className="sig-box">
                  {signatureData ? (
                    <img src={signatureData} alt="Signature Badge" />
                  ) : viewOnly ? (
                    <div className="sig-digitally-signed">✦ Digitally Signed ✦</div>
                  ) : (
                    <div className="sig-placeholder">Signature</div>
                  )}
                </div>
                <p className="sig-company uppercase text-[10px] tracking-wider font-semibold">{agentCompany}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BOLD TEMPLATE */}
      {/* ======================================================== */}
      {activeTemplate === 'bold' && (
        <div className="invoice-bold-wrapper">
          <div className="bold-header" style={{ backgroundColor: 'var(--invoice-accent)' }}>
            <div className="header-left">
              {agentLogo ? (
                <div className="bold-logo-container">
                  <img src={agentLogo} alt="Logo" />
                </div>
              ) : (
                <div className="bold-logo-placeholder">MahaRERA Agent</div>
              )}
              <div className="header-info">
                <h1 contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentCompany', e)} className="editable-text-field font-bold text-2xl">
                  {agentCompany || 'Real Estate Agency Name'}
                </h1>
                <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentName', e)} className="editable-text-field text-sm font-medium">
                  {agentName || 'Agent/Broker Name'}
                </p>
                {agentMahaRera && (
                  <p className="bold-rera-tag">
                    MahaRERA Reg No: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentMahaRera', e)} className="editable-text-field font-mono font-bold">{agentMahaRera}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="header-right">
              <h2 className="bold-title-text font-black text-3xl">INVOICE</h2>
              <div className="bold-meta-table text-right text-sm">
                <p><strong>INVOICE NO:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('invoiceNumber', e)} className="editable-text-field font-mono">{invoiceNumber || 'INV-001'}</span></p>
                {invoiceDate && <p><strong>DATE:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('invoiceDate', e)} className="editable-text-field">{formatDateToIndian(invoiceDate)}</span></p>}
                {dueDate && <p><strong>DUE DATE:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('dueDate', e)} className="editable-text-field">{formatDateToIndian(dueDate)}</span></p>}
              </div>
            </div>
          </div>

          <div className="bold-details-grid">
            <div className="details-col">
              <h4 className="bold-sec-header" style={{ color: 'var(--invoice-accent)', borderBottom: '2px solid var(--invoice-accent)' }}>Broker Information</h4>
              <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentAddress', e)} className="editable-text-field whitespace-pre-line text-sm mt-1">{agentAddress}</p>
              {agentPhone && <p className="text-sm">Phone: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentPhone', e)} className="editable-text-field">{agentPhone}</span></p>}
              {agentEmail && <p className="text-sm">Email: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentEmail', e)} className="editable-text-field">{agentEmail}</span></p>}
              {agentGstin && <p className="text-sm">GSTIN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentGstin', e)} className="editable-text-field font-mono">{agentGstin}</span></p>}
              {agentPan && <p className="text-sm">PAN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('agentPan', e)} className="editable-text-field font-mono">{agentPan}</span></p>}
            </div>

            <div className="details-col">
              <h4 className="bold-sec-header" style={{ color: 'var(--invoice-accent)', borderBottom: '2px solid var(--invoice-accent)' }}>
                <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('billToLabel', e)} className="editable-text-field">
                  {billToLabel || 'Bill To'}
                </span>
              </h4>
              <p className="font-bold text-base mt-1"><span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientCompany', e)} className="editable-text-field">{clientCompany}</span></p>
              <p className="text-sm"><span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientName', e)} className="editable-text-field">{clientName}</span></p>
              <p contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientAddress', e)} className="editable-text-field whitespace-pre-line text-sm">{clientAddress}</p>
              {clientPhone && <p className="text-sm">Phone: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientPhone', e)} className="editable-text-field">{clientPhone}</span></p>}
              {clientEmail && <p className="text-sm">Email: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientEmail', e)} className="editable-text-field">{clientEmail}</span></p>}
              {clientGstin && <p className="text-sm">GSTIN: <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('clientGstin', e)} className="editable-text-field font-mono">{clientGstin}</span></p>}
            </div>
          </div>

          <div className="bold-property-box">
            <h5 className="box-title font-bold text-sm text-white" style={{ backgroundColor: 'var(--invoice-accent)' }}>Transaction Info</h5>
            <div className="box-grid text-sm p-3">
              <div><strong>Project:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('projectName', e)} className="editable-text-field">{projectName}</span></div>
              {projectMahaRera && <div><strong>MahaRERA:</strong> <span className="font-mono">{projectMahaRera}</span></div>}
              <div><strong>Unit Location:</strong> Unit {unitNumber}, Wing {wingName}, Floor {floorNumber}</div>
              <div><strong>Deal Value:</strong> {formatIndianCurrency(valAgreement)}</div>
            </div>
          </div>

          {/* Table */}
          <table className="bold-table">
            <thead>
              <tr style={{ backgroundColor: 'var(--invoice-accent)', color: '#ffffff' }}>
                <th className="text-left">Consultancy & Brokerage services</th>
                <th className="text-center" style={{ width: '15%' }}>Rate</th>
                <th className="text-right" style={{ width: '25%' }}>Commission Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="desc-cell">{defaultDescription}</td>
                <td className="text-center font-bold font-mono">
                  {commissionType === 'percentage' ? `${commissionRate}%` : 'Fixed'}
                </td>
                <td className="text-right font-bold font-mono">{formatIndianCurrency(calculatedCommission)}</td>
              </tr>
              <tr className="subtotal-row">
                <td colSpan="2" className="text-right">Subtotal:</td>
                <td className="text-right font-mono">{formatIndianCurrency(calculatedCommission)}</td>
              </tr>
              {gstEnabled && gstType === 'cgst_sgst' && (
                <>
                  <tr className="tax-row">
                    <td colSpan="2" className="text-right">CGST ({(gstPct / 2).toFixed(1)}%):</td>
                    <td className="text-right font-mono">{formatIndianCurrency(cgstAmt)}</td>
                  </tr>
                  <tr className="tax-row">
                    <td colSpan="2" className="text-right">SGST ({(gstPct / 2).toFixed(1)}%):</td>
                    <td className="text-right font-mono">{formatIndianCurrency(sgstAmt)}</td>
                  </tr>
                </>
              )}
              {gstEnabled && gstType === 'igst' && (
                <tr className="tax-row">
                  <td colSpan="2" className="text-right">IGST ({gstPct}%):</td>
                  <td className="text-right font-mono">{formatIndianCurrency(igstAmt)}</td>
                </tr>
              )}
              <tr className="total-row" style={{ backgroundColor: '#f1f5f9', borderTop: '3px solid var(--invoice-accent)' }}>
                <td colSpan="2" className="text-right font-bold text-lg" style={{ color: 'var(--invoice-accent)' }}>TOTAL PAYABLE:</td>
                <td className="text-right font-bold text-lg font-mono" style={{ color: 'var(--invoice-accent)' }}>{formatIndianCurrency(totalInvoiceVal)}</td>
              </tr>
            </tbody>
          </table>

          {/* Amount in words */}
          <div className="words-box">
            <span className="font-bold uppercase text-xs" style={{ color: 'var(--invoice-accent)' }}>Amount in Words:</span>
            <span className="italic block mt-1 font-semibold">{amountInWordsText}</span>
          </div>

          <div className="bold-footer-split">
            <div className="bank-details-card flex justify-between items-center gap-4">
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: 'var(--invoice-accent)' }}>
                  <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankDetailsLabel', e)} className="editable-text-field">
                    {bankDetailsLabel || 'Bank details'}
                  </span>
                </h4>
                <p><strong>Beneficiary:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankBeneficiary', e)} className="editable-text-field">{bankBeneficiary || agentName}</span></p>
                <p><strong>Bank:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankName', e)} className="editable-text-field">{bankName}</span></p>
                <p><strong>Account:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankAccount', e)} className="editable-text-field font-mono">{bankAccount}</span></p>
                <p><strong>IFSC:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankIfsc', e)} className="editable-text-field font-mono">{bankIfsc}</span></p>
                <p><strong>Branch:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('bankBranch', e)} className="editable-text-field">{bankBranch}</span></p>
              </div>
              {showUpiQr && bankUpi && (
                <div className="upi-qr-code-block">
                  <img src={qrCodeUrl} alt="UPI QR Code" />
                  <span className="upi-qr-label">Scan to Pay<br/>{bankUpi}</span>
                </div>
              )}
            </div>

            <div className="signature-area">
              <p className="sig-title font-bold text-xs uppercase text-right" style={{ color: 'var(--invoice-accent)' }}>Authorized Signatory</p>
              <div className="sig-container flex justify-end">
                {signatureData ? (
                  <img src={signatureData} alt="Authorized Signature" />
                ) : viewOnly ? (
                  <div className="sig-digitally-signed">✦ Digitally Signed ✦</div>
                ) : (
                  <div className="sig-placeholder">Signature Stamp</div>
                )}
              </div>
              <p className="sig-company text-right text-xs mt-1 font-semibold">{agentCompany}</p>
            </div>
          </div>

          <div className="bold-disclaimers">
            {notes && <p className="text-xs"><strong>Note:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('notes', e)} className="editable-text-field">{notes}</span></p>}
            {terms && <p className="text-xs"><strong>Terms:</strong> <span contentEditable={!viewOnly} suppressContentEditableWarning onBlur={(e) => handleBlur('terms', e)} className="editable-text-field">{terms}</span></p>}
          </div>
        </div>
      )}
    </div>
  );
}
