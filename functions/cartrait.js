const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 0) Always allow CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  // 1) Grab the registration (either "registration" or "reg")
  const params = event.queryStringParameters || {};
  const reg = params.registration || params.reg;
  if (!reg) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing registration parameter' })
    };
  }

  // 2) Build your lookup URL
  const pkg     = process.env.VDG_PACKAGE_NAME; // e.g. VehicleDetailsWithImage
  const baseUrl = process.env.VDG_BASE_URL;     // e.g. https://uk.api.vehicledataglobal.com
  const url = new URL(`${baseUrl}/r2/lookup`);
  url.searchParams.set('packageName', pkg);
  url.searchParams.set('searchType',    'VRM');
  url.searchParams.set('searchTerm',    reg);

  let data;
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.VDG_API_KEY
      }
    });
    if (!res.ok) {
      const txt = await res.text();
      return {
        statusCode: res.status,
        headers,
        body: JSON.stringify({ error: `API error: ${txt}` })
      };
    }
    data = await res.json();
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: `Lookup failed: ${err.message}` })
    };
  }

  // 3) Extract & return the array of options (body details)
  const options = data.BodyDetails || [];
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ options })
  };
};