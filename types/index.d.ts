interface RuleConfig {
  severity: 'error' | 'warning';
  options: *;
}

type RuleHandler = (ast: HTMLMarkup, path: HTMLAnyToken, config: RuleConfig) => HTMLMarkup;
