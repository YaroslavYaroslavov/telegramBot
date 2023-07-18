const rateLimit = require("../../node_modules/telegraf-ratelimit");

const limitConfig = {
  window: 1500,
  limit: 1,
  onLimitExceeded: (ctx, next) => ctx.reply("Буп-бип. Я не могу так часто."),
};

const rateLimitMiddleware = rateLimit(limitConfig);

module.exports = rateLimitMiddleware;
