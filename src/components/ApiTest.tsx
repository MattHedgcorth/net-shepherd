import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, CircularProgress } from '@mui/material';

const ApiTest: React.FC = () => {
  const [url, setUrl] = useState<string>('http://localhost:5085/api/WebsiteStatus/check?url=https://google.com');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  const testApi = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setStatusCode(null);

    try {
      console.log(`Testing API connection to: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      setStatusCode(response.status);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
      console.log('API response:', data);
    } catch (error: any) {
      console.error('API test error:', error);
      setError(error.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testHttpApi = async () => {
    // Try the HTTP version instead of HTTPS
    const httpUrl = url.replace('https://', 'http://').replace('7151', '5085');
    setUrl(httpUrl);
    
    // We'll call testApi() after state update in useEffect
    setTimeout(testApi, 100);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        API Connection Test
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="API URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          margin="normal"
          variant="outlined"
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={testApi}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Test API Connection'}
        </Button>
        
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={testHttpApi}
          disabled={loading}
        >
          Try HTTP Instead
        </Button>
      </Box>
      
      {statusCode !== null && (
        <Typography variant="subtitle1" gutterBottom>
          Status Code: {statusCode}
        </Typography>
      )}
      
      {error && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
          <Typography variant="subtitle1" color="error" gutterBottom>
            Error:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {error}
          </Typography>
        </Box>
      )}
      
      {result && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Response:
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              p: 2, 
              bgcolor: '#f5f5f5', 
              borderRadius: 1, 
              overflow: 'auto',
              maxHeight: 300,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {result}
          </Box>
        </Box>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Troubleshooting Tips:
        </Typography>
        <ul>
          <li>Make sure the API is running (check terminal)</li>
          <li>Try both HTTP and HTTPS URLs</li>
          <li>Check if CORS is properly configured</li>
          <li>Verify the port numbers match what's in launchSettings.json</li>
          <li>Check browser console for additional error details</li>
        </ul>
      </Box>
    </Paper>
  );
};

export default ApiTest;