const fetch = require('node-fetch')

exports.handler = async (event) => {
  // 1) Grab the reg parameter (either “registration” or “reg”)
  const params = event.queryStringParameters || {}
  const reg    = (params.registration || params.reg || '').trim().toUpperCase()
  if (!reg) {
    return { statusCode: 400, body: 'Missing registration parameter' }
  }

  // 2) Build your lookup URL via Quick Lookup
  const base    = process.env.VDG_BASE_URL        // e.g. "https://uk.api.vehicledataglobal.com"
  const pkgName = process.env.VDG_PACKAGE_NAME    // e.g. "VehicleDetailsWithImage"
  const apiKey  = process.env.VDG_KEY             // your sandbox API key
  const url     = new URL(`${base}/r2/lookup`)

  url.searchParams.set('packagename', pkgName)
  url.searchParams.set('apikey',       apiKey)
  url.searchParams.set('vrm',          reg)

  console.log('VDG lookup URL:', url.toString())

  // 3) Fetch from VDGL and handle errors
  let data
  try {
    const res = await fetch(url)
    if (!res.ok) {
      const txt = await res.text()
      return { statusCode: res.status, body: `API error: ${txt}` }
    }
    data = await res.json()
  } catch (err) {
    return { statusCode: 502, body: `Lookup failed: ${err.message}` }
  }

  // 4) Return JSON straight back to the browser
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body:     JSON.stringify(data),
  }
}