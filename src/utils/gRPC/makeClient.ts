function clientWrapper<T>(
  ClientConstractor: any,
  hostname: string,
  credentials?: null | { [index: string]: string },
  options?: null | { [index: string]: any }
): T | undefined {
  try {
    const client = new ClientConstractor(hostname, credentials, options)
    return client
  } catch (error) {
    console.error('Error happend when initial client', error)
  }
}

export default clientWrapper
