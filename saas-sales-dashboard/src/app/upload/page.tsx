'use client';

import React, { useState, useRef } from 'react';
import Navigation from '@/components/Navigation';
import Papa from 'papaparse';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, FileSpreadsheet, ArrowRight, Check, AlertCircle, 
  MapPin, Loader2, Sparkles, AlertTriangle 
} from 'lucide-react';

const REQUIRED_FIELDS = [
  { key: 'date', label: 'Date (YYYY-MM-DD or MM/DD/YYYY)', type: 'date', required: false },
  { key: 'product', label: 'Product Name', type: 'string', required: false },
  { key: 'category', label: 'Product Category', type: 'string', required: false },
  { key: 'quantity', label: 'Quantity Sold', type: 'integer', required: false },
  { key: 'revenue', label: 'Revenue/Sales Amount', type: 'number', required: false },
  { key: 'cost', label: 'Cost of Sales', type: 'number', required: false },
  { key: 'discount', label: 'Discount / Promotion Amount', type: 'number', required: false },
  { key: 'customer', label: 'Customer Name/ID', type: 'string', required: false },
  { key: 'customerDetails', label: 'Customer Details (Email/Phone)', type: 'string', required: false },
  { key: 'region', label: 'Region/Location', type: 'string', required: false },
  { key: 'channel', label: 'Sales Channel', type: 'string', required: false }
];


