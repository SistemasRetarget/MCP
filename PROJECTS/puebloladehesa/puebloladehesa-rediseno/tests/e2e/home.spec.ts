import { test, expect } from "@playwright/test";

test.describe("Home (ES)", () => {
  test("carga con título correcto", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Pueblo La Dehesa/);
    await expect(page.locator("h1")).toContainText("Tu refugio en la ciudad");
  });

  test("muestra 4 casas", async ({ page }) => {
    await page.goto("/");
    const cards = page.locator('a[href^="/casas/"]');
    await expect(cards).toHaveCount(4);
  });

  test("enlaces principales navegan", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/casas"]:visible');
    await expect(page).toHaveURL(/\/casas/);
    await expect(page.locator("h1")).toContainText("Casas");
  });

  test("tiene JSON-LD Organization", async ({ page }) => {
    await page.goto("/");
    const jsonld = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonld).toContain("LodgingBusiness");
  });

  test("hreflang presente", async ({ page }) => {
    await page.goto("/");
    const altEn = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(altEn).toHaveCount(1);
  });
});

test.describe("Casa detalle", () => {
  test("casa-doble-altura tiene contenido real", async ({ page }) => {
    await page.goto("/casas/casa-doble-altura");
    await expect(page.locator("h1")).toContainText("Casa Doble Altura");
    await expect(page.locator("p").first()).not.toBeEmpty();
  });

  test("tiene breadcrumb schema", async ({ page }) => {
    await page.goto("/casas/casa-doble-altura");
    const scripts = page.locator('script[type="application/ld+json"]');
    const texts = await scripts.allTextContents();
    expect(texts.some((t) => t.includes("BreadcrumbList"))).toBe(true);
    expect(texts.some((t) => t.includes("Accommodation"))).toBe(true);
  });
});

test.describe("English", () => {
  test("/en carga en inglés", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator("h1")).toContainText("Your refuge in the city");
  });

  test("/en/houses lista casas", async ({ page }) => {
    await page.goto("/en/houses");
    await expect(page.locator("h1")).toContainText("Houses");
  });
});

test.describe("404 y errores", () => {
  test("ruta inexistente muestra 404", async ({ page }) => {
    const response = await page.goto("/ruta-que-no-existe");
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toContainText("404");
  });
});

test.describe("Formulario contacto", () => {
  test("honeypot bloquea bots", async ({ request }) => {
    const res = await request.post("/api/contact", {
      form: { nombre: "Test", email: "test@example.com", mensaje: "Mensaje de prueba largo", website: "http://spam.com" },
      maxRedirects: 0
    });
    // redirige a error por honeypot
    expect([303, 302]).toContain(res.status());
    const loc = res.headers()["location"] || "";
    expect(loc).toContain("error");
  });

  test("datos válidos redirigen a ok=1", async ({ request }) => {
    const res = await request.post("/api/contact", {
      form: { nombre: "Juan", email: "juan@example.com", mensaje: "Quiero consultar disponibilidad para fin de semana." },
      maxRedirects: 0
    });
    expect([303, 302]).toContain(res.status());
    expect(res.headers()["location"]).toContain("ok=1");
  });
});

test.describe("SEO", () => {
  test("sitemap.xml tiene URLs ES y EN", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("/casas/casa-doble-altura");
    expect(body).toContain("/en/houses");
  });

  test("robots.txt existe", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain("Sitemap:");
  });
});

test.describe("Security", () => {
  test("security headers presentes", async ({ request }) => {
    const res = await request.get("/");
    const h = res.headers();
    expect(h["x-frame-options"]).toBe("DENY");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["strict-transport-security"]).toContain("max-age");
  });
});
