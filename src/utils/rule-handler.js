/**
 * @param {RuleConfig} defaults
 * @param {RuleHandler} handler
 * @return {{
 *   config: function(RuleConfig): RuleConfig,
 *   handler: RuleHandler
 * }}
 */
function ruleHandler(defaults, handler) {
  return {
    config: (config) => Object.assign({}, defaults, config),
    handler,
  };
}

module.exports = ruleHandler;
