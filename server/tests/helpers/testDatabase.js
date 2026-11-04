/** Integration fixtures replace data, so require a clearly named test database. */
export function assertTestDatabaseUri(uri) {
  const match = /^mongodb(?:\+srv)?:\/\/[^/?#]+\/([^/?#]+)(?:\?[^#]*)?$/.exec(uri || '');
  let database;
  try {
    database = match && decodeURIComponent(match[1]);
  } catch {
    // Invalid escape sequences must fail before a connection is opened.
  }
  if (!database || !/^[A-Za-z0-9_-]+_test$/.test(database)) {
    throw new Error('Integration tests replace data. MONGODB_URI_TEST must name a database ending in "_test".');
  }
  return uri;
}
