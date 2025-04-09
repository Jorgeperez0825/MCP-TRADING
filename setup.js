import('mcp-api-connect').then(async (mcpApiConnect) => {
    const config = {
        name: "sportsdata-mlb",
        baseUrl: "https://api.sportsdata.io/v3/mlb",
        apiKey: "7803d3473cad41fc9170267735a22838",
        apiKeyHeader: "Ocp-Apim-Subscription-Key"
    };

    try {
        await mcpApiConnect.setup(config);
        console.log('API connection configured successfully!');
    } catch (error) {
        console.error('Error configuring API connection:', error);
    }
}).catch(error => {
    console.error('Error loading module:', error);
}); 