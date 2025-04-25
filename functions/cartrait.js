
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1) grab the reg
  const params = event.queryStringParameters || {};
  const reg    = (params.registration || params.reg || '').trim().toUpperCase();
  if (!reg) {
    return { statusCode: 400, body: 'Missing registration parameter' };
  }

  // 2) read your env-vars
  const pkg       = process.env.VDG_PACKAGE_NAME;  // e.g. "VehicleDetailsWithImage"
  const baseUrl   = process.env.VDG_BASE_URL;      // e.g. "https://uk.api.vehicledataglobal.com"
  const apiKey    = process.env.VDG_KEY;           // your trial API key
  const accountId = process.env.VDG_ACCOUNT_ID;    // your trial account ID

  // 3) build the lookup URL
  const url = new URL(`${baseUrl}/r2/lookup`);
  url.searchParams.set('packageName', pkg);
  url.searchParams.set('searchType',  'Reg');
  url.searchParams.set('searchTerm',  reg);

  let data;
  try {
    const res = await fetch(url, {
      headers: {
        // if your account uses a header key rather than query-param, use this:
        'Ocp-Apim-Subscription-Key': apiKey
        // otherwise some endpoints want it as ?apiKey=xxx:
        // 'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, body: `API error: ${txt}` };
    }
    data = await res.json();
  } catch (err) {
    return { statusCode: 502, body: `Lookup failed: ${err.message}` };
  }

  // 4) return whatever you want here
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};