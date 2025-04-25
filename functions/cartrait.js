
// functions/cartrait.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const reg    = (params.registration || '').trim().toUpperCase();
  if (!reg) {
    return { statusCode: 400, body: 'Missing registration parameter' };
  }

  // build URL
  const baseUrl = process.env.VDG_BASE_URL;      // e.g. "https://uk.api.vehicledataglobal.com"
  const pkg     = process.env.VDG_PACKAGE_NAME;  // e.g. "VehicleDetailsWithImage"
  const url     = new URL(`${baseUrl}/r2/lookup`);

  url.searchParams.set('packageName', pkg);
  url.searchParams.set('registration', reg);
  url.searchParams.set('apiKey',       process.env.VDG_KEY);
  url.searchParams.set('accountId',    process.env.VDG_ACCOUNT_ID);

  // fetch
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
};