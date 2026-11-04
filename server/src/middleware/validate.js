/**
 * Validate and clean request input with Zod schemas.
 * The cleaned values are available as req.valid.body / req.valid.query / req.valid.params.
 * A ZodError is turned into a 400 response by the error handler.
 */
export const validate = (schemas) => (req, _res, next) => {
  const valid = {};
  for (const part of ['params', 'query', 'body']) {
    if (schemas[part]) valid[part] = schemas[part].parse(req[part] ?? {});
  }
  req.valid = valid;
  next();
};
