/* SIXIÈME SENS — Security Module v2.0
   AES-256-GCM + PBKDF2 + HMAC + Audit Trail */
'use strict';

const SixSecurity=(function(){
const C={VER:'2.0.0',ITER:100000,KEY_LEN:256,SALT_LEN:16,IV_LEN:12,TAG_LEN:128,MAX_PIN:5,LOCKOUT:300000,AUTO_LOCK:180000,SESSION:3600000,AUDIT_MAX:500,WIPE_AT:10,PIN_MIN:4,PIN_MAX:8,PREFIX:'6s_sec_',CHECK_IV:30000};
let _key=null,_token=null,_start=null,_last=Date.now(),_lockTimer=null,_checkTimer=null,_locked=true,_fails=0,_lockUntil=0;

function rnd(n){return crypto.getRandomValues(new Uint8Array(n))}
function b64(buf){const b=new Uint8Array(buf);let s='';for(let i=0;i<b.byteLength;i++)s+=String.fromCharCode(b[i]);return btoa(s)}
function unb64(s){const b=atob(s),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function s2b(s){return new TextEncoder().encode(s)}
function b2s(b){return new TextDecoder().decode(b)}
async function sha(d){const buf=typeof d==='string'?s2b(d):d;return b64(await crypto.subtle.digest('SHA-256',buf))}

async function deriveKey(pin,salt){
    const km=await crypto.subtle.importKey('raw',s2b(pin),'PBKDF2',false,['deriveBits','deriveKey']);
    return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:C.ITER,hash:'SHA-256'},km,{name:'AES-GCM',length:C.KEY_LEN},false,['encrypt','decrypt']);
}
async function enc(data,key){const iv=rnd(C.IV_LEN),ed=s2b(JSON.stringify(data)),ct=await crypto.subtle.encrypt({name:'AES-GCM',iv,tagLength:C.TAG_LEN},key,ed);return{iv:b64(iv),data:b64(ct),ts:Date.now()}}
async function dec(obj,key){const iv=unb64(obj.iv),d=unb64(obj.data),pt=await crypto.subtle.decrypt({name:'AES-GCM',iv,tagLength:C.TAG_LEN},key,d);return JSON.parse(b2s(pt))}

const Store={
    async set(k,v){if(!_key)throw new Error('Locked');try{const e=await enc(v,_key),sk=C.PREFIX+k;const h=await sha(sk+JSON.stringify(e));e.hmac=h;localStorage.setItem(sk,JSON.stringify(e));audit('WRITE',{k});return true}catch(e){audit('WRITE_ERR',{k,e:e.message});return false}},
    async get(k){if(!_key)throw new Error('Locked');try{const sk=C.PREFIX+k,r=localStorage.getItem(sk);if(!r)return null;const e=JSON.parse(r),eh=e.hmac;delete e.hmac;const ah=await sha(sk+JSON.stringify(e));if(eh!==ah){audit('INTEGRITY_FAIL',{k});throw new Error('Tampered')}e.hmac=eh;return await dec(e,_key)}catch(e){audit('READ_ERR',{k,e:e.message});return null}},
    rm(k){localStorage.removeItem(C.PREFIX+k);audit('DELETE',{k})},
    keys(){const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(C.PREFIX))ks.push(k.replace(C.PREFIX,''))}return ks},
    wipe(){const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&(k.startsWith(C.PREFIX)||k.startsWith('6s_')))ks.push(k)}ks.forEach(k=>{localStorage.setItem(k,b64(rnd(256)));localStorage.removeItem(k)});audit('WIPED',{n:ks.length})}
};

async function setupPIN(pin){
    if(pin.length<C.PIN_MIN||pin.length>C.PIN_MAX)throw new Error('PIN: '+C.PIN_MIN+'-'+C.PIN_MAX+' chiffres');
    if(/^(\d)\1+$/.test(pin))throw new Error('PIN trop simple');
    const salt=rnd(C.SALT_LEN),key=await deriveKey(pin,salt),vf=await enc({v:'6S_V2'},key);
    localStorage.setItem('6s_auth_salt',b64(salt));
    localStorage.setItem('6s_auth_vf',JSON.stringify(vf));
    localStorage.setItem('6s_auth_ok','true');
    _key=key;_locked=false;_fails=0;audit('PIN_SET',{});startSession();return true;
}

async function unlockPIN(pin){
    if(Date.now()<_lockUntil){const r=Math.ceil((_lockUntil-Date.now())/1000);throw new Error('Verrouillé '+r+'s')}
    try{
        const salt=unb64(localStorage.getItem('6s_auth_salt')),vf=JSON.parse(localStorage.getItem('6s_auth_vf'));
        const key=await deriveKey(pin,salt),res=await dec(vf,key);
        if(res.v!=='6S_V2')throw new Error('Bad');
        _key=key;_locked=false;_fails=0;_lockUntil=0;
        localStorage.setItem('6s_auth_fails','0');audit('UNLOCK_OK',{});startSession();return true;
    }catch(e){
        _fails++;localStorage.setItem('6s_auth_fails',String(_fails));audit('UNLOCK_FAIL',{n:_fails});
        if(_fails>=C.MAX_PIN){_lockUntil=Date.now()+C.LOCKOUT;localStorage.setItem('6s_auth_lock',String(_lockUntil));audit('LOCKED_OUT',{})}
        if(_fails>=C.WIPE_AT){audit('AUTO_WIPE',{});Store.wipe();localStorage.clear();location.reload();return false}
        throw new Error('PIN incorrect ('+_fails+'/'+C.MAX_PIN+')');
    }
}

