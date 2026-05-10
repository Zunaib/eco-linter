import type { AnalysisResult } from '../types.js';

export function sarifReport(result: AnalysisResult): string {
  const rules = result.files
    .flatMap(f => f.violations.map(v => v.ruleId))
    .filter((v, i, a) => a.indexOf(v) === i)
    .map(ruleId => ({
      id: ruleId,
      name: ruleId.replace('eco/', '').replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
      shortDescription: { text: ruleId },
      properties: { tags: ['eco-linter', 'sustainability'] },
    }));

  const results = result.files.flatMap(file =>
    file.violations.map(v => ({
      ruleId: v.ruleId,
      level: v.severity === 'error' ? 'error' : v.severity === 'warn' ? 'warning' : 'note',
      message: {
        text: v.suggestion ? `${v.message} ${v.suggestion}` : v.message,
      },
      locations: [
        {
          physicalLocation: {
            artifactLocation: { uri: file.filePath },
            region: {
              startLine: v.line,
              startColumn: v.column + 1,
              ...(v.endLine ? { endLine: v.endLine } : {}),
              ...(v.endColumn != null ? { endColumn: v.endColumn + 1 } : {}),
            },
          },
        },
      ],
    })),
  );

  const sarif = {
    $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
    version: '2.1.0',
    runs: [
      {
        tool: {
          driver: {
            name: 'eco-linter',
            version: '1.0.0',
            informationUri: 'https://github.com/eco-linter/eco-linter',
            rules,
          },
        },
        results,
        properties: {
          carbonScore: result.score.overall,
          grade: result.score.grade,
          estimatedCO2ePerBuild: result.score.estimatedCO2ePerBuild,
        },
      },
    ],
  };

  return JSON.stringify(sarif, null, 2);
}
