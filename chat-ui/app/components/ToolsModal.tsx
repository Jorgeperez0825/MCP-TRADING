import React from 'react';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTools: any[];
  mcpConnected: boolean;
  mcpError: string | null;
  activeTools?: string[]; // Herramientas actualmente en uso
  toolProgress?: {[key: string]: number}; // Progreso de cada herramienta (0-100)
}

const ToolsModal: React.FC<ToolsModalProps> = ({ 
  isOpen, 
  onClose, 
  availableTools, 
  mcpConnected, 
  mcpError,
  activeTools = [],
  toolProgress = {}
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 50,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        maxWidth: '90%',
        width: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        border: '2px solid black',
        boxShadow: '6px 6px 0 0 rgba(0,0,0,1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            margin: 0
          }}>Market Analysis Tools</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              lineHeight: 1
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Connection Status */}
        <div style={{
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '0.375rem',
          backgroundColor: mcpConnected ? '#f0fff4' : '#fff5f5',
          border: '1px solid',
          borderColor: mcpConnected ? '#68d391' : '#fc8181',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{
            height: '0.75rem',
            width: '0.75rem',
            backgroundColor: mcpConnected ? '#38a169' : '#e53e3e',
            borderRadius: '50%',
            display: 'inline-block'
          }}></span>
          <span>
            {mcpConnected 
              ? 'Connected to market data services' 
              : mcpError 
                ? `Connection error: ${mcpError}` 
                : 'Disconnected from market data services'}
          </span>
        </div>

        {/* Tools List */}
        <div style={{marginBottom: '1rem'}}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>Available Tools</h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {mcpConnected && availableTools.length > 0 ? (
              availableTools.map((tool, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '0.375rem',
                    backgroundColor: activeTools.includes(tool.name) ? '#f0f9ff' : '#f9fafb',
                    border: '1px solid',
                    borderColor: activeTools.includes(tool.name) ? '#63b3ed' : '#e5e7eb',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <strong>{tool.name}</strong>
                      <p style={{
                        margin: '0.25rem 0 0 0',
                        fontSize: '0.875rem',
                        color: '#4b5563'
                      }}>
                        {tool.description || 'Financial market data tool'}
                      </p>
                    </div>
                    
                    {activeTools.includes(tool.name) && (
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        color: '#3182ce',
                        backgroundColor: '#ebf8ff',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '9999px'
                      }}>
                        Active
                      </span>
                    )}
                  </div>
                  
                  {/* Progress bar for tools in use */}
                  {activeTools.includes(tool.name) && (
                    <div style={{
                      marginTop: '0.75rem',
                      height: '0.5rem',
                      width: '100%',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div 
                        style={{
                          height: '100%',
                          width: `${toolProgress[tool.name] || 0}%`,
                          backgroundColor: '#3182ce',
                          borderRadius: '9999px',
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{
                padding: '0.75rem',
                backgroundColor: '#f9fafb',
                borderRadius: '0.375rem',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {mcpConnected 
                  ? 'No tools available' 
                  : 'Connect to see available tools'}
              </div>
            )}
          </div>
        </div>

        {/* Research capabilities section */}
        <div>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>Research Capabilities</h3>
          
          <ul style={{
            margin: 0,
            padding: 0,
            listStyleType: 'none'
          }}>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0'
            }}>
              <span style={{color: '#3182ce'}}>✓</span>
              <span>Real-time stock quotes and market data</span>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0'
            }}>
              <span style={{color: '#3182ce'}}>✓</span>
              <span>Technical analysis indicators (RSI, MACD, Bollinger Bands)</span>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0'
            }}>
              <span style={{color: '#3182ce'}}>✓</span>
              <span>Company fundamentals and financial statements</span>
            </li>
            <li style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0'
            }}>
              <span style={{color: '#3182ce'}}>✓</span>
              <span>Market sentiment analysis from news sources</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ToolsModal; 