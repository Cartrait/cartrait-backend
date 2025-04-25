// functions/cartrait.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1. grab the reg parameter
  const params = event.queryStringParameters || {};
  const reg = (params.registration || params.reg || '').trim().toUpperCase();
  if (!reg) {
    return {
      statusCode: 400,
      body: 'Missing registration parameter'
    };
  }

  // 2. build your lookup URL
  //    Make sure VDG_BASE_URL is set to e.g. "https://uk.api.vehicledataglobal.com"
  const url = new URL(`${process.env.VDG_BASE_URL}/r2/lookup`);
  url.searchParams.set('apiKey',      process.env.VDG_KEY);
  url.searchParams.set('accountId',   process.env.VDG_ACCOUNT_ID);
  url.searchParams.set('packageName', process.env.VDG_PACKAGE_NAME);
  url.searchParams.set('searchType',  'Reg');
  url.searchParams.set('searchTerm',  reg);

// …after you build the URL…
console.log('VDG lookup URL:', url.toString());
console.log('Env vars:', {
  key: process.env.VDG_KEY,
  account: process.env.VDG_ACCOUNT_ID,
  pkg: process.env.VDG_PACKAGE_NAME,
  base: process.env.VDG_BASE_URL
});

  // 3. call the API
  let data;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, body: `API error: ${txt}` };
    }
    data = await res.json();
  } catch (err) {
    return {
      statusCode: 502,
      body: `Lookup failed: ${err.message}`
    };
  }

  // 4. return the raw JSON (you can massage it into SVG later)
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};