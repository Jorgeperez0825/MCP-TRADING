'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700',
          color: 'black',
          marginBottom: '1rem'
        }}>
          Trading Assistant Platform
        </h1>
        
        <p style={{ 
          fontSize: '1.125rem',
          color: 'black',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Access real-time market data, get stock quotes, and analyze trading information through our intelligent chat interface.
        </p>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          backgroundColor: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          border: '1px solid #e5e7eb',
          textAlign: 'left'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'black',
            marginBottom: '0.5rem'
          }}>
            What You Can Do:
          </h2>
          
          <ul style={{
            listStyleType: 'none',
            padding: 0,
            margin: 0
          }}>
            <li style={{
              padding: '0.5rem 0',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                color: '#10B981',
                fontWeight: 'bold'
              }}>↗</span>
              <span><strong>Get stock quotes:</strong> "What's the current price of AAPL?"</span>
            </li>
            <li style={{
              padding: '0.5rem 0',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                color: '#10B981',
                fontWeight: 'bold'
              }}>↗</span>
              <span><strong>View market movers:</strong> "Show me today's top gainers and losers"</span>
            </li>
            <li style={{
              padding: '0.5rem 0',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                color: '#10B981',
                fontWeight: 'bold'
              }}>↗</span>
              <span><strong>Get company data:</strong> "Tell me about Tesla's financials"</span>
            </li>
            <li style={{
              padding: '0.5rem 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{
                color: '#10B981',
                fontWeight: 'bold'
              }}>↗</span>
              <span><strong>Analyze trends:</strong> "What's the MACD for MSFT?"</span>
            </li>
          </ul>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          <Link href="/chat">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'black',
              backgroundColor: '#7FFFD4',
              borderRadius: '0.375rem',
              border: '2px solid black',
              boxShadow: '4px 4px 0 0 rgba(0,0,0,1)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.boxShadow = '6px 6px 0 0 rgba(0,0,0,1)';
            }}
            onMouseOut={(e) => {
              const target = e.currentTarget as HTMLDivElement;
              target.style.boxShadow = '4px 4px 0 0 rgba(0,0,0,1)';
            }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Start Chat
            </div>
          </Link>
        </div>
        
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          marginTop: '2rem'
        }}>
          Powered by AlphaVantage API and Claude AI | <span style={{ color: '#10B981' }}>●</span> MCP Integration
        </p>
      </div>
    </div>
  );
} 