import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import ProgressBar from '@ramonak/react-progress-bar';
import { useDropzone } from 'react-dropzone';
import { CSVLink } from 'react-csv';

const CHUNK_SIZE = 100;

const FileUpload = ({ apiEndpoint }) => {
  console.log("API Point from MRP", apiEndpoint)
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);
  const [errorData, setErrorData] = useState([]);
  const [validData, setValidData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [processing, setProcessing] = useState(false); // New state for processing

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFileName(file.name);
    setProgress(0);
    setError(null);
    setErrorData([]);
    setValidData([]);
    setHeaders([]);
    setProcessing(true); // Set processing to true when file upload starts
    handleFileUpload(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.csv' });

  const handleFileUpload = (file) => {
    console.log('Handling file upload for:', file.name);
    console.log('Current API Endpoint:', apiEndpoint);
    let uploadedChunks = 0;
    Papa.parse(file, {
      header: true,
      chunk: async (results, parser) => {
        parser.pause();
        try {
          console.log('Chunk Data:', results.data);
          const responseData = await uploadChunk(results.data);
          console.log('API Response Data:', responseData);

          // Extract headers from the first item of validData if not already set
          if (validData.length === 0 && responseData.validData && responseData.validData.length > 0) {
            const firstItem = responseData.validData[0];
            const dynamicHeaders = Object.keys(firstItem).map(key => ({ label: key, key }));
            setHeaders(prevHeaders => [...new Set([...prevHeaders.map(h => h.key), ...dynamicHeaders.map(d => d.key)])].map(key => ({
              label: key,
              key
            })));
          }

          // Extract headers from the first error item if not already set
          if (errorData.length === 0 && responseData.errors && responseData.errors.length > 0) {
            const firstErrorItem = responseData.errors[0];
            const errorHeaders = Object.keys(firstErrorItem).map(key => ({ label: key, key }));
            setHeaders(prevHeaders => [...new Set([...prevHeaders.map(h => h.key), ...errorHeaders.map(e => e.key)])].map(key => ({
              label: key,
              key
            })));
          }

          // Set errors and valid data
          if (responseData.errors && Array.isArray(responseData.errors)) {
            setErrorData(prev => [...prev, ...responseData.errors]);
          }
          
          if (responseData.validData && Array.isArray(responseData.validData)) {
            setValidData(prev => [...prev, ...responseData.validData]);
          }

          uploadedChunks += 1;
          setProgress(Math.round((uploadedChunks * CHUNK_SIZE) / file.size * 100));
        } catch (err) {
          console.error('Upload Error:', err);
          setError(err.response ? err.response.data.error : 'Unknown error');
          parser.abort();
        }
        parser.resume();
      },
      complete: () => {
        console.log('File upload complete');
        setProgress(100);
        setProcessing(false); // Reset processing when upload is complete
      },
    });
  };

  const uploadChunk = async (chunk) => {
    console.log('Uploading chunk to:', apiEndpoint);
    try {
      const response = await axios.post(apiEndpoint, { data: chunk });
      return response.data; // Return JSON data from the response
    } catch (error) {
      if (error.response && error.response.status === 400) {
        return error.response.data; // Return JSON data with errors and validData
      } else {
        console.error('Chunk Upload Error:', error.response ? error.response.data : error.message);
        throw error;
      }
    }
  };

  // Combine errors and valid data for CSV export
  const csvData = [
    ...errorData.map(item => ({
      ...item,
      error: item.error || 'Duplicate in database'
    })),
    ...validData.map(item => ({
      ...item,
      error: 'success'
    }))
  ];
  console.log(csvData);

  return (
    <>
      <div {...getRootProps()} style={dropzoneStyle}>
        <input {...getInputProps()} />
        <p className='font20px'>Drag 'n' drop a CSV file here, or click to select one</p>
      </div>
      {fileName && <p className='m-4 mb-0'><b>Uploading:</b> {fileName}</p>}
      {processing && <p className='p-4' style={{ color: 'green' }}>Processing files ...</p>}
      {error && (
        <p className='p-4' style={{ color: 'red' }}>
          {error.includes('Duplicate in chunk') && 'Error: Duplicates found in the chunk.'}
          {error.includes('Duplicate in database') && 'Error: Duplicates found in the database.'}
          {(!error.includes('Duplicate in chunk') && !error.includes('Duplicate in database')) && `Error: ${error}`}
        </p>
      )}

      <ProgressBar className='pb-4 px-4 my-pg' completed={progress} />
      
      {(errorData.length > 0 || validData.length > 0) && (
        <>
          <CSVLink
            data={csvData}
            headers={headers}
            filename="uploaded_data.csv"
            className="btn btn-danger w-75 m-4"
            style={{margin:'0 190px'}}
          >
            Export Data
          </CSVLink>
          <div className='error-table d-none overflow-hidden w-50'>
            <h4>Uploaded Data:</h4>
            <table>
              <thead>
                <tr>
                  {headers.length > 0 ? (
                    headers.map((header, index) => (
                      <th key={index}>{header.label}</th>
                    ))
                  ) : (
                    <th>No data to display</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {csvData.length > 0 ? (
                  csvData.map((item, index) => (
                    <tr key={index}>
                      {headers.map((header, idx) => (
                        <td key={idx}>{item[header.key]}</td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length}>No data to display</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};

const dropzoneStyle = {
  width: '92%',
  height: '200px',
  borderWidth: '2px',
  borderColor: '#666',
  borderStyle: 'dashed',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  minWidth: '570px',
  margin: '0px 25px'
};

export default FileUpload;
