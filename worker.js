// Password gate worker — v2
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cookie = request.headers.get('Cookie') || '';
    const isAuthed = cookie.includes('carey_auth=ok');

    // Always allow images/resume/etc to load, even before login,
    // so the blurred photo on the login screen can display.
    if (url.pathname.startsWith('/assets/')) {
      return env.ASSETS.fetch(request);
    }

    // Handle the login form submission
    if (request.method === 'POST' && url.pathname === '/__login') {
      const form = await request.formData();
      const attempt = (form.get('password') || '').trim();

      const expected = (env.SITE_PASSWORD || '').trim();
      if (attempt === expected) {
        const headers = new Headers({
          'Location': '/',
          'Set-Cookie': 'carey_auth=ok; Path=/; HttpOnly; Secure; Max-Age=86400; SameSite=Lax'
        });
        return new Response(null, { status: 302, headers });
      }
      const debugInfo = `You typed ${attempt.length} character(s). Server expected ${expected.length} character(s). Secret is ${env.SITE_PASSWORD === undefined ? 'NOT SET' : 'set'}.`;
      return new Response(loginPage(true, debugInfo), {
        status: 401,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // If not logged in, show the gate instead of the real site
    if (!isAuthed) {
      return new Response(loginPage(false), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // Logged in — serve the real site
    return env.ASSETS.fetch(request);
  }
};

function loginPage(wrongPassword, debugInfo) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nevaan Carey Meduri — Portfolio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box; margin:0; padding:0;}
  body{font-family:'Inter',sans-serif;}
  #password-gate{position:fixed; inset:0; display:flex; align-items:center; justify-content:center;}
  .gate-bg{position:absolute; inset:0; background-image:url('/assets/profile.jpg'); background-size:cover; background-position:center 20%; filter:blur(20px) brightness(0.55); transform:scale(1.15);}
  .gate-box{position:relative; z-index:1; background:rgba(16,30,51,0.88); padding:38px 32px; border-radius:4px; max-width:340px; width:88%; text-align:center; color:#F6F5F1;}
  .gate-box h2{font-family:'Space Grotesk',sans-serif; margin-bottom:10px; font-size:1.2rem;}
  .gate-box p{font-size:0.88rem; color:#D8D3C7; margin-bottom:22px; line-height:1.5;}
  .gate-box input{width:100%; padding:11px 12px; border-radius:2px; border:1px solid #3E5C76; background:#0D1826; color:#F6F5F1; font-family:'IBM Plex Mono',monospace; text-align:center; letter-spacing:0.25em; margin-bottom:14px; font-size:0.95rem;}
  .gate-box input:focus{outline:none; border-color:#C97D2C;}
  .gate-box button{width:100%; padding:11px; border-radius:2px; border:none; background:#C97D2C; color:#101E33; font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:0.92rem; cursor:pointer;}
  .gate-error{color:#FF8A80; font-size:0.82rem; margin-top:12px;}
</style>
</head>
<body>
  <div id="password-gate">
    <div class="gate-bg"></div>
    <div class="gate-box">
      <h2>This space is private for now</h2>
      <p>Hi — thanks for stopping by. Please enter the password to view this portfolio.</p>
      <form method="POST" action="/__login">
        <input type="password" name="password" placeholder="Password" maxlength="40" autofocus>
        <button type="submit">Enter</button>
      </form>
      ${wrongPassword ? '<div class="gate-error">Sorry, that password\'s not right — please try again or check the password.</div>' : ''}
      ${wrongPassword && debugInfo ? `<div class="gate-error" style="color:#FFD180; margin-top:8px;">${debugInfo}</div>` : ''}
    </div>
  </div>
</body>
</html>`;
} 
