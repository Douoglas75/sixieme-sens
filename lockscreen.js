/* SIXIÈME SENS — Lock Screen v2.0 */
'use strict';

const LockScreen=(function(){
let _pin='',_confirm='',_mode='unlock',_cb=null;

function create(){
    const d=document.createElement('div');d.id='lockScreen';
    d.innerHTML=`<style>
#lockScreen{position:fixed;top:0;left:0;width:100%;height:100%;background:#0a0a1a;z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Inter',sans-serif;color:white;padding:env(safe-area-inset-top,44px) 20px env(safe-area-inset-bottom,34px)}
.lk-logo{font-size:60px;margin-bottom:20px}
.lk-title{font-size:20px;font-weight:700;margin-bottom:6px}
.lk-sub{font-size:13px;color:#a0a0cc;margin-bottom:30px;text-align:center;max-width:280px}
.lk-err{font-size:12px;color:#ef4444;margin-bottom:10px;min-height:18px;text-align:center}
.lk-dots{display:flex;gap:16px;margin-bottom:30px}
.lk-dot{width:16px;height:16px;border-radius:50%;border:2px solid rgba(124,58,237,.5);transition:.2s}
.lk-dot.filled{background:linear-gradient(135deg,#7c3aed,#3b82f6);border-color:#7c3aed;transform:scale(1.1)}
.lk-dot.err{background:#ef4444;border-color:#ef4444;animation:lkshake .5s}
@keyframes lkshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}50%{transform:translateX(8px)}75%{transform:translateX(-4px)}}
.lk-pad{display:grid;grid-template-columns:repeat(3,80px);gap:16px;margin-bottom:20px}
.lk-key{width:80px;height:80px;border-radius:50%;background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.2);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:600;color:white;cursor:pointer;transition:.15s;-webkit-tap-highlight-color:transparent;user-select:none}
.lk-key:active{background:rgba(124,58,237,.3);transform:scale(.92)}
.lk-key.fn{font-size:16px;background:transparent;border:none}
.lk-lockout{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:12px;padding:16px 24px;text-align:center;margin-bottom:20px;max-width:300px}
.lk-timer{font-size:32px;font-weight:800;color:#ef4444;margin:8px 0}
.lk-att{font-size:11px;color:#6a6a99;margin-top:10px}
</style>
<div class="lk-logo">🔐</div>
<div class="lk-title" id="lkTitle">Entrez votre PIN</div>
<div class="lk-sub" id="lkSub">Déverrouillez pour accéder à vos données</div>
<div class="lk-err" id="lkErr"></div>
<div class="lk-lockout" id="lkLockout" style="display:none"><div style="font-size:13px;color:#ef4444">⛔ Verrouillé</div><div class="lk-timer" id="lkTimer">5:00</div><div style="font-size:11px;color:#a0a0cc">Trop de tentatives</div></div>
<div class="lk-dots" id="lkDots"><div class="lk-dot"></div><div class="lk-dot"></div><div class="lk-dot"></div><div class="lk-dot"></div></div>
<div class="lk-pad">
<div class="lk-key" onclick="LockScreen.key('1')">1</div><div class="lk-key" onclick="LockScreen.key('2')">2</div><div class="lk-key" onclick="LockScreen.key('3')">3</div>
<div class="lk-key" onclick="LockScreen.key('4')">4</div><div class="lk-key" onclick="LockScreen.key('5')">5</div><div class="lk-key" onclick="LockScreen.key('6')">6</div>
<div class="lk-key" onclick="LockScreen.key('7')">7</div><div class="lk-key" onclick="LockScreen.key('8')">8</div><div class="lk-key" onclick="LockScreen.key('9')">9</div>
<div class="lk-key fn"></div><div class="lk-key" onclick="LockScreen.key('0')">0</div><div class="lk-key fn" onclick="LockScreen.del()">⌫</div>
</div>
<div class="lk-att" id="lkAtt"></div>`;
    document.body.appendChild(d);
}

function show(mode,cb){
    _mode=mode||'unlock';_cb=cb;_pin='';_confirm='';
    if(!document.getElementById('lockScreen'))create();
    document.getElementById('lockScreen').style.display='flex';
    const t=document.getElementById('lkTitle'),s=document.getElementById('lkSub');
    if(_mode==='setup'){t.textContent='Créez votre PIN';s.textContent='Ce PIN protège toutes vos données'}
    else if(_mode==='confirm'){t.textContent='Confirmez votre PIN';s.textContent='Entrez le même PIN'}
    else{t.textContent='Entrez votre PIN';s.textContent='Déverrouillez pour accéder à vos données'}
    document.getElementById('lkErr').textContent='';
    upDots();chkLockout();
}

function hide(){const ls=document.getElementById('lockScreen');if(ls)ls.style.display='none';_pin=''}

function key(n){
    if(!SixSecurity.RateLimiter.check('pin',60))return;
    if(SixSecurity.getLockout()>0)return;
    if(_pin.length>=SixSecurity.CONFIG.PIN_MAX)return;
    _pin+=n;upDots();
    if(navigator.vibrate)navigator.vibrate(30);
    if(_pin.length>=SixSecurity.CONFIG.PIN_MIN)setTimeout(submit,200);
}

function del(){_pin=_pin.slice(0,-1);upDots();if(navigator.vibrate)navigator.vibrate(20)}

function upDots(){
    const c=document.getElementById('lkDots'),mx=Math.max(_pin.length,4);
    while(c.children.length<mx){const d=document.createElement('div');d.className='lk-dot';c.appendChild(d)}
    while(c.children.length>Math.max(mx,4))c.removeChild(c.lastChild);
    Array.from(c.children).forEach((d,i)=>d.className='lk-dot'+(i<_pin.length?' filled':''));
}

function err(msg){
    document.getElementById('lkErr').textContent=msg;
    document.querySelectorAll('#lkDots .lk-dot').forEach(d=>d.classList.add('err'));
    if(navigator.vibrate)navigator.vibrate([100,50,100]);
    setTimeout(()=>{document.querySelectorAll('#lkDots .lk-dot').forEach(d=>{d.classList.remove('err','filled')});_pin='';upDots()},600);
    const f=SixSecurity.getFails(),m=SixSecurity.CONFIG.MAX_PIN;
    if(f>0)document.getElementById('lkAtt').textContent=(m-f)+' tentative(s) restante(s)';
}

async function submit(){
    const pin=_pin;
    if(_mode==='setup'){_confirm=pin;_pin='';_mode='confirm';show('confirm',_cb);return}
    if(_mode==='confirm'){
        if(pin!==_confirm){err('PINs différents');_mode='setup';setTimeout(()=>show('setup',_cb),800);return}
        try{await SixSecurity.setupPIN(pin);hide();if(_cb)_cb()}catch(e){err(e.message);_mode='setup';setTimeout(()=>show('setup',_cb),800)}
        return;
    }
    try{await SixSecurity.unlockPIN(pin);hide();if(_cb)_cb()}catch(e){err(e.message);chkLockout()}
}

function chkLockout(){
    const r=SixSecurity.getLockout(),lo=document.getElementById('lkLockout'),pad=document.querySelector('.lk-pad');
    if(r>0){lo.style.display='block';pad.style.opacity='.3';pad.style.pointerEvents='none';
        const tmr=document.getElementById('lkTimer');
        const iv=setInterval(()=>{const x=SixSecurity.getLockout();if(x<=0){clearInterval(iv);lo.style.display='none';pad.style.opacity='1';pad.style.pointerEvents='auto';return}tmr.textContent=Math.floor(x/60)+':'+String(x%60).padStart(2,'0')},1000);
    }else{lo.style.display='none';pad.style.opacity='1';pad.style.pointerEvents='auto'}
}

return{show,hide,key,del};
})();