export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found.`,
    },
  });
}

export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode || 500;
  const code = err.code || (status === 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR');
  const isProd = process.env.NODE_ENV === 'production';

  res.status(status).json({
    ok: false,
    error: {
      code,
      message: status === 500 && isProd ? 'An unexpected server error occurred.' : err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  });
}