function startSession(){_token=b64(rnd(32));_start=Date.now();_last=Date.now();resetLock();startCheck()}
function resetLock(){if(_lockTimer)clearTimeout(_lockTimer);_last=Date.now();_lockTimer=setTimeout(()=>{lock();audit('AUTO_LOCK',{})},C.AUTO_LOCK)}
function startCheck(){if(_checkTimer)clearInterval(_checkTimer);_checkTimer=setInterval(()=>{if(!_token||Date.now()-_start>C.SESSION){lock();audit('SESSION_EXP',{})}},C.CHECK_IV)}
function lock(){_key=null;_token=null;_locked=true;if(_lockTimer)clearTimeout(_lockTimer);if(_checkTimer)clearInterval(_checkTimer);window.dispatchEvent(new CustomEvent('6s-locked'))}
function isPIN(){return localStorage.getItem('6s_auth_ok')==='true'}
function isLocked(){return _locked}
function getFails(){return _fails}
function getLockout(){return Date.now()<_lockUntil?Math.ceil((_lockUntil-Date.now())/1000):0}

function audit(ev,de){try{const l=JSON.parse(localStorage.getItem('6s_audit')||'[]');l.push({ts:Date.now(),dt:new Date().toISOString(),ev,de});while(l.length>C.AUDIT_MAX)l.shift();localStorage.setItem('6s_audit',JSON.stringify(l))}catch(e){}}
function getAudit(){try{return JSON.parse(localStorage.getItem('6s_audit')||'[]')}catch{return[]}}
function clearAudit(){localStorage.removeItem('6s_audit')}

async function exportData(){if(_locked)throw new Error('Locked');const all={};for(const k of Store.keys()){try{all[k]=await Store.get(k)}catch{all[k]='[ERR]'}}const pkg={app:'6S',ver:C.VER,date:new Date().toISOString(),data:all,audit:getAudit()};const blob=new Blob([JSON.stringify(pkg,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='6S_export_'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(url);audit('EXPORTED',{});return true}

async function deleteAll(){audit('DELETE_ALL',{});for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('6s')){for(let j=0;j<3;j++)localStorage.setItem(k,b64(rnd(1024)))}}const ks=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('6s'))ks.push(k)}ks.forEach(k=>localStorage.removeItem(k));if('caches'in window)(await caches.keys()).forEach(n=>caches.delete(n));if('serviceWorker'in navigator)(await navigator.serviceWorker.getRegistrations()).forEach(r=>r.unregister());_key=null;_token=null;_locked=true;return true}

function init(){
    const sf=localStorage.getItem('6s_auth_fails'),sl=localStorage.getItem('6s_auth_lock');
    if(sf)_fails=parseInt(sf);if(sl)_lockUntil=parseInt(sl);
    // Screen protection
    const st=document.createElement('style');st.textContent='.sensitive-data{-webkit-user-select:none;user-select:none}@media print{body{display:none!important}}';document.head.appendChild(st);
    document.addEventListener('contextmenu',e=>e.preventDefault());
    document.addEventListener('keydown',e=>{if((e.ctrlKey&&e.key==='s')||(e.ctrlKey&&e.key==='u')||(e.ctrlKey&&e.shiftKey&&e.key==='I')||e.key==='F12'){e.preventDefault();audit('BLOCKED_KEY',{k:e.key})}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){document.querySelectorAll('.sensitive-data').forEach(el=>el.style.filter='blur(10px)');audit('HIDDEN',{})}else{document.querySelectorAll('.sensitive-data').forEach(el=>el.style.filter='none');if(!_locked)resetLock()}});
    ['click','touchstart','keydown','scroll'].forEach(ev=>{document.addEventListener(ev,()=>{if(!_locked)resetLock()},{passive:true})});
    let ht=0;document.addEventListener('visibilitychange',()=>{if(document.hidden)ht=Date.now();else if(ht&&Date.now()-ht>60000){lock();audit('BG_LOCK',{d:Date.now()-ht})}});
    audit('INIT',{v:C.VER});return isPIN();
}

const San={
    clean(s){if(typeof s!=='string')return s;const d=document.createElement('div');d.textContent=s;return d.innerHTML},
    obj(o){if(typeof o==='string')return this.clean(o);if(Array.isArray(o))return o.map(i=>this.obj(i));if(o&&typeof o==='object'){const c={};for(const[k,v]of Object.entries(o))c[this.clean(k)]=this.obj(v);return c}return o},
    pin(s){return s.replace(/[^0-9]/g,'').slice(0,C.PIN_MAX)}
};

const RL={_c:{},check(a,m=30){const n=Date.now(),k=a;if(!this._c[k])this._c[k]=[];this._c[k]=this._c[k].filter(t=>n-t<60000);if(this._c[k].length>=m){audit('RATE_LIM',{a});return false}this._c[k].push(n);return true}};

return{init,setupPIN,unlockPIN,lock,isLocked,isPIN,getFails,getLockout,Storage:Store,Sanitizer:San,RateLimiter:RL,exportData,deleteAll,getAudit,clearAudit,audit,CONFIG:C};
})();