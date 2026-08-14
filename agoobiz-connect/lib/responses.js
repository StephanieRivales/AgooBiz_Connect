// Small helpers so every route sends back consistent, friendly responses
// instead of each file inventing its own error format.

function ok(res, data, status = 200) {
  return res.status(status).json(data);
}

function fail(res, status, friendlyMessage, err = null) {
  return res.status(status).json({
    message: friendlyMessage,
    // Only include raw error details in dev — hide internals from real users
    ...(process.env.NODE_ENV !== "production" && err ? { error: err.message } : {}),
  });
}

module.exports = { ok, fail };