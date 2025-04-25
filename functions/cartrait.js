// functions/cartrait.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1) Pull the incoming VRM from either ?registration= or ?reg=
  const params = event.queryStringParameters || {};
  const raw    = (params.registration || params.reg || '').trim();
  if (!raw) {
    return {
      statusCode: 400,
      body: 'Missing registration parameter'
    };
  }
  const vrm = raw.toUpperCase();

  // 2) Read your Netlify env-vars (set these in your Site settings → Build & deploy → Environment)
  const BASE_URL     = process.env.VDG_BASE_URL       || 'https://uk.api.vehicledataglobal.com';
  const API_KEY      = process.env.VDG_KEY            || '';
  const PACKAGE_NAME = process.env.VDG_PACKAGE_NAME   || 'VehicleDetailsWithImage';

  // 3) Build the lookup URL exactly as the Quick Lookup UI does
  const url = new URL(`${BASE_URL}/r2/lookup`);
  url.searchParams.set('packagename', PACKAGE_NAME);
  url.searchParams.set('apikey',      API_KEY);
  url.searchParams.set('vrm',         vrm);

  console.log('VDG lookup URL:', url.toString());

  // 4) Perform the request and proxy the response back to the browser
  try {
    const res = await fetch(url);
    const txt = await res.text();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: `API error: ${txt}`
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: txt
    };
  } catch (err) {
    return {
      statusCode: 502,
      body: `Lookup failed: ${err.message}`
    };
  }
};
