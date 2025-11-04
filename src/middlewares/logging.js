export const requestLogger = (req, res, next) => {
  let payload = { ...req.body };
  if (payload.password) payload.password = "[ESCONDIDO]";
  res.on("finish", () => {
    console.log(`\n>> New Log: {\n
      dateTime: ${new Date().toISOString()}\n
      ip: ${req.ip}\n
      method: ${req.method}\n
      originalUrl: ${req.originalUrl}\n
      statusCode: ${res.statusCode}\n
      payload: ${JSON.stringify(payload)}\n
  }`);
  });
  next();
};
