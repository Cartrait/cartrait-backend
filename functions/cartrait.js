
// functions/cartrait.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const reg = event.queryStringParameters?.reg;
  if (!reg) {
    return { statusCode: 400, body: 'Missing registration parameter' };
  }

  // 1) Call Vehicle Data Global
  const vdgRes = await fetch(
    `https://api.vehicledataglobal.com/vehicle?reg=${encodeURIComponent(reg)}`,
    { headers: { 'x-api-key': process.env.VDG_KEY } }
  );
  if (!vdgRes.ok) {
    return { statusCode: vdgRes.status, body: await vdgRes.text() };
  }
  const { make, model, year, colour, accent } = await vdgRes.json();

  // 2) Build simple SVG options (swap in custom templates later)
  const baseSVG = `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="200" height="100" fill="${colour}" rx="10"/>
    <text x="100" y="55" font-size="20" text-anchor="middle" fill="${accent}">${make}</text>
  </svg>`;

  const options = ['lined','filled','outline'].map(style => ({
    style,
    svg: baseSVG.replace(
      /<rect/,
      `<rect stroke="${accent}" stroke-width="${style==='lined'?4:0}" `
    )
  }));

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ make, model, year, colour, accent, options })
  };
};