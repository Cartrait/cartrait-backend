const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1. Pull the registration parameter
  const qs    = event.queryStringParameters || {};
  const vrm   = qs.registration || qs.reg;
  if (!vrm) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Missing registration parameter'
    };
  }

  // 2. Build the external lookup URL
  const baseUrl   = process.env.VDG_BASE_URL;        // e.g. "https://uk.api.vehicledataglobal.com"
  const apiKey    = process.env.VDG_KEY;             // your VDG API key
  const accountId = process.env.VDG_ACCOUNT_ID;      // your VDG account ID
  const pkg       = process.env.VDG_PACKAGE_NAME;    // e.g. "VehicleDetailsWithImage"

  const url = new URL(`${baseUrl}/r2/lookup`);
  url.searchParams.set('packageName', encodeURIComponent(pkg));
  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('accountId', accountId);
  url.searchParams.set('searchType', 'VRM');
  url.searchParams.set('searchTerm', vrm);

  try {
    const res = await fetch(url.toString());
    const text = await res.text();
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        },
        body: `API error: ${text}`
      };
    }

    // 3. Return the JSON directly
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: text
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: `Lookup failed: ${err.message}`
    };
  }
};