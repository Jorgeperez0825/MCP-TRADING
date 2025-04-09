import React from 'react';

interface AnalysisTemplateProps {
  type: 'portfolio_diversification' | 'stock_comparison' | 'market_overview' | 'technical_analysis';
  title: string;
  data: any;
}

const AnalysisTemplate: React.FC<AnalysisTemplateProps> = ({ type, title, data }) => {
  // Format percentage with color coding
  const formatPercentage = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
    const color = numValue > 0 ? '#10b981' : numValue < 0 ? '#ef4444' : '#6b7280';
    
    return (
      <span style={{ color, fontWeight: '600' }}>
        {numValue > 0 ? '+' : ''}{typeof value === 'string' ? value : `${numValue.toFixed(2)}%`}
      </span>
    );
  };
  
  // Format stock symbols
  const formatSymbol = (symbol: string) => {
    return (
      <span style={{ 
        fontWeight: '600',
        backgroundColor: '#f3f4f6',
        padding: '0.125rem 0.375rem',
        borderRadius: '0.25rem',
        fontSize: '0.875rem'
      }}>
        {symbol}
      </span>
    );
  };
  
  // Format prices with color coding
  const formatPrice = (price: number | string, change?: number) => {
    const color = change ? (change > 0 ? '#10b981' : change < 0 ? '#ef4444' : '#6b7280') : '#000000';
    
    return (
      <span style={{ color, fontWeight: '600' }}>
        ${typeof price === 'number' ? price.toFixed(2) : price}
      </span>
    );
  };
  
  // Render portfolio diversification template
  const renderPortfolioDiversification = () => {
    const { sectors, recommendations } = data;
    
    return (
      <div>
        {/* Current portfolio allocation */}
        {sectors && sectors.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Current Allocation
            </h3>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              {sectors.map((sector: any, index: number) => (
                <div key={index} style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span>{sector.name}</span>
                  <span style={{ fontWeight: '600' }}>{sector.percentage}%</span>
                </div>
              ))}
            </div>
            
            {/* Visual representation */}
            <div style={{ 
              display: 'flex',
              height: '1.5rem',
              width: '100%',
              borderRadius: '0.25rem',
              overflow: 'hidden'
            }}>
              {sectors.map((sector: any, index: number) => (
                <div 
                  key={index} 
                  style={{
                    width: `${sector.percentage}%`,
                    backgroundColor: sector.color || getColorForIndex(index),
                    position: 'relative'
                  }}
                  title={`${sector.name}: ${sector.percentage}%`}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Recommended Changes
            </h3>
            <ul style={{ 
              padding: 0,
              margin: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}>
              {recommendations.map((rec: any, index: number) => (
                <li key={index} style={{
                  padding: '0.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                  borderLeft: '3px solid',
                  borderLeftColor: rec.type === 'increase' ? '#10b981' : 
                                   rec.type === 'decrease' ? '#f59e0b' : 
                                   rec.type === 'add' ? '#3b82f6' : '#6b7280'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {rec.type === 'increase' && 'Increase allocation:'}
                    {rec.type === 'decrease' && 'Decrease allocation:'}
                    {rec.type === 'add' && 'Add new position:'}
                    {rec.type === 'remove' && 'Remove position:'}
                  </div>
                  <div style={{ fontSize: '0.875rem' }}>
                    {rec.description}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  // Render stock comparison template
  const renderStockComparison = () => {
    const { stocks, metrics } = data;
    
    return (
      <div>
        {/* Stocks comparison table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '0.875rem'
          }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
                  Stock
                </th>
                {metrics.map((metric: any, index: number) => (
                  <th key={index} style={{ 
                    textAlign: 'right', 
                    padding: '0.5rem', 
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    {metric.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock: any, index: number) => (
                <tr key={index}>
                  <td style={{ 
                    padding: '0.5rem', 
                    borderBottom: '1px solid #e5e7eb',
                    fontWeight: '600'
                  }}>
                    {formatSymbol(stock.symbol)}
                  </td>
                  {metrics.map((metric: any, idx: number) => (
                    <td key={idx} style={{ 
                      textAlign: 'right', 
                      padding: '0.5rem', 
                      borderBottom: '1px solid #e5e7eb' 
                    }}>
                      {metric.type === 'percentage' ? 
                        formatPercentage(stock[metric.key]) : 
                        metric.type === 'price' ? 
                          formatPrice(stock[metric.key]) : 
                          stock[metric.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render market overview template
  const renderMarketOverview = () => {
    const { indices, topGainers, topLosers, marketSummary } = data;
    
    return (
      <div>
        {/* Market indices */}
        {indices && indices.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Major Indices
            </h3>
            <div style={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {indices.map((index: any, i: number) => (
                <div key={i} style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb',
                  minWidth: '120px'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {index.name}
                  </div>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.875rem'
                  }}>
                    <span>{formatPrice(index.price)}</span>
                    <span>{formatPercentage(index.change)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Market movers */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          {/* Top gainers */}
          {topGainers && topGainers.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Top Gainers
              </h3>
              <ul style={{ 
                padding: 0,
                margin: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                {topGainers.map((stock: any, i: number) => (
                  <li key={i} style={{
                    padding: '0.375rem 0.5rem',
                    backgroundColor: '#f0fff4',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{formatSymbol(stock.symbol)}</span>
                    <span style={{ display: 'flex', gap: '0.5rem' }}>
                      <span>{formatPrice(stock.price)}</span>
                      <span>{formatPercentage(stock.change)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Top losers */}
          {topLosers && topLosers.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Top Losers
              </h3>
              <ul style={{ 
                padding: 0,
                margin: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                {topLosers.map((stock: any, i: number) => (
                  <li key={i} style={{
                    padding: '0.375rem 0.5rem',
                    backgroundColor: '#fff5f5',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{formatSymbol(stock.symbol)}</span>
                    <span style={{ display: 'flex', gap: '0.5rem' }}>
                      <span>{formatPrice(stock.price)}</span>
                      <span>{formatPercentage(stock.change)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Market summary */}
        {marketSummary && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Market Summary
            </h3>
            <p style={{ margin: 0, lineHeight: '1.5' }}>
              {marketSummary}
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Render technical analysis template
  const renderTechnicalAnalysis = () => {
    const { symbol, indicators, recommendation, price, priceData } = data;
    
    return (
      <div>
        {/* Stock info header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          padding: '0.75rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.375rem',
          border: '1px solid #e5e7eb'
        }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              {formatSymbol(symbol)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Technical Analysis
            </div>
          </div>
          
          {price && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {formatPrice(price.current)}
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {formatPercentage(price.change)}
              </div>
            </div>
          )}
        </div>
        
        {/* Technical indicators */}
        {indicators && indicators.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              Technical Indicators
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.75rem'
            }}>
              {indicators.map((indicator: any, i: number) => (
                <div key={i} style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '0.375rem',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    {indicator.name}
                  </div>
                  <div style={{ 
                    fontWeight: '600',
                    color: indicator.signal === 'buy' ? '#10b981' : 
                           indicator.signal === 'sell' ? '#ef4444' : '#6b7280'
                  }}>
                    {indicator.value}
                    {indicator.signal && (
                      <span style={{ 
                        fontSize: '0.75rem',
                        marginLeft: '0.5rem',
                        padding: '0.125rem 0.25rem',
                        backgroundColor: indicator.signal === 'buy' ? '#d1fae5' : 
                                        indicator.signal === 'sell' ? '#fee2e2' : '#f3f4f6',
                        borderRadius: '0.25rem'
                      }}>
                        {indicator.signal.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Trading recommendation */}
        {recommendation && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: recommendation.action === 'buy' ? '#f0fff4' : 
                            recommendation.action === 'sell' ? '#fff5f5' : '#f9fafb',
            borderRadius: '0.375rem',
            border: '1px solid',
            borderColor: recommendation.action === 'buy' ? '#10b981' : 
                         recommendation.action === 'sell' ? '#ef4444' : '#e5e7eb'
          }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              marginBottom: '0.5rem',
              color: recommendation.action === 'buy' ? '#047857' : 
                    recommendation.action === 'sell' ? '#b91c1c' : '#1f2937'
            }}>
              {recommendation.action === 'buy' ? 'Buy ' : 
              recommendation.action === 'sell' ? 'Sell ' : 
              recommendation.action === 'hold' ? 'Hold ' : ''}
              Recommendation
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5' }}>
              {recommendation.reason}
            </p>
          </div>
        )}
      </div>
    );
  };
  
  // Helper function to get color based on index
  const getColorForIndex = (index: number) => {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
      '#ec4899', '#06b6d4', '#f97316', '#a855f7'
    ];
    return colors[index % colors.length];
  };
  
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      border: '2px solid black',
      boxShadow: '4px 4px 0 0 rgba(0,0,0,1)',
      padding: '1rem',
      width: '100%'
    }}>
      <h2 style={{ 
        fontSize: '1.25rem', 
        fontWeight: '700',
        marginTop: 0,
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {title}
      </h2>
      
      {/* Render the appropriate template based on type */}
      {type === 'portfolio_diversification' && renderPortfolioDiversification()}
      {type === 'stock_comparison' && renderStockComparison()}
      {type === 'market_overview' && renderMarketOverview()}
      {type === 'technical_analysis' && renderTechnicalAnalysis()}
    </div>
  );
};

export default AnalysisTemplate; 