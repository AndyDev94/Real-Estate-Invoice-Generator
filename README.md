# 📑 Real Estate Agent Invoice Generator Pro

> **Built with ❤️ by Aneesh Gupta to simplify invoicing for independent real estate professionals.**

An advanced, fully client-side React 19 web application built on Vite. It allows real estate agents and brokers to instantly generate print-ready, professional, and MahaRERA-compliant commission and brokerage invoices in less than a minute.

---

## 💡 Why This Was Built (The Story)

This project was born out of a genuine need to solve a real-life family challenge. 

My parents (mom and dad) work in the highly demanding and fast-paced **real estate** industry as registered agents in Maharashtra, India. For years, I watched them struggle with the tedious and error-prone process of manually typing and formatting complex MahaRERA-compliant commission invoices in Microsoft Word. It was time-consuming, frustrating, and took away precious hours from their core business operations.

I wished they had a simple, free, and efficient online tool to generate professional invoices instantly. Since I couldn't find one that fit their exact needs, I built this generator. Now, they can customize details, manage templates, draw digital signatures, and download print-ready A4 PDFs in just under a minute.

---

## ✨ Features

- **⚡ Real-time Inline Editing**: Modify any text block, bank detail, or amount directly on the invoice preview with live auto-calculations.
- **🎨 Custom Styling & Layouts**:
  - **4 Designer Templates**: Classic Professional, Modern Teal, Luxury Serif, and Bold Accent.
  - Custom brand accent color picker and multiple typography presets.
- **🔏 Built-in Digital Signature Pad**: Draw your signature directly in-app or upload a signature image to stamp your invoices.
- **🇮🇳 MahaRERA Compliant**: Auto-injects required registration blocks for MahaRERA agents and project numbers.
- **💰 Smart Tax & Calculations**: Supports SGST/CGST, IGST, customizable tax rates, agreement values, and automated commission percentage calculations.
- **💾 Local Auto-Save & Drafts**: Saves all agent profiles and draft work to browser local storage so you never lose your progress.
- **🔗 Live Synchronization & Sharing**: Generate lightweight, base64-encoded shareable links to send preview drafts directly to clients or other browsers.
- **📥 Premium PDF Rendering**: Outputs clean, high-resolution A4 PDFs sized exactly to content scale.
- **📱 Fully Mobile Responsive**: Engineered to work beautifully on smartphones and tablets, featuring a custom workspace layout switcher for on-the-go invoice generation.

---

## 🛠️ Tech Stack

- **Core**: React 19, JavaScript (ES6+), HTML5, Vanilla CSS
- **Build Tool**: Vite
- **Libraries**:
  - `jspdf` (High-fidelity PDF generation)
  - `html2canvas` (Precise A4 layout capturing)
  - `lucide-react` (Modern interface icons)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (v18.0.0 or higher is recommended).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AndyDev94/Real-Estate-Invoice-Generator.git
   cd Real-Estate-Invoice-Generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173/`.

4. **Build for production:**
   ```bash
   npm run build
   ```
   This compiles the project into the `dist/` directory, ready to be deployed to GitHub Pages, Netlify, Vercel, or any static hosting platform.

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
