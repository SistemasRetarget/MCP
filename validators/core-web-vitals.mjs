/**
 * Validador Core Web Vitals para Node.js
 * Valida LCP, INP, CLS, TTFB, FCP usando PageSpeed Insights API
 */

export class CoreWebVitalsValidator {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
  }

  async validate(url, strategy = 'mobile') {
    try {
      const params = new URLSearchParams({
        url: url,
        strategy: strategy
      });

      if (this.apiKey) {
        params.append('key', this.apiKey);
      }

      const response = await fetch(`${this.baseUrl}?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'PageSpeed API error');
      }

      const metrics = this.extractMetrics(data);
      const passed = this.checkPassing(metrics);

      return {
        url,
        strategy,
        passed,
        overall_score: this.calculateScore(metrics),
        metrics,
        issues: this.getIssues(metrics),
        thresholds: this.getThresholds()
      };
    } catch (error) {
      return {
        url,
        error: error.message,
        passed: false,
        overall_score: 0
      };
    }
  }

  extractMetrics(data) {
    const lighthouseResult = data.lighthouseResult || {};
    const audits = lighthouseResult.audits || {};
    const categories = lighthouseResult.categories || {};

    return {
      lcp: this.getMetricValue(audits['largest-contentful-paint']),
      inp: this.getMetricValue(audits['interaction-to-next-paint']),
      cls: this.getMetricValue(audits['cumulative-layout-shift']),
      ttfb: this.getMetricValue(audits['total-blocking-time']),
      fcp: this.getMetricValue(audits['first-contentful-paint']),
      performance_score: categories['performance']?.score * 100 || 0
    };
  }

  getMetricValue(audit) {
    if (!audit) return { value: 0, status: 'fail' };
    
    const value = audit.numericValue || 0;
    const displayValue = audit.displayValue || '';
    
    let status = 'fail';
    if (audit.score === 1) status = 'good';
    else if (audit.score >= 0.5) status = 'needs-improvement';

    return { value, displayValue, status };
  }

  checkPassing(metrics) {
    return (
      metrics.lcp.value < 2500 &&
      metrics.inp.value < 200 &&
      metrics.cls.value < 0.1 &&
      metrics.ttfb.value < 600 &&
      metrics.fcp.value < 1800
    );
  }

  calculateScore(metrics) {
    let score = 0;
    if (metrics.lcp.value < 2500) score += 20;
    else if (metrics.lcp.value < 4000) score += 10;

    if (metrics.inp.value < 200) score += 20;
    else if (metrics.inp.value < 500) score += 10;

    if (metrics.cls.value < 0.1) score += 20;
    else if (metrics.cls.value < 0.25) score += 10;

    if (metrics.ttfb.value < 600) score += 20;
    else if (metrics.ttfb.value < 1000) score += 10;

    if (metrics.fcp.value < 1800) score += 20;
    else if (metrics.fcp.value < 3000) score += 10;

    return score;
  }

  getIssues(metrics) {
    const issues = [];
    if (metrics.lcp.value >= 2500) issues.push(`LCP muy alto: ${metrics.lcp.displayValue}`);
    if (metrics.inp.value >= 200) issues.push(`INP muy alto: ${metrics.inp.displayValue}`);
    if (metrics.cls.value >= 0.1) issues.push(`CLS muy alto: ${metrics.cls.displayValue}`);
    if (metrics.ttfb.value >= 600) issues.push(`TTFB muy alto: ${metrics.ttfb.displayValue}`);
    if (metrics.fcp.value >= 1800) issues.push(`FCP muy alto: ${metrics.fcp.displayValue}`);
    return issues;
  }

  getThresholds() {
    return {
      lcp: { good: 2500, needs_improvement: 4000, unit: 'ms' },
      inp: { good: 200, needs_improvement: 500, unit: 'ms' },
      cls: { good: 0.1, needs_improvement: 0.25, unit: '' },
      ttfb: { good: 600, needs_improvement: 1000, unit: 'ms' },
      fcp: { good: 1800, needs_improvement: 3000, unit: 'ms' }
    };
  }
}

export async function validateCoreWebVitals(url, apiKey = null) {
  const validator = new CoreWebVitalsValidator(apiKey);
  return await validator.validate(url);
}
