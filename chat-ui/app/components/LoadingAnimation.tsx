import React, { useEffect, useState } from 'react';

interface LoadingAnimationProps {
  tools?: string[];
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ tools = [], message }) => {
  // Estado para animar la entrada y salida de herramientas
  const [animatedTools, setAnimatedTools] = useState<{name: string, status: 'entering'|'active'|'exiting'}[]>([]);
  
  // Efecto para animar las herramientas cuando cambian
  useEffect(() => {
    // Marcar herramientas existentes que no están en el nuevo array como 'exiting'
    setAnimatedTools(prev => {
      const updated = prev.map(tool => {
        if (!tools.includes(tool.name)) {
          return { ...tool, status: 'exiting' as const };
        }
        return tool;
      });
      
      // Añadir nuevas herramientas como 'entering'
      const newTools = tools.filter(tool => !prev.some(p => p.name === tool))
        .map(tool => ({ name: tool, status: 'entering' as const }));
      
      return [...updated, ...newTools];
    });
    
    // Eliminar herramientas que están saliendo después de la animación
    const timer = setTimeout(() => {
      setAnimatedTools(prev => {
        const current = prev.filter(tool => tool.status !== 'exiting');
        // Actualizar estado de herramientas que están entrando a activas
        return current.map(tool => 
          tool.status === 'entering' ? { ...tool, status: 'active' as const } : tool
        );
      });
    }, 500); // Tiempo de la animación
    
    return () => clearTimeout(timer);
  }, [tools]);
  
  return (
    <div 
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        backgroundColor: '#f9fafb',
        color: 'black',
        border: '2px solid black',
        boxShadow: '3px 3px 0 0 rgba(0,0,0,1)',
        width: '100%',
        maxWidth: '350px'
      }}
    >
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: animatedTools.length > 0 ? '0.75rem' : '0'
      }}>
        {/* Animated dots */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}>
          <div style={{
            height: '0.5rem',
            width: '0.5rem',
            backgroundColor: '#3182ce',
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}></div>
          <div style={{
            height: '0.5rem',
            width: '0.5rem',
            backgroundColor: '#3182ce',
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite ease-in-out 0.3s'
          }}></div>
          <div style={{
            height: '0.5rem',
            width: '0.5rem',
            backgroundColor: '#3182ce',
            borderRadius: '50%',
            animation: 'pulse 1.5s infinite ease-in-out 0.6s'
          }}></div>
        </div>
        
        {/* Custom loading message */}
        <span style={{ fontWeight: '500' }}>
          {message || "Analyzing market data..."}
        </span>
      </div>
      
      {/* Show tools being used with animations */}
      {animatedTools.length > 0 && (
        <div style={{
          marginTop: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem'
        }}>
          {animatedTools.map((tool, index) => (
            <div 
              key={`${tool.name}-${index}`} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.75rem',
                color: '#4b5563',
                opacity: tool.status === 'entering' ? 0 : tool.status === 'exiting' ? 0 : 1,
                transform: `translateX(${tool.status === 'entering' ? '-10px' : tool.status === 'exiting' ? '10px' : '0px'})`,
                transition: 'opacity 0.5s ease, transform 0.5s ease',
              }}
            >
              <div 
                style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '16px', 
                  height: '16px',
                  color: getToolColor(tool.name),
                  animation: tool.status === 'active' ? 'toolPulse 2s infinite ease-in-out' : 'none'
                }}
              >
                {getToolIcon(tool.name)}
              </div>
              <span style={{ color: getToolColor(tool.name) }}>
                {getToolLabel(tool.name)}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(0.7);
            opacity: 0.5;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes toolPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

// Función para obtener un color basado en la herramienta
const getToolColor = (tool: string): string => {
  switch (tool) {
    case 'get_quote':
      return '#2563eb'; // Azul
    case 'get_sma':
      return '#059669'; // Verde
    case 'get_macd':
      return '#7c3aed'; // Púrpura
    case 'get_rsi':
      return '#db2777'; // Rosa
    case 'get_news_sentiment':
      return '#f59e0b'; // Ámbar
    case 'get_top_gainers_losers':
      return '#ef4444'; // Rojo
    default:
      return '#3182ce'; // Azul predeterminado
  }
};

// Función para obtener un icono basado en la herramienta
const getToolIcon = (tool: string) => {
  switch (tool) {
    case 'get_quote':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      );
    case 'get_sma':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"></path>
          <path d="M3 12h6l3-9 5 15 4-6"></path>
        </svg>
      );
    case 'get_macd':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 12 8-8v16"></path>
          <path d="m14 12 8-8v16"></path>
        </svg>
      );
    case 'get_rsi':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12h2l4-10 3 10 3-8 3 15 5-5"></path>
        </svg>
      );
    case 'get_news_sentiment':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
        </svg>
      );
  }
};

// Función para obtener una etiqueta descriptiva basada en la herramienta
const getToolLabel = (tool: string): string => {
  switch (tool) {
    case 'get_quote':
      return 'Obteniendo cotización actual';
    case 'get_sma':
      return 'Calculando promedio móvil simple';
    case 'get_macd':
      return 'Analizando señales MACD';
    case 'get_rsi':
      return 'Calculando índice de fuerza relativa';
    case 'get_news_sentiment':
      return 'Procesando sentimiento de noticias';
    case 'get_top_gainers_losers':
      return 'Obteniendo principales ganadores/perdedores';
    case 'get_bbands':
      return 'Calculando bandas de Bollinger';
    case 'get_company_overview':
      return 'Recuperando datos de la empresa';
    case 'search_symbol':
      return 'Buscando símbolos de acciones';
    default:
      return tool;
  }
};

export default LoadingAnimation; 