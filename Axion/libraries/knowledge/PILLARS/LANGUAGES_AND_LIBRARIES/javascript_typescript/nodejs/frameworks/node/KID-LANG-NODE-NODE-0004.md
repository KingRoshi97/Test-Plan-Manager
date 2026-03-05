---
kid: "KID-LANG-NODE-NODE-0004"
title: "Error Handling + Logging Pattern (Node)"
type: pattern
pillar: LANGUAGES_AND_LIBRARIES
domains: [javascript_typescript, nodejs]
subdomains: []
tags: [node, error-handling, logging]
maturity: "reviewed"
use_policy: pattern_only
executor_access: internal_and_external
license: internal_owned
allowed_excerpt:
  max_words: 0
  max_lines: 0
created_at: "2025-01-01"
updated_at: "2025-01-01"
owner: axion
---

# Error Handling + Logging Pattern (Node)

```markdown
# Error Handling + Logging Pattern (Node)

## Summary
Error handling and logging are critical for building robust and maintainable Node.js applications. This pattern ensures that errors are properly captured, logged, and handled in a way that provides actionable insights while maintaining application stability. By combining structured logging with centralized error handling, developers can debug issues efficiently and improve system reliability.

## When to Use
- When building production-grade Node.js applications that require robust error tracking and debugging.
- When you need to log errors and application events for monitoring and auditing purposes.
- When you want to implement a consistent error-handling mechanism across your application.
- In applications where you need to integrate with external logging systems (e.g., ELK stack, Datadog) or error tracking tools (e.g., Sentry).

## Do / Don't
### Do:
1. **Use structured logging**: Log errors and events in a structured JSON format to make them machine-readable and searchable.
2. **Centralize error handling**: Use middleware or utility functions to handle errors consistently across the application.
3. **Log context information**: Include request details, user information, and stack traces in logs for better debugging.
4. **Use standard error objects**: Extend the `Error` class to create custom error types with additional metadata.
5. **Integrate with monitoring tools**: Send logs and errors to external monitoring systems for real-time tracking.

### Don't:
1. **Don't log sensitive data**: Avoid logging passwords, tokens, or personally identifiable information (PII).
2. **Don't swallow errors**: Always log and handle errors; never silently ignore them.
3. **Don't log in production without rate limiting**: Excessive logging can overwhelm the system and increase costs.
4. **Don't mix logging levels**: Use appropriate log levels (`info`, `warn`, `error`, etc.) to differentiate between log types.
5. **Don't hardcode log destinations**: Use environment variables or configuration files to define log outputs.

## Core Content
### Problem
Node.js applications often encounter runtime errors due to asynchronous operations, external API failures, or invalid user input. Without proper error handling and logging, these issues can lead to application crashes, poor user experience, and difficulty in debugging.

### Solution
This pattern combines centralized error handling with structured logging to capture, log, and respond to errors effectively. The approach involves the following steps:

1. **Set Up a Logging Library**
   Use a library like `winston` or `pino` for structured logging. These libraries support JSON log formatting, log levels, and integration with external systems.
   ```javascript
   const winston = require('winston');

   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.json(),
     transports: [
       new winston.transports.Console(),
       new winston.transports.File({ filename: 'error.log', level: 'error' }),
     ],
   });

   module.exports = logger;
   ```

2. **Create a Custom Error Class**
   Extend the `Error` class to add metadata and differentiate between error types.
   ```javascript
   class AppError extends Error {
     constructor(message, statusCode) {
       super(message);
       this.statusCode = statusCode;
       this.isOperational = true; // To distinguish operational errors
       Error.captureStackTrace(this, this.constructor);
     }
   }

   module.exports = AppError;
   ```

3. **Implement Centralized Error Handling Middleware**
   Use Express middleware to catch and handle errors uniformly.
   ```javascript
   const errorHandler = (err, req, res, next) => {
     const { statusCode = 500, message, stack } = err;

     // Log the error
     logger.error({
       message,
       stack,
       path: req.path,
       method: req.method,
       user: req.user?.id || 'anonymous',
     });

     // Respond to the client
     res.status(statusCode).json({
       status: 'error',
       message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : message,
     });
   };

   module.exports = errorHandler;
   ```

4. **Use a Global Error Boundary**
   Catch unhandled exceptions and promise rejections to prevent application crashes.
   ```javascript
   process.on('uncaughtException', (err) => {
     logger.error({ message: 'Uncaught Exception', stack: err.stack });
     process.exit(1); // Exit with failure
   });

   process.on('unhandledRejection', (reason) => {
     logger.error({ message: 'Unhandled Rejection', reason });
   });
   ```

5. **Integrate with External Tools**
   Send logs and error data to external services like Sentry or Datadog for real-time monitoring.
   ```javascript
   const Sentry = require('@sentry/node');
   Sentry.init({ dsn: process.env.SENTRY_DSN });

   app.use(Sentry.Handlers.errorHandler());
   ```

### Tradeoffs
- **Pros**: Improves debugging, enhances system reliability, and integrates well with monitoring tools.
- **Cons**: Adds complexity to the codebase and may incur additional costs for external logging services.

### Example Usage
```javascript
const express = require('express');
const logger = require('./logger');
const AppError = require('./AppError');
const errorHandler = require('./errorHandler');

const app = express();

app.get('/example', (req, res, next) => {
  try {
    throw new AppError('Example error', 400);
  } catch (err) {
    next(err);
  }
});

app.use(errorHandler);

app.listen(3000, () => logger.info('Server running on port 3000'));
```

## Links
- **Express Error Handling**: Official Express documentation on error handling middleware.
- **Winston Logging Library**: Documentation for the `winston` logging library.
- **Sentry for Node.js**: Guide to integrating Sentry for error tracking in Node.js applications.
- **Best Practices for Node.js Error Handling**: Industry-recommended practices for error handling in Node.js.

## Proof / Confidence
This pattern is based on widely adopted industry practices, including recommendations from the official Node.js documentation and tools like `winston` and `Sentry`. Structured logging and centralized error handling are standard practices in modern software engineering, supported by benchmarks from monitoring platforms like Datadog and New Relic.
```
