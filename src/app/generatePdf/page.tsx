'use client';
import React, { useState } from 'react';
import { Upload, FileText, Download, Eye, X, CheckSquare, Square } from 'lucide-react';

const XLSXToPDFConverter = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState('');
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [progress, setProgress] = useState(0); // Added for progress tracking

    const handleFileUpload = async (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        if (!uploadedFile.name.toLowerCase().endsWith('.xlsx') && !uploadedFile.name.toLowerCase().endsWith('.csv')) {
            setError('Please upload a valid XLSX or CSV file');
            return;
        }

        setFile(uploadedFile);
        setLoading(true);
        setError('');
        setSelectedRows(new Set());
        setSelectAll(false);
        setProgress(0);

        try {
            const isCSV = uploadedFile.name.toLowerCase().endsWith('.csv');

            if (isCSV) {
                const text = await uploadedFile.text();
                const lines = text.split('\n').filter(line => line.trim());

                if (lines.length === 0) {
                    setError('The file appears to be empty');
                    return;
                }

                const parseCSVLine = (line) => {
                    const result = [];
                    let current = '';
                    let inQuotes = false;

                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                            result.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    result.push(current.trim());
                    return result;
                };

                const parsedLines = lines.map(parseCSVLine);
                const fileHeaders = parsedLines[0] || [];
                const fileData = parsedLines.slice(1).map((row, index) => {
                    const rowObject = { _rowIndex: index };
                    fileHeaders.forEach((header, colIndex) => {
                        rowObject[header || `Column_${colIndex + 1}`] = row[colIndex] || '';
                    });
                    return rowObject;
                }).filter(row => {
                    const values = Object.values(row).filter(val => val !== '' && val !== null && val !== undefined);
                    return values.length > 1;
                });

                setHeaders(fileHeaders.map(h => h || 'Unnamed Column'));
                setData(fileData);
                setShowPreview(true);

            } else {
                const arrayBuffer = await uploadedFile.arrayBuffer();

                try {
                    const XLSX = await import('xlsx');
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    if (jsonData.length === 0) {
                        setError('The file appears to be empty');
                        return;
                    }

                    const fileHeaders = jsonData[0] || [];
                    const fileData = jsonData.slice(1).map((row, index) => {
                        const rowObject = { _rowIndex: index };
                        fileHeaders.forEach((header, colIndex) => {
                            rowObject[header || `Column_${colIndex + 1}`] = row[colIndex] || '';
                        });
                        return rowObject;
                    }).filter(row => {
                        const values = Object.values(row).filter(val => val !== '' && val !== null && val !== undefined);
                        return values.length > 1;
                    });

                    setHeaders(fileHeaders.map(h => h || 'Unnamed Column'));
                    setData(fileData);
                    setShowPreview(true);

                } catch (xlsxError) {
                    setError(
                        'XLSX library not found. Please install it by running: npm install xlsx\n\n' +
                        'Or upload a CSV file instead of XLSX for basic functionality.'
                    );
                    console.error('XLSX import error:', xlsxError);
                }
            }

        } catch (err) {
            setError('Error reading file: ' + err.message);
            console.error('Error details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRowSelect = (rowIndex) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(rowIndex)) {
            newSelected.delete(rowIndex);
        } else {
            newSelected.add(rowIndex);
        }
        setSelectedRows(newSelected);
        setSelectAll(newSelected.size === data.length);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedRows(new Set());
            setSelectAll(false);
        } else {
            setSelectedRows(new Set(data.map((_, index) => index)));
            setSelectAll(true);
        }
    };

    const getSelectedData = () => {
        if (selectedRows.size === 0) return data;
        return data.filter((_, index) => selectedRows.has(index));
    };

    const loadHtml2Pdf = async () => {
        if (typeof window !== 'undefined' && !window.html2pdf) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
            script.async = true;

            return new Promise((resolve, reject) => {
                script.onload = () => resolve(window.html2pdf);
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        return window.html2pdf;
    };

    const generatePDF = async () => {
        const selectedData = getSelectedData();

        if (selectedData.length === 0) {
            setError('Please select at least one row to generate medical report');
            return;
        }

        setGenerating(true);
        setError('');
        setProgress(0);

        try {
            const html2pdf = await loadHtml2Pdf();

            const currentDate = new Date();
            const reportDate = currentDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            const reportTime = currentDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
            });

            const options = {
                margin: [5, 5, 5, 5],
                image: {
                    type: 'jpeg',
                    quality: 1.0,
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    dpi: 300,
                    letterRendering: true,
                    width: 794,
                    height: 1123,
                    windowWidth: 794,
                    windowHeight: 1123,
                    x: 0,
                    y: 0,
                    scrollX: 0,
                    scrollY: 0,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: false,
                    precision: 16,
                },
                pagebreak: {
                    mode: ['avoid-all'],
                    before: '.page-break',
                },
            };

            await Promise.all(
                selectedData.map(async (row, index) => {
                    const nameField = headers.find((header) =>
                        header.toLowerCase().includes('name') ||
                        header.toLowerCase().includes('patient') ||
                        header.toLowerCase().includes('title')
                    );
                    const patientName = nameField && row[nameField]
                        ? String(row[nameField]).substring(0, 50).replace(/[^a-zA-Z0-9]/g, '_')
                        : `Patient_${index + 1}`;
                    const displayName = nameField && row[nameField]
                        ? String(row[nameField]).substring(0, 40)
                        : `Patient Record ${index + 1}`;

                    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      width: 100%;
      height: 100%;
    }
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      background: white;
      color: black;
      font-size: 12px;
      line-height: 1.4;
      padding: 15mm;
      max-width: 210mm;
      margin: 0 auto;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
      font-variant-ligatures: none;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    .container {
      width: 100%;
      max-width: 180mm;
      margin: 0 auto;
      background: white;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #000;
      padding-bottom: 15px;
      margin-bottom: 20px;
      width: 100%;
    }
    .clinic-name {
      font-size: 22px;
      font-weight: bold;
      color: #000;
      margin-bottom: 8px;
      letter-spacing: 1px;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      font-variant-ligatures: none;
    }
    .clinic-info {
      font-size: 11px;
      color: #333;
      margin-bottom: 10px;
      line-height: 1.3;
      text-rendering: optimizeLegibility;
    }
    .report-title {
      font-size: 18px;
      font-weight: bold;
      color: #000;
      text-transform: uppercase;
      margin-top: 10px;
      letter-spacing: 0.5px;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      font-variant-ligatures: none;
    }
    .meta-section {
      background: #f8f8f8;
      border: 2px solid #333;
      padding: 12px;
      margin-bottom: 20px;
      width: 100%;
    }
    .meta-grid {
      display: table;
      width: 100%;
      border-collapse: collapse;
    }
    .meta-row {
      display: table-row;
    }
    .meta-cell {
      display: table-cell;
      padding: 5px 8px;
      font-size: 11px;
      border-right: 1px solid #ccc;
      text-rendering: optimizeLegibility;
    }
    .meta-cell:last-child {
      border-right: none;
    }
    .meta-cell.full-width {
      width: 100%;
      border-right: none;
    }
    .meta-label {
      font-weight: bold;
      font-size: 16px;
      color: #000;
      display: block;
      margin-bottom: 2px;
      text-rendering: optimizeLegibility;
    }
    .meta-value {
      color: #333;
      font-size: 10px;
      text-rendering: optimizeLegibility;
    }
    .content-section {
      width: 100%;
      margin-bottom: 20px;
    }
    .data-record {
      border: 2px solid #000;
      margin-bottom: 20px;
      background: white;
      page-break-inside: avoid;
      width: 100%;
    }
    .record-header {
      background: #000;
      color: white;
      padding: 10px;
      font-weight: bold;
      font-size: 14px;
      text-transform: uppercase;
      text-align: center;
      letter-spacing: 0.5px;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      font-variant-ligatures: none;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      text-rendering: optimizeLegibility;
    }
    .data-table tr {
      border-bottom: 1px solid #ddd;
    }
    .data-table tr:last-child {
      border-bottom: none;
    }
    .data-table td {
      padding: 8px 10px;
      vertical-align: top;
      text-rendering: optimizeLegibility;
    }
    .field-name {
      background: white;
      color: #0331b5;
      font-weight: semibold;
      width: 35%;
      text-transform: uppercase;
      font-size: 10px;
      text-align: left;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
      font-variant-ligatures: none;
    }
    .field-value {
      background: white;
      color: #000;
      width: 65%;
      font-size: 11px;
      word-wrap: break-word;
      border-left: 1px solid #ddd;
      text-rendering: optimizeLegibility;
      -webkit-font-smoothing: antialiased;
    }
    .footer {
      margin-top: 25px;
      padding-top: 15px;
      border-top: 2px solid #000;
      text-align: center;
      font-size: 10px;
      color: #333;
      width: 100%;
      text-rendering: optimizeLegibility;
    }
    .footer-content {
      margin-bottom: 10px;
      text-rendering: optimizeLegibility;
    }
    .confidential {
      background: #f0f0f0;
      border: 1px solid #ccc;
      padding: 8px;
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 11px;
      text-rendering: optimizeLegibility;
    }
    @media print {
      body {
        padding: 10mm;
        font-size: 11px;
      }
      .container {
        max-width: 190mm;
      }
      .clinic-name {
        font-size: 20px;
      }
      .report-title {
        font-size: 16px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="clinic-name">HealthFiles Medico PVT LTD</div>
      <div class="clinic-info">
        5-A, Ravi Pushp Apartment, Ahmedabad - 380052<br>
        Phone: +91 9978043453 | Email: contact@hfiles.in<br>
      </div>
    </div>

    <div class="meta-section">
      <div class="meta-grid">
        <div class="meta-row">
          <div class="meta-cell full-width">
            <span class="meta-label">Name: <span class="meta-value" style="font-weight: normal; font-size: 14px;">${patientName}</span></span>
          </div>
        </div>
        <div class="meta-row">
          <div class="meta-cell full-width" style="text-align: left; padding-top: 8px;">
            <span class="meta-label" style="font-weight: normal; font-size: 11px;">
              Report Date: ${reportDate} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Report Time: ${reportTime} &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; Your HF-ID: HF47HGDH875NF
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <div class="data-record">
        <div class="record-header">${file.name.split(' ')[0]}</div>
        <table class="data-table">
          <tbody>
            ${headers
                            .map((header) => {
                                const value = row[header] || 'Not Available';
                                const displayValue =
                                    String(value).length > 80
                                        ? String(value).substring(0, 80) + '...'
                                        : String(value);
                                return `
                  <tr>
                    <td class="field-name">${header}</td>
                    <td class="field-value">${displayValue}</td>
                  </tr>
                `;
                            })
                            .join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <div class="confidential">
        ⚠️ CONFIDENTIAL MEDICAL REPORT ⚠️<br>
        Distribution is restricted to authorized healthcare personnel only.
      </div>
      <div class="footer-content">
        <strong>HealthFiles Medico PVT LTD</strong><br>
        Report Version 2.1 | Generated on ${reportDate} at ${reportTime}<br>
        © 2025 HealthFiles Medico. All Rights Reserved.
      </div>
    </div>
  </div>
</body>
</html>`;

                    options.filename = `medical_report_${patientName}_${new Date()
                        .toISOString()
                        .split('T')[0]}_${index + 1}.pdf`;

                    await html2pdf().set(options).from(htmlContent).save();
                    setProgress(((index + 1) / selectedData.length) * 100); // Update progress
                })
            );

        } catch (error) {
            console.error('Error generating PDFs:', error);
            setError(`Error generating PDFs: ${error.message}. Please try again.`);
        } finally {
            setGenerating(false);
            setProgress(0);
        }
    };

    const clearData = () => {
        setFile(null);
        setData([]);
        setHeaders([]);
        setShowPreview(false);
        setError('');
        setSelectedRows(new Set());
        setSelectAll(false);
        setProgress(0);
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-white">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Medical Report Generator</h1>
                <p className="text-gray-600">Upload your Excel (XLSX) or CSV file and convert selected data to professional medical PDF reports</p>
            </div>

            <div className="mb-8">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                    <Upload className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <div className="mb-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="text-lg font-medium text-blue-600 hover:text-blue-500">
                                Click to upload XLSX or CSV file
                            </span>
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                accept=".xlsx,.csv"
                                className="sr-only"
                                onChange={handleFileUpload}
                                disabled={loading}
                            />
                        </label>
                        <p className="text-gray-500 mt-2">or drag and drop</p>
                    </div>
                    <p className="text-sm text-gray-400">XLSX or CSV files</p>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 whitespace-pre-line">{error}</p>
                    </div>
                )}

                {loading && (
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-500 bg-blue-100">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing file...
                        </div>
                    </div>
                )}

                {generating && (
                    <div className="mt-4 text-center">
                        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-green-500 bg-green-100">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating PDFs... ({Math.round(progress)}% complete)
                        </div>
                    </div>
                )}
            </div>

            {file && !loading && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center">
                            <FileText className="h-5 w-5 text-green-500 mr-2" />
                            <span className="font-medium text-gray-700">{file.name}</span>
                            <span className="ml-2 text-sm text-gray-500">
                                ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                        </div>
                        <div className="flex space-x-2 flex-wrap">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                {showPreview ? 'Hide Preview' : 'Show Preview'}
                            </button>
                            <button
                                onClick={generatePDF}
                                disabled={data.length === 0 || generating}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                <Download className="h-4 w-4 mr-1" />
                                {generating ? 'Generating PDFs...' : `Generate PDF Reports (${selectedRows.size === 0 ? data.length : selectedRows.size} rows)`}
                            </button>
                            <button
                                onClick={clearData}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPreview && data.length > 0 && (
                <div className="mb-8">
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Data Preview ({data.length} records)
                                </h3>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">
                                        {selectedRows.size} of {data.length} selected
                                    </span>
                                    <button
                                        onClick={handleSelectAll}
                                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        {selectAll ? (
                                            <CheckSquare className="h-4 w-4 mr-1" />
                                        ) : (
                                            <Square className="h-4 w-4 mr-1" />
                                        )}
                                        {selectAll ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{data.length}</div>
                                    <div className="text-sm text-blue-800">Total Records</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{headers.length}</div>
                                    <div className="text-sm text-green-800">Columns</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-purple-600">
                                        {((file?.size || 0) / 1024).toFixed(1)} KB
                                    </div>
                                    <div className="text-sm text-purple-800">File Size</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <div className="text-2xl font-bold text-orange-600">{selectedRows.size}</div>
                                    <div className="text-sm text-orange-800">Selected for Report</div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Select
                                            </th>
                                            {headers.map((header, index) => (
                                                <th
                                                    key={index}
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {data.slice(0, 90).map((row, rowIndex) => (
                                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-3 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleRowSelect(rowIndex)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        {selectedRows.has(rowIndex) ? (
                                                            <CheckSquare className="h-4 w-4" />
                                                        ) : (
                                                            <Square className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </td>
                                                {headers.map((header, cellIndex) => (
                                                    <td
                                                        key={cellIndex}
                                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate"
                                                        title={String(row[header] || '')}
                                                    >
                                                        {String(row[header] || '')}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {data.length > 20 && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <p className="text-sm text-gray-600">
                                            Showing first 20 records of {data.length} total records.
                                            Use "Select All" to include all data in PDF report generation.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default XLSXToPDFConverter;