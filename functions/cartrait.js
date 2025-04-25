// functions/cartrait.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1. get the reg from either ?registration= or ?reg=
  const params = event.queryStringParameters || {};
  const reg = (params.registration || params.reg || '').trim().toUpperCase();
  if (!reg) {
    return {
      statusCode: 400,
      body: 'Missing registration parameter'
    };
  }

  // 2. build lookup URL
  const baseUrl      = process.env.VDG_BASE_URL;       // e.g. https://uk.api.vehicledataglobal.com
  const pkgName      = process.env.VDG_PACKAGE_NAME;   // e.g. VehicleDetailsWithImage
  const apiKey       = process.env.VDG_KEY;            // your VDG key
  const accountId    = process.env.VDG_ACCOUNT_ID;     // your account id

  const url = new URL(`${baseUrl}/r2/lookup`);
  url.searchParams.set('packageName', pkgName);
  url.searchParams.set('searchType',  'Reg');
  url.searchParams.set('searchTerm',  reg);
  url.searchParams.set('apiKey',      apiKey);
  url.searchParams.set('accountId',   accountId);

  // 3. fetch from VDG
  let data;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errTxt = await res.text();
      return { statusCode: res.status, body: `API error: ${errTxt}` };
    }
    data = await res.json();
  } catch (err) {
    return { statusCode: 502, body: `Lookup failed: ${err.message}` };
  }

  // 4. return raw JSON (you can swap this out for your art-generation later)
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  };
};