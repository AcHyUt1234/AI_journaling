// src/ApiTest.tsx
// Test page to debug your API endpoint

import React, { useState } from 'react';

const ApiTest = () => {
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testApi = async () => {
    setLoading(true);
    setError('');
    setResponse('');
    setLogs([]);

    try {
      addLog('Starting API test...');
      addLog('Sending POST request to /api/chat');
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: 'Say "Hello! The API is working perfectly!" in a friendly way.'
            }
          ]
        })
      });

      addLog(`Response status: ${res.status} ${res.statusText}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        addLog('API returned error');
        setError(JSON.stringify(errorData, null, 2));
        return;
      }

      const data = await res.json();
      addLog('API call successful!');
      
      if (data.content && data.content[0] && data.content[0].text) {
        setResponse(data.content[0].text);
        addLog('Successfully extracted response text');
      } else {
        setResponse(JSON.stringify(data, null, 2));
        addLog('Response in unexpected format');
      }
    } catch (err) {
      addLog(`Error caught: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setError(`Network Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">🔍 API Diagnostic Tool</h1>
          <p className="text-gray-600 mb-6">Test your Anthropic API connection</p>
          
          <button
            onClick={testApi}
            disabled={loading}
            className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">⏳</span>
                Testing...
              </span>
            ) : (
              '▶ Test API Endpoint'
            )}
          </button>
        </div>

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 mb-6 font-mono text-sm">
            <div className="font-bold mb-2 text-green-300">📋 Execution Log:</div>
            {logs.map((log, i) => (
              <div key={i} className="mb-1">{log}</div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">❌</span>
              <div className="flex-1">
                <h2 className="font-bold text-red-800 mb-2 text-lg">Error Detected</h2>
                <pre className="text-sm text-red-700 whitespace-pre-wrap overflow-auto bg-red-100 p-3 rounded">{error}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Success Response */}
        {response && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <span className="text-2xl mr-3">✅</span>
              <div className="flex-1">
                <h2 className="font-bold text-green-800 mb-2 text-lg">Success! API is Working</h2>
                <div className="bg-green-100 p-4 rounded text-green-800">{response}</div>
              </div>
            </div>
          </div>
        )}

        {/* Troubleshooting Guide */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="font-bold text-xl mb-4 flex items-center">
            <span className="text-2xl mr-2">🔧</span>
            Troubleshooting Checklist
          </h2>
          <div className="space-y-4">
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold mb-1">1. Check Environment Variable</h3>
              <p className="text-sm text-gray-600">Vercel Dashboard → Settings → Environment Variables</p>
              <p className="text-sm text-gray-600">Verify <code className="bg-gray-100 px-2 py-1 rounded">ANTHROPIC_API_KEY</code> exists</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold mb-1">2. Check All Environments</h3>
              <p className="text-sm text-gray-600">Make sure the variable is enabled for Production, Preview, AND Development</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold mb-1">3. Verify API Key Format</h3>
              <p className="text-sm text-gray-600">Should start with: <code className="bg-gray-100 px-2 py-1 rounded">sk-ant-api03-...</code></p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold mb-1">4. Redeploy After Changes</h3>
              <p className="text-sm text-gray-600">Environment variable changes require a new deployment</p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold mb-1">5. Check Vercel Function Logs</h3>
              <p className="text-sm text-gray-600">Dashboard → Deployments → Functions → api/chat</p>
            </div>
          </div>
        </div>

        {/* Quick Checks */}
        <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">🎯 Quick Checks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold mb-2">File Structure:</div>
              <div className="bg-white p-3 rounded font-mono text-xs">
                <div>project/</div>
                <div className="ml-4">├── api/</div>
                <div className="ml-8 text-orange-600">└── chat.ts ✓</div>
                <div className="ml-4">└── src/</div>
                <div className="ml-8">└── ApiTest.tsx ✓</div>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Expected Response:</div>
              <div className="bg-white p-3 rounded font-mono text-xs">
                <div>&#123;</div>
                <div className="ml-4">&quot;content&quot;: [&#123;</div>
                <div className="ml-8 text-green-600">&quot;text&quot;: &quot;Hello!...&quot;</div>
                <div className="ml-4">&#125;]</div>
                <div>&#125;</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-orange-600 hover:text-orange-700 underline"
          >
            ← Back to Journal App
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;