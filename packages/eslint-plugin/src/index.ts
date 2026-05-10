import { RuleCreator } from '@typescript-eslint/utils/eslint-utils';
import { ALL_RULES } from '@eco-linter/core';
import type { EcoRule, RuleContext, Violation } from '@eco-linter/core';
import type { TSESLint } from '@typescript-eslint/utils';

const createRule = RuleCreator(
  ruleName => `https://github.com/eco-linter/eco-linter/blob/main/docs/rules/${ruleName.replace('eco/', '')}.md`,
);

type MessageIds = 'ecoViolation' | 'ecoViolationWithSuggestion';

function adaptEcoRule(ecoRule: EcoRule): TSESLint.RuleModule<MessageIds, []> {
  return createRule<[], MessageIds>({
    name: ecoRule.name,
    meta: {
      type: 'suggestion',
      docs: {
        description: `[eco-linter] ${ecoRule.pillar} efficiency rule (${ecoRule.energyImpact} impact)`,
      },
      messages: {
        ecoViolation: '{{message}}',
        ecoViolationWithSuggestion: '{{message}} → {{suggestion}}',
      },
      schema: [],
    },
    defaultOptions: [],
    create(eslintContext) {
      const violations: Violation[] = [];

      const ecoContext: RuleContext = {
        report(v) {
          violations.push({ ...v, ruleId: ecoRule.name });
          const messageId: MessageIds = v.suggestion ? 'ecoViolationWithSuggestion' : 'ecoViolation';
          eslintContext.report({
            loc: {
              start: { line: v.line, column: v.column },
              end: v.endLine != null && v.endColumn != null
                ? { line: v.endLine, column: v.endColumn }
                : { line: v.line, column: v.column },
            },
            messageId,
            data: {
              message: v.message,
              suggestion: v.suggestion ?? '',
            },
          });
        },
        getFilename: () => eslintContext.getFilename(),
        getSourceCode: () => eslintContext.getSourceCode().getText(),
        getProjectMeta: () => ({ sideEffects: undefined }),
      };

      return ecoRule.create(ecoContext) as ReturnType<TSESLint.RuleCreateFunction>;
    },
  });
}

// Build the ESLint plugin object
const rules = Object.fromEntries(
  ALL_RULES.map(rule => {
    const shortName = rule.name.replace('eco/', '');
    return [shortName, adaptEcoRule(rule)];
  }),
);

const recommended: TSESLint.FlatConfig.Config = {
  plugins: { eco: { rules } as unknown as TSESLint.FlatConfig.Plugin },
  rules: Object.fromEntries(
    ALL_RULES.map(rule => {
      const shortName = rule.name.replace('eco/', '');
      return [`eco/${shortName}`, rule.severity === 'error' ? 'error' : rule.severity === 'warn' ? 'warn' : 'off'];
    }),
  ),
};

const plugin = {
  meta: {
    name: '@eco-linter/eslint-plugin',
    version: '1.0.0',
  },
  rules,
  configs: {
    recommended,
  },
};

export default plugin;
export { rules };
