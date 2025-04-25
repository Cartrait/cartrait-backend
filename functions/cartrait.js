

// 1. pull in your env-vars at the top
const API_KEY     = process.env.VDG_KEY;
const ACCOUNT_ID  = process.env.VDG_ACCOUNT_ID;
const BASE_URL    = process.env.VDG_BASE_URL || 'https://uk.api.vehicledataglobal.com';

// …

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const reg = (params.registration || params.reg || '').trim().toUpperCase();
  if (!reg) {
    return { statusCode: 400, body: 'Missing registration parameter' };
  }

  // 2. build your lookup URL with *all three* required params
  const url = new URL(`${BASE_URL}/r2/lookup`);
  url.searchParams.set('apiKey',    API_KEY);
  url.searchParams.set('accountId', ACCOUNT_ID);
  url.searchParams.set('registration', reg);

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

  // …rest of your SVG-building logic…
};
  // 4. pluck out what we need and return JSON
  const r = (data.results && data.results[0]) || {};
  const out = {
    make:   r.Make,
    model:  r.Model,
    colour: r.Colour,
    year:   r.YearOfManufacture,
    image:  r.ThumbnailUrl
  };
  return {
    statusCode: 200,
    body: JSON.stringify(out)
  };
};