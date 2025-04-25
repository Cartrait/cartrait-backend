// functions/cartrait.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // --- 1) pull the reg off the querystring ---
  const params = event.queryStringParameters || {};
  const reg    = (params.registration || params.reg || '').trim().toUpperCase();
  if (!reg) {
    return {
      statusCode: 400,
      body: 'Missing registration parameter'
    };
  }

  // --- 2) assemble your lookup URL ---
  const pkg     = process.env.VDG_PACKAGE_NAME;   // e.g. "VehicleDetailsWithImage"
  const baseUrl = process.env.VDG_BASE_URL;       // e.g. "https://uk.api.vehicledataglobal.com"
  const url     = new URL(`${baseUrl}/r2/lookup`);

  url.searchParams.set('apiKey',       process.env.VDG_KEY);
  url.searchParams.set('accountId',    process.env.VDG_ACCOUNT_ID);
  url.searchParams.set('packageName',  pkg);
  url.searchParams.set('searchType',   'Reg');
  url.searchParams.set('searchTerm',   reg);

  console.log('VDG lookup URL:', url.toString());
  console.log('Env vars:', {
    apiKey:    process.env.VDG_KEY,
    accountId: process.env.VDG_ACCOUNT_ID,
    package:   pkg,
    baseUrl:   baseUrl
  });

  // --- 3) call the VDG API ---
  let data;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      return {
        statusCode: res.status,
        body:       `API error: ${txt}`
      };
    }
    data = await res.json();
  } catch (err) {
    return {
      statusCode: 502,
      body:       `Lookup failed: ${err.message}`
    };
  }

  // --- 4) success! return whatever VDG sent back ---
  return {
    statusCode: 200,
    body:       JSON.stringify(data)
  };
};