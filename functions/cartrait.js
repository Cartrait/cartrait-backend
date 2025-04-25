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

  const pkg = 'VehicleDetailsWithImage';                         // ← your data package name
const url = new URL('https://uk.api.vehicledataglobal.com/r2/lookup');
url.searchParams.set('packageName', encodeURIComponent(pkg));  // ← must match “Select a Data Package”
url.searchParams.set('searchType',   'Reg');                   // ← fixed “Reg” lookup
url.searchParams.set('searchTerm',   encodeURIComponent(reg)); // ← the user’s reg
  + // 2 Build your lookup URL with packageName, searchType and searchTerm
  + const pkg = 'VehicleDetailsWithImage';
  + const url = new URL('https://uk.api.vehicledataglobal.com/r2/lookup');
  + url.searchParams.set('packageName', encodeURIComponent(pkg));
  + url.searchParams.set('searchType',  'Reg');
  + url.searchParams.set('searchTerm',  encodeURIComponent(reg));

  let data;
try {
  const res = await fetch(url, {
    headers: {
      // use whatever name you chose for your env‐var
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