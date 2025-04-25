// functions/cartrait.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1) grab the incoming reg parameter
  const params = event.queryStringParameters || {};
  const reg    = (params.registration || params.reg || '').trim().toUpperCase();
  if (!reg) {
    return {
      statusCode: 400,
      body: 'Missing registration parameter'
    };
  }

  // 2) build the VDG lookup URL
  const BASE_URL      = process.env.VDG_BASE_URL      || 'https://uk.api.vehicledataglobal.com';
  const PACKAGE_NAME  = process.env.VDG_PACKAGE_NAME  || 'VehicleDetailsWithImage';
  const API_KEY       = process.env.VDG_KEY           /* or VDG_API_KEY if you renamed your env var */;

  const url = new URL(`${BASE_URL}/r2/lookup`);
  url.searchParams.set('packagename', PACKAGE_NAME);
  url.searchParams.set('apikey',      API_KEY);
  url.searchParams.set('vrm',         reg);

  console.log('VDG lookup URL:', url.toString());

  // 3) fetch and return
  try {
    const res = await fetch(url);
    const txt = await res.text();
    if (!res.ok) {
      return {
        statusCode: res.status,
        body: `API error: ${txt}`
      };
    }
    // success!
    return {
      statusCode: 200,
      body: txt  // already JSON
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: `Lookup failed: ${err.message}`
    };
  }
};