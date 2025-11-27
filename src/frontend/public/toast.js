
function ensureToastContainer(){
  let c = document.getElementById('toast-container');
  if (!c){
    c = document.createElement('div');
    c.id = 'toast-container';
    c.style.position = 'fixed';
    c.style.right = '16px';
    c.style.top = '16px';
    c.style.zIndex = '9999';
    c.style.display = 'flex';
    c.style.flexDirection = 'column';
    c.style.gap = '8px';
    document.body.appendChild(c);
  }
  return c;
}

export function showToast(message, type = 'info', timeout = 3500){
  
  if (typeof document === 'undefined') return;
  const c = ensureToastContainer();
  const el = document.createElement('div');
  el.textContent = message;
  el.style.padding = '10px 14px';
  el.style.borderRadius = '8px';
  el.style.color = '#fff';
  el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
  el.style.fontWeight = '600';
  el.style.maxWidth = '320px';
  el.style.opacity = '0';
  el.style.transition = 'opacity 220ms, transform 220ms';
  el.style.transform = 'translateY(-6px)';
  if (type === 'success') { el.style.background = 'linear-gradient(90deg,#2ecc71,#27ae60)'; }
  else if (type === 'error') { el.style.background = 'linear-gradient(90deg,#e74c3c,#c0392b)'; }
  else { el.style.background = 'linear-gradient(90deg,#34495e,#2c3e50)'; }

  c.appendChild(el);
  requestAnimationFrame(()=>{ el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
  setTimeout(()=>{
    el.style.opacity = '0'; el.style.transform = 'translateY(-6px)';
    setTimeout(()=>el.remove(), 250);
  }, timeout);
}

window.showToast = showToast;

