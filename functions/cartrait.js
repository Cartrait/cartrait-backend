
const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1. grab the plate
  const params  = event.queryStringParameters || {};
  const plate   = params.registration || params.reg;
  if (!plate) {
    return { statusCode: 400, body: 'Missing registration parameter' };
  }

  // 2. build the lookup URL
  const pkg = 'VehicleDetailsWithImage';
  const url = new URL('https://uk.api.vehicledataglobal.com/r2/lookup');
  url.searchParams.set('packageName', pkg);
  url.searchParams.set('searchType',    'Reg');
  url.searchParams.set('searchTerm',    plate);

  // 3. call the API
  let data;
  try {
    const res = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.VDG_KEY
      }
    });
    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: res.status, body: `API error: ${txt}` };
    }
    data = await res.json();
  } catch (err) {
    return { statusCode: 502, body: `Lookup failed: ${err.message}` };
  }

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