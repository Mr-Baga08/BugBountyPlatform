import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCcw } from 'lucide-react';

// Define API base URL - This ensures our app works in all environments
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://bug-hunt-backend-970777025928.us-central1.run.app/api";

const TaskExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [importStage, setImportStage] = useState('idle'); // idle, uploading, validating, importing, success, error
  const [logMessages, setLogMessages] = useState([]);

  // Log function to track the import process
  const addLog = (message) => {
    setLogMessages(prev => [...prev, { time: new Date().toLocaleTimeString(), message }]);
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    
    // Reset states when a new file is selected
    setLogMessages([]);
    setImportStage('idle');
    setUploadStatus(null);
    
    const fileType = selectedFile.type;
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/octet-stream' // Some browsers assign this to Excel files
    ];
    
    addLog(`Selected file: ${selectedFile.name} (${fileType})`);
    
    // Check file type
    const isValidMimeType = validTypes.includes(fileType);
    const isValidExtension = selectedFile.name.endsWith('.xlsx') || 
                            selectedFile.name.endsWith('.xls') || 
                            selectedFile.name.endsWith('.csv');
    
    if (!isValidMimeType && !isValidExtension) {
      setUploadStatus({
        success: false,
        message: 'Please upload an Excel file (.xlsx, .xls) or CSV file'
      });
      addLog(`Invalid file type: ${fileType}`);
      return;
    }
    
    setFile(selectedFile);
    setFileName(selectedFile.name);
    generatePreview(selectedFile);
    addLog('File validated and ready for upload');
  };

  const generatePreview = (file) => {
    setPreviewData({
      fileName: file.name,
      fileSize: (file.size / 1024).toFixed(2) + ' KB',
      lastModified: new Date(file.lastModified).toLocaleString(),
      type: file.type
    });
  };

  const handleSubmit = async () => {
    if (!file) {
      setUploadStatus({
        success: false,
        message: 'Please select a file to upload'
      });
      return;
    }
    
    setUploading(true);
    setImportStage('uploading');
    addLog('Starting upload and import process...');
    
    const formData = new FormData();
    formData.append('excelFile', file); // This must match the field name expected by multer on the server
    
    try {
      // Step 1: Upload the file
      addLog('Step 1: Uploading file to server...');
      setImportStage('uploading');
      
      const uploadResponse = await fetch(`${API_BASE_URL}/task-import/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': localStorage.getItem('token')
        }
      });
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        addLog(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
        addLog(`Error details: ${errorText}`);
        throw new Error(`Upload failed: ${uploadResponse.statusText}. ${errorText}`);
      }
      
      const uploadData = await uploadResponse.json();
      addLog(`Upload successful: ${uploadData.message}`);
      
      // Step 2: Validate the uploaded file
      addLog('Step 2: Validating file contents...');
      setImportStage('validating');
      
      const validateResponse = await fetch(`${API_BASE_URL}/task-import/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
          filename: uploadData.filename
        })
      });
      
      if (!validateResponse.ok) {
        const errorText = await validateResponse.text();
        addLog(`Validation failed: ${validateResponse.status} ${validateResponse.statusText}`);
        addLog(`Error details: ${errorText}`);
        throw new Error(`Validation failed: ${validateResponse.statusText}. ${errorText}`);
      }
      
      const validateData = await validateResponse.json();
      
      if (!validateData.isValid) {
        const errors = validateData.errors || ['Unknown validation error'];
        addLog(`Validation errors: ${errors.join(', ')}`);
        throw new Error(`Validation errors: ${errors.join(', ')}`);
      }
      
      addLog(`Validation successful. Found ${validateData.data.length} tasks to import.`);
      
      // Step 3: Import the validated data
      addLog('Step 3: Importing tasks to database...');
      setImportStage('importing');
      
      // Log the data we're sending
      addLog(`Sending ${validateData.data.length} tasks for import`);
      
      const importResponse = await fetch(`${API_BASE_URL}/task-import/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({
          tasks: validateData.data
        })
      });
      
      if (!importResponse.ok) {
        const errorText = await importResponse.text();
        addLog(`Import failed: ${importResponse.status} ${importResponse.statusText}`);
        addLog(`Error details: ${errorText}`);
        throw new Error(`Import failed: ${importResponse.statusText}. ${errorText}`);
      }
      
      const importData = await importResponse.json();
      
      addLog(`Import completed: ${importData.results.successful} tasks imported successfully, ${importData.results.failed} failed`);
      setImportStage('success');
      
      // Show the final success message
      setUploadStatus({
        success: true,
        message: `Successfully imported ${importData.results.successful} tasks! ${
          importData.results.failed > 0 
            ? `Failed to import ${importData.results.failed} tasks.` 
            : ''
        }`
      });
      
      // If there were any failures, log them
      if (importData.results.failures && importData.results.failures.length > 0) {
        importData.results.failures.forEach(failure => {
          addLog(`Failed to import task ${failure.taskId}: ${failure.error}`);
        });
      }
      
    } catch (error) {
      console.error('Import error:', error);
      setImportStage('error');
      addLog(`Error: ${error.message}`);
      setUploadStatus({
        success: false,
        message: error.message || 'Error during import process. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  // Get a friendly status message for the current import stage
  const getStageMessage = () => {
    switch (importStage) {
      case 'uploading': return 'Uploading file...';
      case 'validating': return 'Validating data...';
      case 'importing': return 'Importing tasks...';
      case 'success': return 'Import successful!';
      case 'error': return 'Import failed';
      default: return 'Ready to upload';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2 text-gray-800">Import Tasks</h1>
        <p className="text-gray-500">Upload an Excel spreadsheet to bulk import tasks into the system</p>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={(e) => handleFileChange(e.target.files[0])}
        />
        
        {!fileName ? (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-lg text-gray-800 mb-2">Drag and drop your Excel file here</p>
            <p className="text-sm text-gray-500 mb-4">or</p>
            <label 
              htmlFor="file-upload" 
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Browse Files
            </label>
            <p className="mt-4 text-xs text-gray-500">Supports .xlsx, .xls, and .csv files</p>
          </>
        ) : (
          <div className="w-full">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-medium text-gray-800">{fileName}</p>
                <p className="text-sm text-gray-500">{previewData?.fileSize} • {previewData?.type}</p>
              </div>
              <label 
                htmlFor="file-upload" 
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors cursor-pointer"
              >
                Change
              </label>
            </div>
            
            {previewData && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">File Details:</h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>File Name: {previewData.fileName}</p>
                  <p>Size: {previewData.fileSize}</p>
                  <p>Last Modified: {previewData.lastModified}</p>
                </div>
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={uploading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                  {getStageMessage()}
                </>
              ) : 'Upload and Import Tasks'}
            </button>
          </div>
        )}
      </div>
      
      {/* Status message */}
      {uploadStatus && (
        <div className={`mt-6 p-4 rounded-lg flex items-start ${
          uploadStatus.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {uploadStatus.success ? 
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> : 
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          }
          <span>{uploadStatus.message}</span>
        </div>
      )}
      
      {/* Process logs (visible when uploading or when there's an error) */}
      {(uploading || (uploadStatus && !uploadStatus.success) || importStage === 'success') && logMessages.length > 0 && (
        <div className="mt-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Import Log:</h3>
          <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded text-xs font-mono text-gray-800 dark:text-gray-200 h-48 overflow-y-auto">
            {logMessages.map((log, i) => (
              <div key={i} className="mb-1">
                <span className="text-gray-500">[{log.time}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Format guide */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Excel File Format</h2>
        <p className="text-gray-600 mb-3">Your Excel file should have the following columns:</p>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-2">Column</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Required</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            <tr>
              <td className="px-4 py-2 font-medium">taskId</td>
              <td className="px-4 py-2">Unique identifier for the task</td>
              <td className="px-4 py-2 text-center">Yes</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">projectName</td>
              <td className="px-4 py-2">Name of the project</td>
              <td className="px-4 py-2 text-center">Yes</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">industry</td>
              <td className="px-4 py-2">Industry category</td>
              <td className="px-4 py-2 text-center">Yes</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">DomainLink</td>
              <td className="px-4 py-2">Link to the domain</td>
              <td className="px-4 py-2 text-center">No</td>
            </tr>
            <tr>
              <td className="px-4 py-2 font-medium">Batch</td>
              <td className="px-4 py-2">Batch identifier</td>
              <td className="px-4 py-2 text-center">No</td>
            </tr>
          </tbody>
        </table>
        
        <a 
          href={`${API_BASE_URL}/task-import/template`}
          download 
          className="mt-6 inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <FileText className="w-4 h-4 mr-2" />
          Download Template
        </a>
      </div>
    </div>
  );
};

export default TaskExcelUpload;