import { useState } from 'react';
import { apiService } from '../services/api';
import { Button } from './ui/button';

const GraphQLTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testGraphQLConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing GraphQL connection...');
    
    try {
      // Test a simple query - get all tags
      const tags = await apiService.getAllTags();
      setTestResult(`✅ GraphQL connection successful! Found ${tags.length} tags.`);
    } catch (error: any) {
      setTestResult(`❌ GraphQL connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">GraphQL Integration Test</h3>
      <Button 
        onClick={testGraphQLConnection}
        disabled={isLoading}
        className="mb-4"
      >
        {isLoading ? 'Testing...' : 'Test GraphQL Connection'}
      </Button>
      {testResult && (
        <div className={`p-3 rounded-md ${
          testResult.includes('✅') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {testResult}
        </div>
      )}
    </div>
  );
};

export default GraphQLTest; 