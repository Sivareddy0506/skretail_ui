// src/components/FileUpload.js
import React, { useState, useCallback } from 'react';
import axios from 'axios';
import Papa from 'papaparse';
import ProgressBar from '@ramonak/react-progress-bar';
import { useDropzone } from 'react-dropzone';



const CHUNK_SIZE = 100; // Define chunk size

const FileUpload = () => {
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    setFileName(file.name);
    setProgress(0);
    setError(null);
    handleFileUpload(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: '.csv' });

  const handleFileUpload = (file) => {
    let uploadedChunks = 0;
    Papa.parse(file, {
      header: true,
      chunk: async (results, parser) => {
        parser.pause();
        try {
          await uploadChunk(results.data);
          uploadedChunks += 1;
          setProgress(Math.round((uploadedChunks * CHUNK_SIZE) / file.size * 100));
        } catch (err) {
          setError(err.response.data.error);
          parser.abort();
        }
        parser.resume();
      },
      complete: () => {
        console.log('File upload complete');
        setProgress(100);
      },
    });
  };
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const uploadChunk = async (chunk) => {
    try {
      await axios.post(`${API_BASE_URL}/products/upload-chunk`, { data: chunk });
    } catch (error) {
      throw error;
    }
  };

  return (
    <>
    <div {...getRootProps()} style={dropzoneStyle}>
      <input {...getInputProps()} />
      <p className='font20px'>Drag 'n' drop a CSV file here, or click to select one</p>
      
    </div>
    {fileName && <p className='m-4 mb-0'><b>Uploading:</b> {fileName}</p>}
      {error && <p className='p-4' style={{ color: 'red' }}>Error: {error}</p>}
      <ProgressBar className='pb-4 px-4 my-pg' completed={progress} />
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
