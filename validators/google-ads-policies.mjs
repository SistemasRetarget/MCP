/**
 * Validador Google Ads Policies para Node.js
 * Verifica HTTPS, política de privacidad, mobile-friendly, etc.
 */

export class GoogleAdsPolicyValidator {
  async validate(url) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AdsBot/1.0)' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();
      const checks = {
        https: this.checkHTTPS(url),
        privacy_policy: this.checkPrivacyPolicy(html, url),
        mobile_friendly: this.checkMobileFriendly(html),
        no_intrusive_popups: this.checkNoIntrusivePopups(html),
        contact_info: this.checkContactInfo(html),
        no_misleading_content: this.checkNoMisleadingContent(html)
      };

      const passed = Object.values(checks).every(c => c.passed);
      const score = this.calculateScore(checks);

      return {
        url,
        passed,
        score,
        max_score: 100,
        checks,
        issues: this.getIssues(checks),
        warnings: this.getWarnings(checks)
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

  checkHTTPS(url) {
    const passed = url.startsWith('https://');
    return {
      passed,
      detail: passed ? 'HTTPS configurado' : 'HTTPS obligatorio para Google Ads'
    };
  }

  checkPrivacyPolicy(html, baseUrl) {
    const patterns = [
      /privacy\s*policy/i,
      /política\s*de\s*privacidad/i,
      /privacidad/i
    ];

    const hasLink = patterns.some(pattern => 
      html.match(new RegExp(pattern.source, 'i'))
    );

    return {
      passed: hasLink,
      detail: hasLink ? 'Política de privacidad detectada' : 'Falta política de privacidad'
    };
  }

  checkMobileFriendly(html) {
    const hasViewport = /viewport/i.test(html);
    const hasResponsive = /media\s*query/i.test(html) || 
                          /@media/i.test(html) ||
                          /flexbox/i.test(html) ||
                          /grid/i.test(html);

    const passed = hasViewport && hasResponsive;

    return {
      passed,
      detail: passed ? 'Mobile-friendly' : 'No es mobile-friendly'
    };
  }

  checkNoIntrusivePopups(html) {
    const hasPopup = /popup/i.test(html) || 
                     /modal\s*overlay/i.test(html) ||
                     /alert\s*\(/i.test(html);

    return {
      passed: !hasPopup,
      detail: hasPopup ? 'Posibles pop-ups intrusivos' : 'Sin pop-ups intrusivos'
    };
  }

  checkContactInfo(html) {
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(html);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(html);
    const hasContact = /contact/i.test(html) || /contacto/i.test(html);

    const passed = (hasEmail || hasPhone) && hasContact;

    return {
      passed,
      detail: passed ? 'Información de contacto clara' : 'Falta información de contacto'
    };
  }

  checkNoMisleadingContent(html) {
    const suspicious = [
      /click\s*here\s*to\s*(win|claim|get)/i,
      /you\s*have\s*won/i,
      /congratulations\s*you/i,
      /limited\s*time\s*offer/i
    ];

    const hasSuspicious = suspicious.some(pattern => pattern.test(html));

    return {
      passed: !hasSuspicious,
      detail: hasSuspicious ? 'Contenido potencialmente engañoso' : 'Sin contenido engañoso'
    };
  }

  calculateScore(checks) {
    let score = 0;
    const weights = {
      https: 25,
      privacy_policy: 20,
      mobile_friendly: 20,
      no_intrusive_popups: 10,
      contact_info: 15,
      no_misleading_content: 10
    };

    for (const [key, value] of Object.entries(checks)) {
      if (value.passed && weights[key]) {
        score += weights[key];
      }
    }

    return score;
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

  getWarnings(checks) {
    const warnings = [];
    if (!checks.mobile_friendly.passed) {
      warnings.push('Google penaliza sitios no mobile-friendly');
    }
    if (!checks.privacy_policy.passed) {
      warnings.push('Google Ads requiere política de privacidad');
    }
    return warnings;
  }
}

export async function validateGoogleAdsPolicies(url) {
  const validator = new GoogleAdsPolicyValidator();
  return await validator.validate(url);
}
