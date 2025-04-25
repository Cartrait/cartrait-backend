// functions/cartrait.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Always allow CORS from anywhere
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  // 1) Grab the incoming reg param
  const params = event.queryStringParameters || {};
  const reg    = params.registration || params.reg;
  if (!reg) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing registration parameter' })
    };
  }

  // 2) Build the VehicleDataGlobal lookup URL
  const pkg     = process.env.VDG_PACKAGE_NAME; // e.g. "VehicleDetailsWithImage"
  const baseUrl = process.env.VDG_BASE_URL;     // e.g. "https://uk.api.vehicledataglobal.com"
  const key     = process.env.VDG_API_KEY;      // your sandbox/live API key

  const url = new URL(`${baseUrl}/r2/lookup`);
  url.searchParams.set('packageName', pkg);
  url.searchParams.set('searchType',    'VRM');
  url.searchParams.set('searchTerm',    reg.toUpperCase());
  url.searchParams.set('apiKey',        key);

  // 3) Fetch and handle errors
  let json;
  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      const txt = await res.text();
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: `API error: ${txt}` })
      };
    }
    json = await res.json();
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: `Lookup failed: ${err.message}` })
    };
  }

  // 4) Pull out the BodyDetails array (or fallback to empty)
  const options = Array.isArray(json.BodyDetails) ? json.BodyDetails : [];
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ options })
  };
};