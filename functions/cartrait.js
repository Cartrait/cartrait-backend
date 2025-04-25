// functions/cartrait.js
const fetch = require('node-fetch');

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const reg    = (params.registration || params.reg || '').trim().toUpperCase();
  if (!reg) {
    return { statusCode: 400, body: 'Missing registration parameter' };
  }

  // use the one your trial supports:
  const pkg     = 'QuickLookup';                   
  const baseUrl = process.env.VDG_BASE_URL;       // e.g. "https://uk.api.vehicledataglobal.com"
  const url     = new URL(`${baseUrl}/r2/lookup`);

  url.searchParams.set('apiKey',      process.env.VDG_KEY);
  url.searchParams.set('accountId',   process.env.VDG_ACCOUNT_ID);
  url.searchParams.set('packageName', pkg);
  url.searchParams.set('searchType',  'Reg');
  url.searchParams.set('searchTerm',  reg);

  console.log('VDG lookup URL:', url.toString());

  let data;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, body: `API error: ${txt}` };
    }
    data = await res.json();
  } catch (err) {
    return { statusCode: 502, body: `Lookup failed: ${err.message}` };
  }

  return {
    statusCode: 200,
    body:       JSON.stringify(data)
  };
};