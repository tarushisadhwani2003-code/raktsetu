import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const DUPLICATE_MESSAGES = {
  email: 'An account with this email already exists.',
  phone: 'An account with this mobile number already exists.',
};

function fieldErrorsFromZod(error) {
  const errors = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function notFound(req, _res, next) {
  next(ApiError.notFound(`No API route for ${req.method} ${req.originalUrl}`));
}

// Express recognises error handlers by their four arguments.
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ message: 'Please check the highlighted fields.', errors: fieldErrorsFromZod(err) });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message, ...(err.errors && { errors: err.errors }) });
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0];
    const message = DUPLICATE_MESSAGES[field] || 'This record already exists.';
    return res.status(409).json({ message, ...(field && { errors: { [field]: message } }) });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id.' });
  }

  if (err?.name === 'ValidationError') {
    const errors = Object.fromEntries(Object.entries(err.errors).map(([key, value]) => [key, value.message]));
    return res.status(400).json({ message: 'Please check the highlighted fields.', errors });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'The request body is not valid JSON.' });
  }

  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ message: 'The request is too large.' });
  }

  console.error(err);
  res.status(500).json({
    message: 'Something went wrong on our side. Please try again.',
    ...(!env.isProd && { detail: err?.message }),
  });
}
