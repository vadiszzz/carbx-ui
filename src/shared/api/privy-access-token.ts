type AccessTokenResolver = () => Promise<string | null>

let resolveAccessToken: AccessTokenResolver | null = null

export function registerPrivyAccessTokenResolver(
  resolver: AccessTokenResolver | null
) {
  resolveAccessToken = resolver
}

export async function getPrivyAccessToken() {
  if (!resolveAccessToken) return null
  return resolveAccessToken()
}
