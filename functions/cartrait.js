const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1. Grab the registration (VRM) query-string parameter
  const params = event.queryStringParameters || {};
  const reg = params.registration || params.reg;
  if (!reg) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: 'Missing registration parameter',
    };
  }

  // 2. Build the external API URL
  //    uses these Netlify ENV vars:
  //      VDG_BASE_URL         e.g. "https://uk.api.vehicledataglobal.com"
  //      VDG_KEY              your API key
  //      VDG_ACCOUNT_ID       your account ID
  //      VDG_PACKAGE_NAME     e.g. "VehicleDetailsWithImage"
  const baseUrl    = process.env.VDG_BASE_URL;
  const apiKey     = process.env.VDG_KEY;
  const accountId  = process.env.VDG_ACCOUNT_ID;
  const pkg        = process.env.VDG_PACKAGE_NAME;

  const url = new URL(`${baseUrl}/r2/lookup`);
  url.searchParams.set('packageName', encodeURIComponent(pkg));
  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('accountId', accountId);
  url.searchParams.set('searchType', 'VRM');
  url.searchParams.set('searchTerm', reg);

  try {
    const res = await fetch(url.toString());
    const text = await res.text();
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        },
        body: `API error: ${text}`,
      };
    }

    // 3. Sit back and ship the JSON right through
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: `Lookup failed: ${err.message}`,
    };
  }
};