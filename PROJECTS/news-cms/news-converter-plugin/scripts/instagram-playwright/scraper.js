#!/usr/bin/env node
/**
 * Instagram Comments Scraper - Playwright Version
 * Navega Instagram con browser real y extrae comentarios
 * 
 * Uso: node scraper.js --url=https://instagram.com/p/SHORTCODE/ --max-comments=50
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Parsear argumentos
const args = process.argv.slice(2);
const options = {
    url: getArg('--url') || getArg('-u'),
    maxComments: parseInt(getArg('--max-comments') || getArg('-c') || '50'),
    output: getArg('--output') || getArg('-o') || './output',
    headless: !args.includes('--headed'),
    login: args.includes('--login'),
    username: getArg('--username'),
    password: getArg('--password'),
    cookiesFile: getArg('--cookies') || './cookies.json',
    timeout: parseInt(getArg('--timeout') || '30'),
    debug: args.includes('--debug')
};

function getArg(flag) {
    // Soporta --flag valor y --flag=valor
    const index = args.indexOf(flag);
    if (index !== -1 && args[index + 1] && !args[index + 1].startsWith('--')) {
        return args[index + 1];
    }
    // Buscar --flag=valor
    const argWithValue = args.find(arg => arg.startsWith(flag + '='));
    if (argWithValue) {
        return argWithValue.substring(flag.length + 1);
    }
    return null;
}

function showHelp() {
    console.log(`
Instagram Comments Scraper - Playwright
========================================

USO:
  node scraper.js --url=POST_URL [opciones]

REQUERIDO:
  --url, -u          URL del post de Instagram
                       Ej: https://instagram.com/p/ABC123/

OPCIONES:
  --max-comments, -c   Max comentarios a extraer (default: 50)
  --output, -o         Directorio de salida (default: ./output)
  --headless           Ejecutar sin ventana visible (default: true)
  --headed             Mostrar ventana del browser
  --login              Pedir login manual
  --username           Username para login automatico
  --password           Password para login automatico
  --cookies            Archivo de cookies (default: ./cookies.json)
  --timeout            Timeout en segundos (default: 30)
  --debug              Modo debug con logs extra
  --help, -h           Mostrar esta ayuda

EJEMPLOS:
  # Básico (post público):
  node scraper.js --url=https://instagram.com/p/DVq0LtYEdme/

  # Con login manual:
  node scraper.js --url=... --login --headed

  # Con login automático:
  node scraper.js --url=... --username=user --password=pass

  # Guardar cookies para próxima vez:
  node scraper.js --url=... --login --cookies=./my-cookies.json
`);
    process.exit(0);
}

if (args.includes('--help') || args.includes('-h') || !options.url) {
    showHelp();
}

// Validar URL
const INSTAGRAM_POST_REGEX = /instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/;
const match = options.url.match(INSTAGRAM_POST_REGEX);

if (!match) {
    console.error('Error: URL no válida. Debe ser un post de Instagram.');
    console.error('Ejemplo: https://www.instagram.com/p/DVq0LtYEdme/');
    process.exit(1);
}

const shortcode = match[2];
console.log(`Post: ${shortcode}`);
console.log(`Max comentarios: ${options.maxComments}`);

// Crear directorio de salida
if (!fs.existsSync(options.output)) {
    fs.mkdirSync(options.output, { recursive: true });
}

// Datos extraídos
let comments = [];
let postInfo = {};

async function saveCookies(context) {
    const cookies = await context.cookies();
    fs.writeFileSync(options.cookiesFile, JSON.stringify(cookies, null, 2));
    if (options.debug) console.log('Cookies guardadas');
}

async function loadCookies(context) {
    try {
        if (fs.existsSync(options.cookiesFile)) {
            const cookies = JSON.parse(fs.readFileSync(options.cookiesFile));
            await context.addCookies(cookies);
            if (options.debug) console.log('Cookies cargadas');
            return true;
        }
    } catch (e) {
        console.log('No se pudieron cargar cookies:', e.message);
    }
    return false;
}

async function checkIfLoggedIn(page) {
    // Verificar si ya estamos logueados buscando elementos del feed
    try {
        const isLoggedIn = await page.evaluate(() => {
            // Buscar elementos que solo aparecen cuando estás logueado
            const navElements = document.querySelectorAll('svg[aria-label="Inicio"], svg[aria-label="Home"], svg[aria-label="Feed"]');
            const searchBox = document.querySelector('input[placeholder*="Buscar"], input[placeholder*="Search"]');
            const directIcon = document.querySelector('svg[aria-label="Direct"], svg[aria-label="Messenger"]');
            return navElements.length > 0 || searchBox !== null || directIcon !== null;
        });
        return isLoggedIn;
    } catch (e) {
        return false;
    }
}

async function doLogin(page) {
    console.log('Verificando sesión...');
    await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Verificar si ya estamos logueados
    const alreadyLoggedIn = await checkIfLoggedIn(page);
    
    if (alreadyLoggedIn) {
        console.log('✅ Sesión ya activa detectada!');
        return true;
    }
    
    // Si no estamos logueados, ir a login
    console.log('No hay sesión activa, abriendo login...');
    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    // Verificar si el formulario de login está presente
    let needsLoginForm = false;
    try {
        needsLoginForm = await page.locator('input[name="username"]').count() > 0;
    } catch (e) {}
    
    if (!needsLoginForm) {
        console.log('No se encontró formulario de login, verificando si ya estamos logueados...');
        const isLogged = await checkIfLoggedIn(page);
        return isLogged;
    }
    
    if (options.username && options.password) {
        // Login automático
        console.log('Login automático...');
        await page.fill('input[name="username"]', options.username);
        await page.fill('input[name="password"]', options.password);
        
        console.log('Enviando credenciales...');
        await page.click('button[type="submit"]');
        
        // Esperar navegación y posibles redirecciones
        console.log('Esperando respuesta de Instagram...');
        await page.waitForTimeout(8000);
        
        // Verificar si hay 2FA o verificación adicional
        const saveInfoBtn = await page.locator('text=Guardar información, text=Save info').first();
        if (await saveInfoBtn.isVisible().catch(() => false)) {
            console.log('Botón "Guardar información" detectado, haciendo click...');
            await saveInfoBtn.click();
            await page.waitForTimeout(3000);
        }
        
        // Verificar si hay aviso de nuevas funciones
        const notNowBtn = await page.locator('text=Ahora no, text=Not Now').first();
        if (await notNowBtn.isVisible().catch(() => false)) {
            await notNowBtn.click();
            await page.waitForTimeout(2000);
        }
    } else {
        // Login manual
        console.log('\n====================================');
        console.log('📝 LOGIN MANUAL REQUERIDO');
        console.log('====================================');
        console.log('1. Ve a instagram.com en la ventana que se abrió');
        console.log('2. Inicia sesión con tu usuario: sistemas7598');
        console.log('3. Cuando veas tu feed, vuelve aquí y presiona ENTER');
        console.log('====================================\n');
        console.log('Esperando... (presiona ENTER cuando estés listo)');
        
        await waitForEnter();
        console.log('Continuando...\n');
        await page.waitForTimeout(2000);
    }
    
    // Verificar que estamos logueados
    const isNowLoggedIn = await checkIfLoggedIn(page);
    if (isNowLoggedIn) {
        console.log('✅ Login exitoso!');
        return true;
    } else {
        console.log('❌ No se detectó login exitoso');
        return false;
    }
}

function waitForEnter() {
    return new Promise(resolve => {
        process.stdin.once('data', () => resolve());
    });
}

async function extractComments(page) {
    const extracted = await page.evaluate(() => {
        const results = [];
        
        // ESTRATEGIA 1: Buscar elementos li/role="listitem" tradicionales
        const allLiElements = document.querySelectorAll('li, [role="listitem"]');
        
        allLiElements.forEach((el, index) => {
            try {
                const userLinks = el.querySelectorAll('a[href^="/"]');
                let username = '';
                
                for (const link of userLinks) {
                    const text = link.textContent.trim();
                    if (text && text.length > 0 && text.length < 30 && !text.includes(' ')) {
                        username = text;
                        break;
                    }
                }
                
                if (!username) return;
                
                let text = '';
                const allSpans = el.querySelectorAll('span, div');
                
                for (const span of allSpans) {
                    const content = span.textContent.trim();
                    if (content && content !== username && content.length > 2) {
                        const parent = span.parentElement;
                        const isButton = parent && (parent.tagName === 'BUTTON' || parent.getAttribute('role') === 'button');
                        if (!isButton && !content.match(/^\d+$/)) {
                            text = content;
                            break;
                        }
                    }
                }
                
                let likes = 0;
                const buttons = el.querySelectorAll('button');
                for (const btn of buttons) {
                    const btnText = btn.textContent.trim();
                    if (btnText && btnText.match(/^\d+$/)) {
                        likes = parseInt(btnText);
                        break;
                    }
                }
                
                const timeEl = el.querySelector('time');
                const timestamp = timeEl ? timeEl.getAttribute('datetime') : '';
                
                const isReply = el.parentElement && el.parentElement.tagName === 'UL' && 
                                el.parentElement.parentElement && 
                                el.parentElement.parentElement.closest('li') !== null;
                
                if (username && text && username !== text && text.length > 2) {
                    const isDup = results.some(r => r.username === username && r.text === text);
                    if (!isDup) {
                        results.push({
                            index: results.length,
                            username: username,
                            text: text,
                            likes: likes,
                            timestamp: timestamp,
                            is_reply: isReply
                        });
                    }
                }
            } catch (e) {}
        });
        
        // ESTRATEGIA 2: Parsear texto visible directamente
        // Instagram a veces renderiza comentarios como texto plano en ul/li sin estructura clara
        const bodyText = document.body.innerText;
        const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Detectar patrón: username (sin espacios, típico Instagram)
            // Siguiente línea: tiempo relativo (2w, 3d, 5h, etc)
            // Siguiente(s): texto del comentario
            // Opcional: "X likes" o "Reply"
            
            if (line.match(/^[a-zA-Z0-9_.]{1,30}$/) && !line.match(/^(Follow|Like|Reply|Save|Share|Add)$/i)) {
                const username = line;
                const nextLine = lines[i + 1] || '';
                
                // Verificar si siguiente línea es tiempo (2w, 3d, 1h, etc)
                if (nextLine.match(/^\d+[wdhm]$/)) {
                    let commentText = '';
                    let likes = 0;
                    let j = i + 2;
                    
                    // Acumular líneas hasta encontrar "likes" o "Reply"
                    while (j < lines.length && j < i + 10) {
                        const textLine = lines[j];
                        
                        if (textLine.match(/^\d+ likes?$/i)) {
                            likes = parseInt(textLine);
                            break;
                        }
                        if (textLine === 'Reply' || textLine === 'View replies') {
                            break;
                        }
                        if (textLine.match(/^[a-zA-Z0-9_.]{1,30}$/) && textLine !== username) {
                            // Empezó un nuevo comentario
                            break;
                        }
                        
                        commentText += (commentText ? ' ' : '') + textLine;
                        j++;
                    }
                    
                    if (commentText.length > 2 && commentText !== username) {
                        const isDup = results.some(r => r.username === username && r.text === commentText);
                        if (!isDup) {
                            results.push({
                                index: results.length,
                                username: username,
                                text: commentText,
                                likes: likes,
                                timestamp: '',
                                is_reply: false
                            });
                        }
                    }
                }
            }
        }
        
        return results;
    });
    
    return extracted;
}

async function scrollComments(page) {
    // Scroll dentro del área de comentarios
    await page.evaluate(() => {
        const containers = document.querySelectorAll(
            'article ul, [role="dialog"] ul, .x78zum5.xdt5ytf'
        );
        containers.forEach(c => {
            if (c.scrollHeight > c.clientHeight) {
                c.scrollTop = c.scrollHeight;
            }
        });
    });
}

async function scrape() {
    console.log('Iniciando Google Chrome con tu perfil...');
    
    // Detectar Chrome en macOS
    const chromePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chrome.app/Contents/MacOS/Chrome'
    ];
    
    let chromePath = null;
    for (const path of chromePaths) {
        if (require('fs').existsSync(path)) {
            chromePath = path;
            break;
        }
    }
    
    if (!chromePath) {
        console.log('⚠️  Chrome no encontrado, usando Chromium...');
    } else {
        console.log('✅ Usando Google Chrome:', chromePath);
    }
    
    // Usar perfil persistente de Chrome del usuario
    const userDataDir = process.env.HOME + '/Library/Application Support/Google/Chrome';
    
    const launchOptions = {
        headless: options.headless,
        executablePath: chromePath,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process'
        ]
    };
    
    // Usar contexto temporal (más estable, no requiere cerrar Chrome)
    console.log('Usando navegador temporal (no requiere cerrar Chrome)...');
    const browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 }
    });
    
    // Cargar cookies si existen
    await loadCookies(context);
    
    const page = await context.newPage();
    
    // Solo bloquear imágenes grandes para velocidad, pero mantener CSS para que se vea bien
    await page.route('**/*.{png,jpg,jpeg,gif}', route => {
        route.abort().catch(() => {});
    });
    
    try {
        console.log(`Navegando directo al post: ${options.url}`);
        
        // Ir directo al post (con las cookies cargadas si existen)
        await page.goto(options.url, { waitUntil: 'domcontentloaded', timeout: options.timeout * 1000 });
        await page.waitForTimeout(5000);
        
        // Verificar si estamos logueados viendo el post
        const hasSession = await checkIfLoggedIn(page);
        
        if (!hasSession && (options.login || options.username)) {
            console.log('No hay sesión activa, iniciando login...');
            
            if (options.login) {
                // Login manual
                console.log('\n📝 Por favor inicia sesión en la ventana de Chrome');
                console.log('1. Ingresa tu usuario y contraseña en Instagram');
                console.log('2. Espera a ver tu feed o el post');
                console.log('3. Presiona ENTER aquí para continuar\n');
                
                await waitForEnter();
                
                // Recargar el post
                await page.goto(options.url, { waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(3000);
                
                const nowLoggedIn = await checkIfLoggedIn(page);
                if (nowLoggedIn) {
                    console.log('✅ Login detectado!');
                    await saveCookies(context);
                }
            } else if (options.username && options.password) {
                // Login automático
                await doLogin(page);
                await saveCookies(context);
                
                // Recargar el post
                await page.goto(options.url, { waitUntil: 'domcontentloaded' });
                await page.waitForTimeout(3000);
            }
        } else if (hasSession) {
            console.log('✅ Sesión activa detectada');
            await saveCookies(context);
        }
        
        // Debug: Tomar screenshot si hay problemas
        if (options.debug) {
            await page.screenshot({ path: 'debug_post.png', fullPage: true });
            console.log('Screenshot guardado: debug_post.png');
        }
        
        // Extraer info del post
        postInfo = await page.evaluate(() => {
            const captionEl = document.querySelector('h1, article span._aacl, div[role="dialog"] span._aacl');
            const likesEl = document.querySelector('section span, a[href*="liked_by"] span');
            const timeEl = document.querySelector('time');
            const imgEl = document.querySelector('article img, div[role="dialog"] img');
            
            return {
                caption: captionEl ? captionEl.textContent.substring(0, 200) : '',
                likes: likesEl ? parseInt(likesEl.textContent.replace(/\D/g, '')) || 0 : 0,
                timestamp: timeEl ? timeEl.getAttribute('datetime') : '',
                image: imgEl ? imgEl.src : ''
            };
        });
        
        console.log('Info del post:', postInfo);
        
        // Debug: Contar elementos en la página
        const debugInfo = await page.evaluate(() => {
            return {
                liCount: document.querySelectorAll('li').length,
                articleCount: document.querySelectorAll('article').length,
                dialogCount: document.querySelectorAll('[role="dialog"]').length,
                ulCount: document.querySelectorAll('ul').length,
                bodyText: document.body.innerText.substring(0, 500)
            };
        });
        console.log('Debug estructura:', debugInfo);
        
        // Extraer comentarios
        console.log('Extrayendo comentarios...');
        
        let previousCount = 0;
        let sameCountTimes = 0;
        let scrollAttempts = 0;
        const maxScrollAttempts = 10;
        
        while (comments.length < options.maxComments && sameCountTimes < 3 && scrollAttempts < maxScrollAttempts) {
            const newComments = await extractComments(page);
            
            // Merge sin duplicados
            newComments.forEach(nc => {
                const exists = comments.some(c => c.username === nc.username && c.text === nc.text);
                if (!exists) {
                    comments.push(nc);
                }
            });
            
            if (comments.length === previousCount) {
                sameCountTimes++;
            } else {
                sameCountTimes = 0;
            }
            
            previousCount = comments.length;
            console.log(`Extraídos: ${comments.length} comentarios...`);
            
            if (comments.length < options.maxComments && sameCountTimes < 3) {
                await scrollComments(page);
                await page.waitForTimeout(2000);
                scrollAttempts++;
            }
        }
        
        // Limitar al máximo solicitado
        comments = comments.slice(0, options.maxComments);
        
        console.log(`Total: ${comments.length} comentarios`);
        
        // Guardar resultados
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        
        // JSON
        const jsonFile = path.join(options.output, `comments_${shortcode}_${timestamp}.json`);
        fs.writeFileSync(jsonFile, JSON.stringify({
            post: {
                shortcode: shortcode,
                url: options.url,
                ...postInfo,
                scraped_at: new Date().toISOString()
            },
            stats: {
                total_comments: comments.length,
                replies: comments.filter(c => c.is_reply).length
            },
            comments: comments
        }, null, 2));
        
        console.log(`Guardado JSON: ${jsonFile}`);
        
        // CSV
        const csvFile = path.join(options.output, `comments_${shortcode}_${timestamp}.csv`);
        const csvHeaders = ['username', 'text', 'likes', 'timestamp', 'is_reply'];
        const csvRows = comments.map(c => [
            `"${c.username.replace(/"/g, '""')}"`,
            `"${c.text.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
            c.likes,
            c.timestamp,
            c.is_reply ? 'yes' : 'no'
        ].join(','));
        
        fs.writeFileSync(csvFile, [csvHeaders.join(','), ...csvRows].join('\n'));
        console.log(`Guardado CSV: ${csvFile}`);
        
    } catch (error) {
        console.error('Error:', error.message);
        if (options.debug) console.error(error.stack);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

scrape().catch(console.error);
