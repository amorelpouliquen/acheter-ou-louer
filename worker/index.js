export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const assetUrl = new URL(request.url)

    if (url.pathname === '/form' || url.pathname.startsWith('/form/')) {
      assetUrl.pathname = url.pathname.slice('/form'.length) || '/'
    }

    return env.ASSETS.fetch(new Request(assetUrl, request))
  },
}
