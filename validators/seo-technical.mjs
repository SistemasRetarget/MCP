/**
 * Validador SEO Técnico para Node.js
 * Verifica meta tags, canonical, schema, sitemap, robots.txt
 */

export class SEOTechnicalValidator {
  async validate(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const html = await response.text();
      const baseUrl = new URL(url);

      const checks = {
        meta_title: this.checkMetaTitle(html),
        meta_description: this.checkMetaDescription(html),
        canonical: this.checkCanonical(html, url),
        headings: this.checkHeadings(html),
        image_alts: this.checkImageAlts(html),
        schema_markup: this.checkSchemaMarkup(html),
        sitemap: await this.checkSitemap(url),
        robots_txt: await this.checkRobotsTxt(url)
      };

      const score = this.calculateScore(checks);
      const passed = score >= 70;

      return {
        url,
        passed,
        score,
        max_score: 100,
        checks,
        issues: this.getIssues(checks),
        recommendations: this.getRecommendations(checks)
      };
    } catch (error) {
      return {
        url,
        error: error.message,
        passed: false,
        score: 0
      };
    }
  }

  checkMetaTitle(html) {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (!titleMatch) return { passed: false, score: 0, detail: 'No title tag' };

    const title = titleMatch[1].trim();
    const length = title.length;

    if (length >= 30 && length <= 60) {
      return { passed: true, score: 15, detail: `Perfecto: ${length} caracteres`, value: title };
    } else if (length >= 10 && length < 30) {
      return { passed: true, score: 10, detail: `Corto: ${length} caracteres`, value: title };
    } else {
      return { passed: false, score: 5, detail: `Muy largo o corto: ${length} caracteres`, value: title };
    }
  }

  checkMetaDescription(html) {
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (!descMatch) return { passed: false, score: 0, detail: 'No meta description' };

    const content = descMatch[1].trim();
    const length = content.length;

    if (length >= 120 && length <= 160) {
      return { passed: true, score: 15, detail: `Perfecto: ${length} caracteres`, value: content };
    } else if (length >= 50 && length < 120) {
      return { passed: true, score: 10, detail: `Corto: ${length} caracteres`, value: content };
    } else {
      return { passed: false, score: 5, detail: `Muy largo o corto: ${length} caracteres`, value: content };
    }
  }

  checkCanonical(html, url) {
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    if (canonicalMatch) {
      return { passed: true, score: 10, detail: `Canonical: ${canonicalMatch[1]}` };
    }
    return { passed: false, score: 0, detail: 'No canonical URL' };
  }

  checkHeadings(html) {
    const h1Matches = html.match(/<h1[^>]*>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>/gi) || [];

    if (h1Matches.length === 0) {
      return { passed: false, score: 0, detail: 'No H1 encontrado' };
    } else if (h1Matches.length > 1) {
      return { passed: false, score: 5, detail: `Múltiples H1 (${h1Matches.length})` };
    } else if (h2Matches.length === 0) {
      return { passed: true, score: 10, detail: '1 H1, pero no H2s' };
    } else {
      return { passed: true, score: 15, detail: `Perfecto: 1 H1, ${h2Matches.length} H2s` };
    }
  }

  checkImageAlts(html) {
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const total = imgMatches.length;

    if (total === 0) return { passed: true, score: 10, detail: 'No images' };

    let missingAlt = 0;
    imgMatches.forEach(img => {
      if (!img.match(/alt=["'][^"']*["']/i) && !img.match(/alt\s*=/i)) {
        missingAlt++;
      }
    });

    if (missingAlt === 0) {
      return { passed: true, score: 10, detail: `All ${total} images have alt` };
    } else {
      return { passed: true, score: 5, detail: `${missingAlt}/${total} missing alt`, missing_count: missingAlt };
    }
  }

  checkSchemaMarkup(html) {
    const schemaMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/gi) || [];
    if (schemaMatches.length > 0) {
      return { passed: true, score: 10, detail: `${schemaMatches.length} Schema.org scripts` };
    }
    return { passed: false, score: 0, detail: 'No Schema.org markup' };
  }

  async checkSitemap(url) {
    try {
      const baseUrl = new URL(url);
      const sitemapUrl = `${baseUrl.origin}/sitemap.xml`;
      const response = await fetch(sitemapUrl);
      return {
        passed: response.ok,
        score: response.ok ? 10 : 0,
        detail: response.ok ? 'sitemap.xml found' : 'sitemap.xml not found'
      };
    } catch {
      return { passed: false, score: 0, detail: 'Could not check sitemap' };
    }
  }

  async checkRobotsTxt(url) {
    try {
      const baseUrl = new URL(url);
      const robotsUrl = `${baseUrl.origin}/robots.txt`;
      const response = await fetch(robotsUrl);
      return {
        passed: response.ok,
        score: response.ok ? 5 : 0,
        detail: response.ok ? 'robots.txt found' : 'robots.txt not found'
      };
    } catch {
      return { passed: false, score: 0, detail: 'Could not check robots.txt' };
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
    if (!checks.schema_markup.passed) recommendations.push('Agregar Schema.org markup');
    if (checks.image_alts.missing_count > 0) {
      recommendations.push(`${checks.image_alts.missing_count} imágenes sin alt text`);
    }
    return recommendations;
  }
}

export async function validateSEOTechnical(url) {
  const validator = new SEOTechnicalValidator();
  return await validator.validate(url);
}
