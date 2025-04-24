const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1️⃣ Grab the reg parameter (either “registration” or “reg”)
  const params = event.queryStringParameters || {};
  const reg    = params.registration || params.reg;
  if (!reg) {
    return {
      statusCode: 400,
      body: 'Missing registration parameter'
    };
  }

  // 2️⃣ Build your lookup URL
  const url = new URL('https://uk.api.vehicledataglobal.com/r2/lookup');
  url.searchParams.set('apiKey',     process.env.VDG_KEY);
  url.searchParams.set('accountId',  process.env.VDG_ACCOUNT_ID);
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
    return {
      statusCode: 502,
      body: `Lookup failed: ${err.message}`
    };
  }

  // 3️⃣ Extract fields and build your SVGs
  const details = data.VehicleDetailsWithImage;
  const { make, model, year, colour, accent } = details;
  const baseSVG = `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="100" fill="${colour}" rx="10"/>
    <text x="100" y="55" text-anchor="middle" fill="${accent}">${make}</text>
  </svg>`;

  const options = ['lined','filled','outline'].map(style => ({
    style,
    svg: baseSVG.replace(
      /<rect/,
      `<rect stroke="${accent}" stroke-width="${style==='lined'?4:0}" `
    )
  }));

  // 4️⃣ Return the JSON
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ make, model, year, colour, accent, options })
  };
};  // ← Thi