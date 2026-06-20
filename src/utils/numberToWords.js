export function numberToWords(num) {
  if (num === 0) return 'Zero Rupees Only';
  if (isNaN(num) || num < 0) return '';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertHelper(n) {
    if (n < 20) return units[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
    if (n < 1000) return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertHelper(n % 100) : '');
    return '';
  }

  let str = '';
  let temp = Math.floor(num);

  const crore = Math.floor(temp / 10000000);
  temp %= 10000000;

  const lakh = Math.floor(temp / 100000);
  temp %= 100000;

  const thousand = Math.floor(temp / 1000);
  temp %= 1000;

  const hundredAndBelow = temp;

  if (crore > 0) {
    str += convertHelper(crore) + ' Crore ';
  }
  if (lakh > 0) {
    str += convertHelper(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    str += convertHelper(thousand) + ' Thousand ';
  }
  if (hundredAndBelow > 0) {
    str += convertHelper(hundredAndBelow);
  }

  str = str.trim();
  
  const decimalPart = Math.round((num - Math.floor(num)) * 100);
  let paiseStr = '';
  if (decimalPart > 0) {
    paiseStr = ' and ' + convertHelper(decimalPart) + ' Paise';
  }

  return (str ? str + ' Rupees' : '') + paiseStr + ' Only';
}

export function formatIndianCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  
  const numericAmount = parseFloat(amount);
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(numericAmount);
}

export function formatDateToIndian(dateStr) {
  if (!dateStr) return '';
  // Check if it's already in DD-MM-YYYY or DD/MM/YYYY format
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(dateStr)) return dateStr;
  
  // Parse YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
