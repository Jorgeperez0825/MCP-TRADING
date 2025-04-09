import React from 'react';

interface AnalysisStep {
  id?: string;
  name: string;
  toolName: string;
  status: 'pending' | 'active' | 'completed' | 'error' | 'failed';
  description?: string;
  result?: any;
  startTime?: string;
  endTime?: string;
  data?: any;
  error?: string;
  details?: string;
}

interface AnalysisStepperProps {
  steps: AnalysisStep[];
  currentStep: number;
  latestUpdate?: string;
}

const getToolDescription = (toolName: string): string => {
  switch(toolName) {
    case 'Market Movers Analysis':
      return 'Identifying the top gainers and losers to spot market momentum and opportunities';
    case 'Stock Quote Data':
      return 'Retrieving real-time pricing data to understand current market valuation';
    case 'Historical Price Data':
      return 'Analyzing past price movements to identify patterns and trends';
    case 'Moving Averages':
      return 'Calculating SMA to identify support/resistance levels and trend direction';
    case 'Relative Strength Index':
      return 'Measuring overbought/oversold conditions to identify potential reversals';
    case 'MACD Indicator':
      return 'Analyzing momentum and trend strength to identify potential entry/exit points';
    case 'Bollinger Bands':
      return 'Measuring volatility and relative price levels to identify potential breakouts';
    case 'Market News Sentiment':
      return 'Analyzing news and social sentiment to gauge market psychology';
    default:
      return 'Gathering market intelligence data';
  }
};

const getToolIcon = (toolName: string): React.ReactNode => {
  switch(toolName) {
    case 'Market Movers Analysis':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m17 11-5-5-5 5"></path>
          <path d="m17 18-5-5-5 5"></path>
        </svg>
      );
    case 'Stock Quote Data':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"></rect>
          <path d="M3 9h18"></path>
          <path d="M9 21V9"></path>
        </svg>
      );
    case 'Historical Price Data':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="m19 9-5 5-4-4-3 3"></path>
        </svg>
      );
    case 'Moving Averages':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="M7 14 12 9l5 5"></path>
        </svg>
      );
    case 'Relative Strength Index':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12h4"></path>
          <path d="M9 12h13"></path>
          <path d="M11 18H9a2 2 0 0 1-2-2v-4"></path>
        </svg>
      );
    case 'MACD Indicator':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="M7 14 12 9l5 5"></path>
          <path d="M7 18 12 13l5 5"></path>
        </svg>
      );
    case 'Bollinger Bands':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="M7 14 12 9l5 5"></path>
          <path d="M7 18 12 13l5 5"></path>
          <path d="M7 10 12 5l5 5"></path>
        </svg>
      );
    case 'Market News Sentiment':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
          <path d="M18 14h-8"></path>
          <path d="M15 18h-5"></path>
          <path d="M10 6h8"></path>
          <path d="M18 10h-8"></path>
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m8 12 3 3 5-5"></path>
        </svg>
      );
  }
};

const AnalysisStepper: React.FC<AnalysisStepperProps> = ({ steps, currentStep, latestUpdate }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-gray-50 rounded-lg shadow-sm">
      {latestUpdate && (
        <div className="mb-4 text-sm text-gray-600">
          {latestUpdate}
        </div>
      )}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.toolName} className="relative">
            {/* Progress line */}
            {index < steps.length - 1 && (
              <div className={`absolute left-3 top-8 w-0.5 h-full -z-10 
                ${step.status === 'completed' ? 'bg-green-500' : 
                  step.status === 'error' ? 'bg-red-500' : 
                  step.status === 'active' ? 'bg-blue-500' : 'bg-gray-300'}`} 
              />
            )}
            
            {/* Step circle and content */}
            <div className="flex items-start space-x-4">
              {/* Status circle */}
              <div className={`relative flex items-center justify-center w-6 h-6 rounded-full border-2
                ${step.status === 'completed' ? 'border-green-500 bg-green-100' :
                  step.status === 'error' ? 'border-red-500 bg-red-100' :
                  step.status === 'active' ? 'border-blue-500 bg-blue-100' :
                  'border-gray-300 bg-white'}`}>
                {step.status === 'completed' && (
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {step.status === 'error' && (
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                {step.status === 'active' && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1">
                <h3 className={`font-medium ${
                  step.status === 'completed' ? 'text-green-700' :
                  step.status === 'error' ? 'text-red-700' :
                  step.status === 'active' ? 'text-blue-700' :
                  'text-gray-700'
                }`}>
                  {step.name}
                </h3>
                <p className="text-sm text-gray-500">{step.description}</p>
                {step.result && (
                  <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                      {step.result}
                    </pre>
                  </div>
                )}
                {step.details && (
                  <p className="mt-1 text-sm text-gray-500">{step.details}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisStepper; 