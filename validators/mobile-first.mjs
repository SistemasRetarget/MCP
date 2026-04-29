/**
 * Validador Mobile First & Responsive Design para Node.js
 * Verifica viewport, media queries, touch targets, etc.
 */

export class MobileFirstValidator {
  async validate(url) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();

      const checks = {
        viewport: this.checkViewport(html),
        media_queries: this.checkMediaQueries(html),
        touch_targets: this.checkTouchTargets(html),
        font_sizes: this.checkFontSizes(html),
        horizontal_scroll: this.checkHorizontalScroll(html),
        flexible_layout: this.checkFlexibleLayout(html)
      };

      const score = this.calculateScore(checks);
      const passed = score >= 80;
      const mobile_first_compliant = passed && checks.viewport.passed;

      return {
        url,
        passed,
        score,
        max_score: 100,
        mobile_first_compliant,
        checks,
        issues: this.getIssues(checks),
        recommendations: this.getRecommendations(checks)
      };
    } catch (error) {
      return {
        url,
        error: error.message,
        passed: false,
        mobile_first_compliant: false,
        score: 0
      };
    }
  }

  checkViewport(html) {
    const viewportMatch = html.match(/<meta[^>]*name=["']viewport["'][^>]*content=["']([^"']+)["']/i);
    if (!viewportMatch) return { passed: false, score: 0, detail: 'No viewport meta tag' };

    const content = viewportMatch[1];
    const hasWidthDevice = /width=device-width/i.test(content);
    const hasInitialScale = /initial-scale=1/i.test(content);

    if (hasWidthDevice && hasInitialScale) {
      return { passed: true, score: 20, detail: `Viewport correcto: ${content}` };
    } else if (hasWidthDevice) {
      return { passed: true, score: 15, detail: `Viewport parcial: ${content}` };
    } else {
      return { passed: false, score: 0, detail: `Viewport incompleto: ${content}` };
    }
  }

  checkMediaQueries(html) {
    const mediaQueryMatches = html.match(/@media[^{]*{/gi) || [];
    const minWidthCount = (html.match(/min-width/gi) || []).length;
    const maxWidthCount = (html.match(/max-width/gi) || []).length;

    if (mediaQueryMatches.length === 0) {
      return { passed: false, score: 0, detail: 'No media queries' };
    }

    if (minWidthCount > maxWidthCount) {
      return {
        passed: true,
        score: 15,
        detail: `Mobile-first: ${minWidthCount} min-width, ${maxWidthCount} max-width`
      };
    } else if (maxWidthCount > 0) {
      return {
        passed: false,
        score: 5,
        detail: `Desktop-first: ${maxWidthCount} max-width vs ${minWidthCount} min-width`
      };
    } else {
      return { passed: true, score: 10, detail: `${mediaQueryMatches.length} media queries` };
    }
  }

  checkTouchTargets(html) {
    // Buscar elementos con tamaño pequeño (heurística simple)
    const smallButtonPattern = /(?:button|a|\[role=["']button["']\])[^>]*style[^>]*width:\s*(\d+)px[^>]*height:\s*(\d+)px/gi;
    const matches = [...html.matchAll(smallButtonPattern)];

    let smallTargets = 0;
    matches.forEach(match => {
      const width = parseInt(match[1]);
      const height = parseInt(match[2]);
      if (width < 48 || height < 48) smallTargets++;
    });

    if (smallTargets === 0) {
      return { passed: true, score: 15, detail: 'Touch targets >= 48x48px' };
    } else if (smallTargets <= 3) {
      return {
        passed: true,
        score: 10,
        detail: `${smallTargets} elementos < 48x48px`,
        small_targets: smallTargets
      };
    } else {
      return {
        passed: false,
        score: 0,
        detail: `${smallTargets} elementos < 48x48px`,
        small_targets: smallTargets
      };
    }
  }

  checkFontSizes(html) {
    // Buscar font-size base
    const htmlFontMatch = html.match(/html[^>]*style[^>]*font-size:\s*(\d+)px/i);
    const bodyFontMatch = html.match(/body[^>]*style[^>]*font-size:\s*(\d+)px/i);

    let baseSize = 16;
    if (htmlFontMatch) baseSize = parseInt(htmlFontMatch[1]);
    else if (bodyFontMatch) baseSize = parseInt(bodyFontMatch[1]);

    if (baseSize >= 16) {
      return { passed: true, score: 15, detail: `Font size base: ${baseSize}px (legible)` };
    } else {
      return { passed: false, score: 0, detail: `Font size base: ${baseSize}px (muy pequeño)` };
    }
  }

  checkHorizontalScroll(html) {
    const overflowScroll = /overflow-x:\s*scroll/i.test(html);
    const largeWidth = /width:\s*(\d+)vw/i.test(html);

    if (!overflowScroll && !largeWidth) {
      return { passed: true, score: 10, detail: 'No horizontal scroll' };
    } else {
      return { passed: false, score: 0, detail: 'Posible horizontal scroll' };
    }
  }

  checkFlexibleLayout(html) {
    const hasFlexbox = /display:\s*flex/i.test(html) || /flexbox/i.test(html);
    const hasGrid = /display:\s*grid/i.test(html);
    const hasFloat = /float:\s*(left|right)/i.test(html);

    const modernLayout = hasFlexbox || hasGrid;

    if (modernLayout && !hasFloat) {
      return {
        passed: true,
        score: 15,
        detail: `Flexbox: ${hasFlexbox}, Grid: ${hasGrid}, Sin floats`
      };
    } else if (modernLayout && hasFloat) {
      return { passed: true, score: 10, detail: 'Usa Flexbox/Grid pero aún tiene floats' };
    } else if (hasFloat) {
      return { passed: false, score: 0, detail: 'Usa floats (legacy)' };
    } else {
      return { passed: true, score: 5, detail: 'No layout methods detectados' };
    }
  }

  calculateScore(checks) {
    return Object.values(checks).reduce((sum, check) => sum + (check.score || 0), 0);
  }

  getIssues(checks) {
    const issues = [];
    for (const [key, value] of Object.entries(checks)) {
      if (!value.passed) {
        issues.push(`${key}: ${value.detail}`);
      }
    }
    return issues;
  }

  getRecommendations(checks) {
    const recommendations = [];
    if (!checks.media_queries.passed) recommendations.push('Usar approach mobile-first (min-width)');
    if (!checks.flexible_layout.passed) recommendations.push('Migrar floats a Flexbox/Grid');
    if (checks.touch_targets.small_targets > 0) {
      recommendations.push(`${checks.touch_targets.small_targets} touch targets pequeños`);
    }
    return recommendations;
  }
}

export async function validateMobileFirst(url) {
  const validator = new MobileFirstValidator();
  return await validator.validate(url);
}
