import type { AnalysisResult, Reporter } from '../types.js';
import { prettyReport } from './pretty.js';
import { jsonReport } from './json.js';
import { githubAnnotationsReport } from './github-annotations.js';
import { sarifReport } from './sarif.js';
import { markdownReport } from './markdown.js';
import { htmlReport } from './html.js';

export function formatReport(result: AnalysisResult, reporter: Reporter): string {
  switch (reporter) {
    case 'pretty': return prettyReport(result);
    case 'json': return jsonReport(result);
    case 'github-annotations': return githubAnnotationsReport(result);
    case 'sarif': return sarifReport(result);
    case 'markdown': return markdownReport(result);
    case 'html': return htmlReport(result);
  }
}

export { prettyReport, jsonReport, githubAnnotationsReport, sarifReport, markdownReport, htmlReport };