interface RowError {
  row: number;
  errors: string[];
}

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if unauthenticated
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  
  // Mapping of internal field key -> CSV header name
  const [mappings, setMappings] = useState<Record<string, string>>({});
  
  // Validation Results
  const [validRows, setValidRows] = useState<any[]>([]);
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // STEP 1: Handle CSV File Upload / Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrorMessage('Please select a valid CSV file.');
      return;
    }
    setFileName(file.name);
    setErrorMessage(null);
    setLoading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        setLoading(false);
        if (results.data.length === 0 || results.meta.fields?.length === 0) {
          setErrorMessage('The CSV file appears to be empty or invalid.');
          return;
        }

        const headers = results.meta.fields || [];
        setCsvHeaders(headers);
        setCsvData(results.data);
        
        // Auto-guess mapping based on common synonyms
        const initialMappings: Record<string, string> = {};
        REQUIRED_FIELDS.forEach((field) => {
          const synonyms: Record<string, string[]> = {
            date: ['date', 'year', 'time', 'created', 'ordered', 'timestamp', 'period'],
            product: ['product', 'item', 'title', 'name', 'sku', 'article', 'identifier'],
            category: ['category', 'type', 'group', 'class', 'department', 'family', 'genre'],
            quantity: ['quantity', 'qty', 'count', 'units', 'volume', 'weight'],
            revenue: ['revenue', 'sales', 'amount', 'total', 'price', 'income'],
            cost: ['cost', 'mrp', 'expense', 'spending', 'cogs', 'purchase_price'],
            customer: ['customer', 'client', 'buyer', 'user', 'recipient', 'outlet'],
            customerDetails: ['details', 'email', 'phone', 'contact', 'address', 'profile'],
            region: ['region', 'location', 'city', 'state', 'country', 'branch', 'store', 'zone'],
            channel: ['channel', 'outlet_type', 'source', 'medium', 'platform', 'venue']
          };

          const keysToSearch = synonyms[field.key] || [field.key];
          
          // Prioritize by scanning keywords sequentially (e.g. customer name matched first before outlet code)
          let match: string | undefined;
          for (const keyword of keysToSearch) {
            const kLower = keyword.toLowerCase();
            const found = headers.find((h) => {
              const hLower = h.toLowerCase().replace(/[^a-z0-9]/g, '');
              return hLower === kLower || hLower.includes(kLower) || kLower.includes(hLower);
            });
            if (found) {
              match = found;
              break;
            }
          }

          if (match) {
            initialMappings[field.key] = match;
          }
        });
        setMappings(initialMappings);
        setStep(2);
      },
      error: (err) => {
        setLoading(false);
        setErrorMessage(`Error parsing CSV: ${err.message}`);
      }
    });
  };

  // STEP 2: Handle Column Mappings Toggles & Verification
  const handleMappingChange = (fieldKey: string, csvHeader: string) => {
    setMappings((prev) => ({
      ...prev,
      [fieldKey]: csvHeader,
    }));
  };

  const validateData = () => {
    setErrorMessage(null);
    // Ensure all required fields are mapped
    const unmappedRequired = REQUIRED_FIELDS.filter((f) => f.required && !mappings[f.key]);
    if (unmappedRequired.length > 0) {
      setErrorMessage(`Please map all required columns before proceeding. Unmapped: ${unmappedRequired.map((f) => f.label).join(', ')}`);
      return;
    }

    const validatedClean: any[] = [];
    const errors: RowError[] = [];

    csvData.forEach((row, index) => {
      const rowNum = index + 1;
      const currentErrors: string[] = [];
      const validatedRow: any = {};

      // Check if the entire row is empty/blank to skip it silently
      const isRowBlank = Object.values(row).every(
        (val) => val === undefined || val === null || val.toString().trim() === ""
      );
      if (isRowBlank) return;

      REQUIRED_FIELDS.forEach((field) => {
        const rawValue = mappings[field.key] ? row[mappings[field.key]] : undefined;

        // Handle empty values / unmapped columns
        if (rawValue === undefined || rawValue === null || rawValue.toString().trim() === '') {
          if (field.type === 'integer') {
            validatedRow[field.key] = 1;
          } else if (field.type === 'number') {
            validatedRow[field.key] = 0;
          } else if (field.type === 'date') {
            validatedRow[field.key] = new Date().toISOString().split('T')[0];
          } else {
            if (field.key === 'product') {
              validatedRow[field.key] = 'General Product';
            } else {
              validatedRow[field.key] = 'N/A';
            }
          }
          return;
        }

        let cleanVal = rawValue.toString().trim();

        // Fault-tolerant Type validations
        if (field.type === 'integer') {
          const cleanNum = cleanVal.replace(/[^0-9.-]/g, '');
          const intVal = Math.round(parseFloat(cleanNum));
          if (isNaN(intVal)) {
            if (field.required) {
              currentErrors.push(`Invalid integer format in field: ${field.label}`);
            } else {
              validatedRow[field.key] = 1;
            }
          } else {
            validatedRow[field.key] = intVal;
          }
        } else if (field.type === 'number') {
          const cleanDec = cleanVal.replace(/[^0-9.-]/g, '');
          const numVal = parseFloat(cleanDec);
          if (isNaN(numVal)) {
            if (field.required) {
              currentErrors.push(`Invalid numeric format in field: ${field.label}`);
            } else {
              validatedRow[field.key] = 0;
            }
          } else {
            validatedRow[field.key] = parseFloat(numVal.toFixed(2));
          }
        } else if (field.type === 'date') {
          // If cleanVal is just a year (e.g. "1999"), convert to standard YYYY-MM-DD
          if (/^\d{4}$/.test(cleanVal)) {
            let year = parseInt(cleanVal);
            if (year < 2022) {
              // Shift 1985-2009 to modern 2022-2026
              year = 2022 + Math.round((year - 1985) * (4 / 24));
            }
            cleanVal = `${year}-01-01`;
          } else {
            const tempDate = new Date(cleanVal);
            if (!isNaN(tempDate.getTime())) {
              let year = tempDate.getFullYear();
              if (year < 2022) {
                year = 2022 + Math.round((year - 1985) * (4 / 24));
                tempDate.setFullYear(year);
                cleanVal = tempDate.toISOString().split('T')[0];
              }
            }
          }
          const dateVal = new Date(cleanVal);
          if (isNaN(dateVal.getTime())) {
            validatedRow[field.key] = new Date().toISOString().split('T')[0]; // Fallback
          } else {
            validatedRow[field.key] = dateVal.toISOString().split('T')[0];
          }
        } else {
          validatedRow[field.key] = cleanVal;
        }
      });

      if (currentErrors.length > 0) {
        errors.push({ row: rowNum, errors: currentErrors });
      } else {
        validatedClean.push(validatedRow);
      }
    });

    setValidRows(validatedClean);
    setRowErrors(errors);
    setStep(3);
  };

  // STEP 3: Save to database using MongoDB API
  const handleSaveToDatabase = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (!session) {
        setErrorMessage('User session expired. Please log in again.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: fileName,
          rows: validRows,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to save data to database.');
        setLoading(false);
        return;
      }

      setSuccessMessage(`Successfully imported ${validRows.length} rows to the database!`);
      
      // Reset Upload UI
      setTimeout(() => {
        setStep(1);
        setFileName('');
        setCsvHeaders([]);
        setCsvData([]);
        setMappings({});
        setValidRows([]);
        setRowErrors([]);
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while uploading.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      <Navigation />

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
              <Sparkles className="w-4 h-4" /> Data Ingest Manager
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">CSV Upload Wizard</h1>
          </div>
          {/* Progress Indicators */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-semibold">
            <span className={`px-2 py-1 rounded ${step === 1 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>1. Import</span>
            <span className="text-slate-600">/</span>
            <span className={`px-2 py-1 rounded ${step === 2 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>2. Map Columns</span>
            <span className="text-slate-600">/</span>
            <span className={`px-2 py-1 rounded ${step === 3 ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>3. Validate & Save</span>
          </div>
        </header>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Import Issue</p>
              <p className="text-sm opacity-90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-3">
            <Check className="w-5 h-5" />
            <p className="font-semibold text-sm">{successMessage}</p>
          </div>
        )}

        {/* STEP 1: DROPZONE FILE INGEST */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-indigo-500 bg-slate-900/50 hover:bg-slate-900 rounded-2xl p-12 text-center cursor-pointer transition flex flex-col items-center group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".csv"
                className="hidden"
              />
              <div className="p-4 bg-indigo-500/10 text-indigo-400 group-hover:text-indigo-300 rounded-full mb-4 border border-indigo-500/20">
                {loading ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Drag and drop your Sales CSV file
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mb-4">
                We accept custom CSV shapes. You can map custom column layouts dynamically on the next screen.
              </p>
              <button className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-4 py-2 text-xs font-semibold transition">
                Select CSV File
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === 2 && (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-4 text-indigo-400 text-sm font-semibold">
              <FileSpreadsheet className="w-4 h-4" /> Mappings configuration
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Map CSV Columns to Sales Analyzer</h2>
            <p className="text-sm text-slate-400 mb-8">
              We parsed your CSV headers. Match our system database fields with the appropriate column name from your file.
            </p>

            <div className="space-y-4">
              {REQUIRED_FIELDS.map((field) => (
                <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-950 p-4 border border-slate-900 rounded-xl">
                  <div>
                    <span className="font-semibold text-sm text-white block">
                      {field.label} {!field.required && <span className="text-xs text-slate-500 font-normal ml-1">(Optional)</span>}
                    </span>
                    <span className="text-xs text-slate-500">
                      Type expected: {field.type}
                    </span>
                  </div>

                  <div>
                    <select
                      value={mappings[field.key] || ''}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">{field.required ? '-- Choose CSV Column --' : '-- Skip Column (Optional) --'}</option>
                      {csvHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-850">
              <button
                onClick={() => setStep(1)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-5 py-2 text-sm font-medium transition"
              >
                Back to Import
              </button>
              <button
                onClick={validateData}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-5 py-2 text-sm font-medium flex items-center gap-2 transition"
              >
                Validate Data <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: VALIDATION AND SAVE */}
        {step === 3 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-2">Verify Row Validation Results</h2>
              <p className="text-sm text-slate-400 mb-6">
                All records have been validated based on mapped columns. Check errors before sending data to database.
              </p>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Valid Records (Ready for Import)
                  </span>
                  <span className="text-3xl font-extrabold text-indigo-400 mt-2 block">
                    {validRows.length}
                  </span>
                </div>
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Failed Records (Will be skipped)
                  </span>
                  <span className={`text-3xl font-extrabold mt-2 block ${rowErrors.length > 0 ? 'text-amber-500' : 'text-slate-500'}`}>
                    {rowErrors.length}
                  </span>
                </div>
              </div>

              {rowErrors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold mb-2">
                    <AlertTriangle className="w-4 h-4" /> Rows with Errors List ({rowErrors.length})
                  </div>
                  <div className="bg-slate-950 border border-slate-900 rounded-xl max-h-60 overflow-y-auto divide-y divide-slate-900">
                    {rowErrors.map((err) => (
                      <div key={err.row} className="p-3 text-xs flex gap-4">
                        <span className="font-bold text-slate-400 shrink-0">Row {err.row}:</span>
                        <ul className="list-disc pl-4 text-slate-300 space-y-1">
                          {err.errors.map((msg, i) => (
                            <li key={i}>{msg}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-5 py-2 text-sm font-medium transition"
              >
                Back to Mappings
              </button>

              <button
                onClick={handleSaveToDatabase}
                disabled={loading || validRows.length === 0}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-6 py-2.5 text-sm font-semibold flex items-center gap-2 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Data...
                  </>
                ) : (
                  <>
                    Commit & Save {validRows.length} Rows
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
