const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1) read ?registration=NY19ARZ
  const reg = (event.queryStringParameters||{}).registration || '';
  const vrm = reg.trim().toUpperCase();
  if (!vrm) {
    return {
      statusCode: 400,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing registration parameter' }),
    };
  }

  // 2) build upstream URL
  const pkg     = process.env.VDG_PACKAGE_NAME;
  const apiKey  = process.env.VDG_KEY;
  const baseUrl = process.env.VDG_BASE_URL || 'https://uk.api.vehicledataglobal.com';

  const url = new URL(`${baseUrl}/r2/lookup`);
  url.searchParams.set('packageName', pkg);
  url.searchParams.set('apiKey', apiKey);
  url.searchParams.set('vrm', vrm);

  let payload;
  try {
    const res = await fetch(url.toString());
    const txt = await res.text();
    if (!res.ok) {
      return {
        statusCode: res.status,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: txt || res.statusText }),
      };
    }
    payload = JSON.parse(txt);
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message }),
    };
  }

  // 3) return raw JSON to the browser
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(payload),
  };
};