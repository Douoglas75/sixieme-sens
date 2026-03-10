/*  SIXIÈME SENS — App Engine v2.0  */
'use strict';

const A={user:{name:'User',sleep:7,activity:'medium',finance:'ok',contacts:[]},scores:{},perms:{},devices:[],apps:[],slide:0,page:'home',alerts:[],predictions:[],ghostTasks:[],notifs:[]};

const PERMS_DATA=[
    {id:'notif',icon:'🔔',bg:'rgba(124,58,237,.15)',name:'Notifications',desc:'Alertes prédictives en temps réel',api:'Notification'},
    {id:'contacts',icon:'👥',bg:'rgba(59,130,246,.15)',name:'Contacts',desc:'Radar Social avec vos proches',api:null},
    {id:'calendar',icon:'📅',bg:'rgba(16,185,129,.15)',name:'Calendrier',desc:'Optimiser planning, détecter conflits',api:null},
    {id:'location',icon:'📍',bg:'rgba(245,158,11,.15)',name:'Localisation',desc:'Alertes météo, qualité air, trajets',api:'geolocation'},
    {id:'health',icon:'❤️',bg:'rgba(239,68,68,.15)',name:'Données Santé',desc:'Apple Health / Google Fit',api:null},
    {id:'camera',icon:'📷',bg:'rgba(6,182,212,.15)',name:'Appareil Photo',desc:'Scanner documents Ghost-Admin',api:null},
    {id:'micro',icon:'🎙️',bg:'rgba(236,72,153,.15)',name:'Microphone',desc:'Analyse vocale stress + assistant',api:null},
    {id:'messages',icon:'💬',bg:'rgba(124,58,237,.15)',name:'Messages',desc:'Radar Social — fréquence contacts',api:null},
    {id:'calls',icon:'📞',bg:'rgba(16,185,129,.15)',name:'Journal appels',desc:'Radar Social — communications',api:null},
    {id:'bank',icon:'🏦',bg:'rgba(245,158,11,.15)',name:'Comptes bancaires',desc:'Open Banking — prédictions finance',api:null}
];

const DEVICES_DATA=[
    {id:'awatch',icon:'⌚',name:'Apple Watch',type:'Montre connectée',signal:'Fort'},
    {id:'gring',icon:'💍',name:'Samsung Galaxy Ring',type:'Bague connectée',signal:'Moyen'},
    {id:'scale',icon:'⚖️',name:'Withings Body+',type:'Balance connectée',signal:'Fort'},
    {id:'bp',icon:'🩸',name:'Omron Evolv',type:'Tensiomètre',signal:'Faible'},
    {id:'band',icon:'📿',name:'Xiaomi Band 8',type:'Bracelet connecté',signal:'Fort'}
];

const APPS_DATA=[
    {id:'gfit',icon:'❤️',bg:'rgba(239,68,68,.15)',name:'Google Fit / Apple Health',desc:'Santé, pas, sommeil'},
    {id:'gcal',icon:'📅',bg:'rgba(59,130,246,.15)',name:'Google Agenda / Calendar',desc:'Rendez-vous, planning'},
    {id:'gmail',icon:'📧',bg:'rgba(239,68,68,.15)',name:'Gmail / Outlook',desc:'Factures, rendez-vous'},
    {id:'bank',icon:'🏦',bg:'rgba(245,158,11,.15)',name:'Banque (Open Banking)',desc:'Solde, dépenses'},
    {id:'whatsapp',icon:'💬',bg:'rgba(16,185,129,.15)',name:'WhatsApp / Telegram',desc:'Fréquence contacts'},
    {id:'spotify',icon:'🎵',bg:'rgba(16,185,129,.15)',name:'Spotify / Apple Music',desc:'Analyse humeur'},
    {id:'maps',icon:'🗺️',bg:'rgba(59,130,246,.15)',name:'Google Maps / Waze',desc:'Trajets'},
    {id:'strava',icon:'🏃',bg:'rgba(249,115,22,.15)',name:'Strava / Nike Run',desc:'Activité sportive'}
];

function g(id){return document.getElementById(id)}

// INIT
document.addEventListener('DOMContentLoaded',()=>{
    const saved=localStorage.getItem('6s_v2');
    if(saved){try{Object.assign(A,JSON.parse(saved))}catch(e){}}
    if(saved&&A.user.name!=='User'){
        setTimeout(()=>{g('splashScreen').classList.add('hidden');setTimeout(()=>{
            // Security module will handle PIN check
            if(typeof SixSecurity!=='undefined'&&SixSecurity.isPINSetup()){
                // Let security-integration handle it
            } else { launchApp(); }
        },400)},2800);
    } else {
        setTimeout(()=>{g('splashScreen').classList.add('hidden');setTimeout(()=>g('onboarding').classList.add('active'),400)},2800);
    }
});

// ONBOARDING
g('btnNext').onclick=()=>{if(A.slide<4){changeSlide(A.slide+1)}else{g('onboarding').classList.remove('active');g('setupScreen').classList.add('active')}};
g('btnSkip').onclick=()=>{g('onboarding').classList.remove('active');g('setupScreen').classList.add('active')};
function changeSlide(i){const sl=document.querySelectorAll('.ob-slide'),dt=document.querySelectorAll('.ob-dot');sl[A.slide].classList.remove('active');sl[A.slide].classList.add('left');A.slide=i;sl[i].classList.remove('left');sl[i].classList.add('active');dt.forEach((d,j)=>d.classList.toggle('active',j===i));g('btnNext').textContent=i===4?'Commencer':'Suivant'}

// SETUP
g('btnLaunch').onclick=()=>{
    const name=g('userName').value||'Sarah';const contacts=[];
    for(let i=1;i<=5;i++){const n=g('c'+i).value,r=g('c'+i+'r').value;if(n)contacts.push({name:n,relation:r||'Proche',lastContact:Math.floor(Math.random()*30)+1})}
    const defs=[{n:'Maman',r:'Famille'},{n:'Thomas',r:'Ami'},{n:'Julie',r:'Collègue'},{n:'Papa',r:'Famille'},{n:'Léa',r:'Amie'}];
    while(contacts.length<5){const d=defs[contacts.length];contacts.push({name:d.n,relation:d.r,lastContact:Math.floor(Math.random()*45)+1})}
    A.user={name,sleep:+g('userSleep').value,activity:g('userActivity').value,finance:g('userFinance').value,contacts};
    g('setupScreen').classList.remove('active');showPerms();
};

// PERMISSIONS
function showPerms(){g('permsScreen').classList.add('active');g('permsContainer').innerHTML=PERMS_DATA.map(p=>`<div class="perm-card" id="perm_${p.id}" onclick="requestPerm('${p.id}','${p.api||''}')"><div class="perm-icon" style="background:${p.bg}">${p.icon}</div><div class="perm-info"><h3>${p.name}</h3><p>${p.desc}</p></div><div class="perm-status pending" id="ps_${p.id}"><i class="fas fa-chevron-right"></i></div></div>`).join('')}
function requestPerm(id,api){
    if(api==='Notification'&&'Notification'in window){Notification.requestPermission().then(r=>{A.perms[id]=r==='granted';updatePermUI(id,r==='granted');if(r==='granted')toast('✅','Notifications activées')})}
    else if(api==='geolocation'&&navigator.geolocation){navigator.geolocation.getCurrentPosition(()=>{A.perms[id]=true;updatePermUI(id,true);toast('✅','Localisation activée')},()=>{A.perms[id]=false;updatePermUI(id,false);toast('⚠️','Localisation refusée')})}
    else{const ok=Math.random()>.2;A.perms[id]=ok;updatePermUI(id,ok);toast(ok?'✅':'⚠️',ok?PERMS_DATA.find(p=>p.id===id).name+' autorisé':'Configurer manuellement')}
}
function updatePermUI(id,ok){const c=g('perm_'+id),s=g('ps_'+id);c.classList.add(ok?'granted':'denied');s.className='perm-status '+(ok?'ok':'no');s.innerHTML=ok?'<i class="fas fa-check"></i>':'<i class="fas fa-times"></i>'}
g('btnPermsNext').onclick=()=>{g('permsScreen').classList.remove('active');showDevices()};
g('permSkipAll').onclick=()=>{g('permsScreen').classList.remove('active');showDevices()};

// DEVICES
function showDevices(){g('devicesScreen').classList.add('active');let f=0;const iv=setInterval(()=>{if(f>=3){clearInterval(iv);g('scanStatus').textContent=f+' appareils détectés';return}const d=DEVICES_DATA[f];g('devicesFound').innerHTML+=`<div class="device-found" id="dev_${d.id}"><div class="device-icon">${d.icon}</div><div class="device-info"><h4>${d.name}</h4><p>${d.type} · Signal ${d.signal}</p></div><button class="device-btn connect" onclick="connectDevice('${d.id}',this)">Connecter</button></div>`;f++;g('scanStatus').textContent=f+' appareil(s) trouvé(s)...'},1500)}
function connectDevice(id,btn){btn.textContent='⏳...';btn.disabled=true;setTimeout(()=>{btn.textContent='✅ Connecté';btn.className='device-btn connected-btn';g('dev_'+id).classList.add('connected');A.devices.push(id);toast('⌚',DEVICES_DATA.find(d=>d.id===id).name+' connecté !')},1500)}
g('btnDevicesNext').onclick=()=>{g('devicesScreen').classList.remove('active');showConnSetup()};
g('deviceSkip').onclick=()=>{g('devicesScreen').classList.remove('active');showConnSetup()};

// APP CONNECTIONS
function showConnSetup(){g('connectionsScreen').classList.add('active');renderAppConn('connectionsSetup')}
function renderAppConn(cid){g(cid).innerHTML=APPS_DATA.map(a=>{const l=A.apps.includes(a.id);return`<div class="app-connection ${l?'linked':''}" id="app_${a.id}"><div class="app-conn-icon" style="background:${a.bg}">${a.icon}</div><div class="app-conn-info"><h3>${a.name}</h3><p>${a.desc}</p></div><button class="app-conn-btn ${l?'linked-btn':'link'}" onclick="linkApp('${a.id}',this)">${l?'✅ Lié':'Lier'}</button></div>`}).join('')}
function linkApp(id,btn){if(A.apps.includes(id))return;btn.textContent='⏳...';btn.disabled=true;setTimeout(()=>{A.apps.push(id);btn.textContent='✅ Lié';btn.className='app-conn-btn linked-btn';g('app_'+id).classList.add('linked');toast('🔗',APPS_DATA.find(a=>a.id===id).name+' connecté !')},1200)}
g('btnConnNext').onclick=()=>{g('connectionsScreen').classList.remove('active');saveAndLaunch()};
g('connSkip').onclick=()=>{g('connectionsScreen').classList.remove('active');saveAndLaunch()};

function saveAndLaunch(){localStorage.setItem('6s_v2',JSON.stringify(A));launchApp()}

// LAUNCH
function launchApp(){
    genScores();genAlerts();genPred();genGhost();genNotifs();
    g('appContainer').classList.add('active');g('bottomNav').style.display='flex';
    renderHome();renderShield();renderPredictions();renderSocial();renderGhost();renderConn();
    setTimeout(animateScore,500);
    if(A.devices.length>0){g('devicesBanner').style.display='flex';g('devBannerTitle').textContent=A.devices.length+' appareil(s) connecté(s)'}
}

// DATA GEN
function genScores(){const sl=A.user.sleep>=7?1:A.user.sleep>=6?.85:.7,ac={low:.7,medium:.85,high:1,athlete:1.05}[A.user.activity],fi={tight:.65,ok:.8,comfortable:.95}[A.user.finance];A.scores={h:Math.min(10,(7+Math.random()*2)*sl*ac).toFixed(1),f:Math.min(10,(6+Math.random()*2.5)*fi).toFixed(1),s:(5.5+Math.random()*3).toFixed(1),c:Math.min(10,(7+Math.random()*2.5)*sl).toFixed(1),k:(6+Math.random()*3).toFixed(1),a:(7.5+Math.random()*2.5).toFixed(1)};A.scores.t=([A.scores.h,A.scores.f,A.scores.s,A.scores.c,A.scores.k,A.scores.a].reduce((a,b)=>a+ +b,0)/6).toFixed(1)}
function genAlerts(){const h=new Date().getHours();A.alerts=[{type:'red',icon:'fa-heart-pulse',title:'Risque fatigue accumulée',desc:'Sommeil '+A.user.sleep+'h + activité → déficit détecté.',time:'Prédiction J+5',actions:['Ajuster sommeil','Rappel']},{type:'yellow',icon:'fa-wallet',title:'Dépense inhabituelle prévue',desc:'Dépenses +30% cette période historiquement.',time:'Prédiction J+14',actions:['Détails','Ignorer']},{type:'green',icon:'fa-bolt',title:'Pic énergie : '+(h<12?'10h-12h':'16h-18h'),desc:'Pic de performance cognitive détecté.',time:'Aujourd\'hui',actions:['Deep Focus','Noté']}]}
function genPred(){A.predictions=[{type:'health',cat:'Santé',title:'Risque rhume J+10-14',desc:'Basé sur sommeil ('+A.user.sleep+'h), saison, données épidémiologiques.',conf:72,tl:'J+10 à J+14',rec:'Vitamine C, sommeil 8h.',cd:[30,45,55,62,72,78,72,65]},{type:'finance',cat:'Finance',title:'Fin de mois serrée',desc:'Patterns de dépenses → solde bas. Réduction 12% recommandée.',conf:81,tl:'J+18 à J+25',rec:'Reporter achats non essentiels.',cd:[80,75,68,60,52,45,38,35]},{type:'social',cat:'Social',title:'Relation '+(A.user.contacts[0]?.name||'Maman')+' en déclin',desc:'Dernier contact il y a '+(A.user.contacts[0]?.lastContact||15)+' jours.',conf:88,tl:'En cours',rec:'Appeler ce soir 19h-20h.',cd:[90,82,70,58,45,38,30,25]},{type:'cognitive',cat:'Cognitif',title:'Surcharge informationnelle',desc:'Contenus +40%. Risque fatigue décisionnelle.',conf:76,tl:'J+2 à J+5',rec:'Deep Focus, scroll ≤30min/jour.',cd:[40,55,65,75,82,88,85,78]},{type:'health',cat:'Santé',title:'Sport optimal : 17h30',desc:'Pic de forme physique détecté.',conf:84,tl:'Aujourd\'hui',rec:'Session 30-45 min.',cd:[50,55,65,70,85,92,80,60]}]}
function genGhost(){A.ghostTasks=[{icon:'📊',bg:'rgba(59,130,246,.15)',title:'Comparaison assurance',desc:'12 offres analysées. 3 alternatives, économie 22-34€/mois.',st:'completed',stl:'✅ Terminée',sav:'→ Économie : 34€/mois'},{icon:'📅',bg:'rgba(16,185,129,.15)',title:'Disponible',desc:'Sélectionnez une tâche à automatiser.',st:'available',stl:'🟢 Dispo',sav:null}]}
function genNotifs(){A.notifs=[{dot:'red',t:'🔴 Alerte Santé',tx:'Risque fatigue détecté.',tm:'Il y a 2h',u:true},{dot:'purple',t:'🤖 Ghost-Admin',tx:'Comparaison assurance terminée !',tm:'Il y a 5h',u:true},{dot:'green',t:'⚡ Conseil',tx:'Pic cognitif détecté.',tm:'Ce matin',u:true}]}

// RENDER
function renderHome(){
    const h=new Date().getHours(),gr=h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir';
    g('greetingText').textContent=gr+', '+A.user.name+' 👋';
    const d=new Date(),days=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'],months=['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    g('dateText').textContent=days[d.getDay()]+' '+d.getDate()+' '+months[d.getMonth()]+' 2026';
    g('avatarBtn').textContent=A.user.name.charAt(0);
    g('alertsBox').innerHTML=A.alerts.map(a=>'<div class="alert-card '+a.type+'"><div class="alert-icon"><i class="fas '+a.icon+'"></i></div><div class="alert-content"><h3>'+a.title+'</h3><p>'+a.desc+'</p><div class="alert-time"><i class="fas fa-clock"></i> '+a.time+'</div><div class="alert-actions">'+a.actions.map((ac,i)=>'<button class="alert-btn '+(i?'secondary':'primary')+'">'+ac+'</button>').join('')+'</div></div></div>').join('');
    const acts=[{t:'09:00',tx:'Deep Work',s:'Bouclier',d:h>=11},{t:'12:30',tx:'Appeler '+(A.user.contacts[0]?.name||'Maman'),s:'Radar Social',d:h>=13},{t:'14:00',tx:'Revoir assurance',s:'Ghost-Admin',d:false},{t:'17:30',tx:'Sport (pic énergie)',s:'Prédict-Santé',d:false},{t:'21:00',tx:'Mode nuit',s:'Bouclier',d:false}];
    g('actionsBox').innerHTML=acts.map(a=>'<div class="action-item"><span class="action-time">'+a.t+'</span><span class="action-dot '+(a.d?'done':'')+'"></span><div class="action-text">'+a.tx+'<span class="source">'+a.s+'</span></div><div class="action-check '+(a.d?'checked':'')+'" onclick="toggleCheck(this)">'+(a.d?'<i class="fas fa-check"></i>':'')+'</div></div>').join('');
    g('notifCount').textContent=A.notifs.filter(n=>n.u).length;
    g('notifList').innerHTML=A.notifs.map(n=>'<div class="notif-item '+(n.u?'unread':'')+'"><div class="notif-dot-ind '+n.dot+'"></div><div class="notif-content"><h4>'+n.t+'</h4><p>'+n.tx+'</p><div class="time">'+n.tm+'</div></div></div>').join('');
}
function animateScore(){const ring=g('scoreRing'),circ=2*Math.PI*60,t=+A.scores.t;ring.style.strokeDashoffset=circ-(t/10)*circ;let c=0;const iv=setInterval(()=>{c+=.1;if(c>=t){c=t;clearInterval(iv)}g('scoreNumber').textContent=c.toFixed(1)},30);[['sH','h'],['sF','f'],['sS','s'],['sC','c'],['sK','k'],['sA','a']].forEach(([el,k],i)=>{setTimeout(()=>{let v=0;const iv2=setInterval(()=>{v+=.1;if(v>=+A.scores[k]){v=+A.scores[k];clearInterval(iv2)}g(el).textContent=v.toFixed(1)},25)},200+i*150)})}
function renderShield(){setTimeout(()=>g('attBar').style.width='78%',300)}
function renderPredictions(){const clr={health:'var(--accent-green)',finance:'var(--accent-yellow)',social:'var(--accent-blue)',cognitive:'var(--accent-purple)'};g('predBox').innerHTML=A.predictions.map(p=>'<div class="prediction-card" data-type="'+p.type+'"><div class="pred-header"><span class="pred-type '+p.type+'">'+p.cat+'</span><span class="pred-confidence">Confiance : <strong>'+p.conf+'%</strong></span></div><h3>'+p.title+'</h3><p class="pred-desc">'+p.desc+'</p><div class="pred-timeline"><i class="fas fa-calendar-alt"></i>'+p.tl+'</div><div class="pred-chart">'+p.cd.map(v=>'<div class="chart-bar" style="height:'+v*.6+'px;background:'+(clr[p.type]||clr.health)+';opacity:'+(0.4+v/200)+'"></div>').join('')+'</div><div style="padding:10px;background:rgba(6,182,212,.08);border-radius:8px;font-size:12px"><strong style="color:var(--accent-cyan)">💡</strong> <span style="color:var(--text-secondary)">'+p.rec+'</span></div></div>').join('');document.querySelectorAll('.pred-tab').forEach(tab=>tab.onclick=()=>{document.querySelectorAll('.pred-tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');const f=tab.dataset.f;document.querySelectorAll('.prediction-card').forEach(c=>c.style.display=(f==='all'||c.dataset.type===f)?'block':'none')})}
function renderSocial(){g('radarC').textContent=A.user.name.charAt(0);A.user.contacts.forEach(c=>{c.health=c.lastContact<=7?'healthy':c.lastContact<=21?'warning':'danger'});const pos=[{t:'5%',l:'45%'},{t:'30%',l:'85%'},{t:'70%',l:'80%'},{t:'75%',l:'10%'},{t:'25%',l:'5%'}];document.querySelectorAll('.radar-contact').forEach(e=>e.remove());A.user.contacts.forEach((c,i)=>{g('radarBox').insertAdjacentHTML('beforeend','<div class="radar-contact '+c.health+'" style="top:'+pos[i].t+';left:'+pos[i].l+'">'+c.name.charAt(0)+'</div>')});const st={healthy:{c:'good',t:'✅ Bon'},warning:{c:'watch',t:'⚠️ Surveiller'},danger:{c:'alert',t:'🔴 Alerte'}},bg=['var(--accent-green)','var(--accent-blue)','var(--accent-purple)','var(--accent-cyan)','var(--accent-pink)'];g('contactsBox').innerHTML=A.user.contacts.map((c,i)=>'<div class="contact-card"><div class="contact-avatar" style="background:'+bg[i]+'">'+c.name.charAt(0)+'</div><div class="contact-info"><h3>'+c.name+'</h3><p>'+c.relation+' · Il y a '+c.lastContact+'j</p>'+(c.health!=='healthy'?'<div style="display:flex;gap:6px;margin-top:6px"><button class="alert-btn primary" onclick="simCall(\''+c.name+'\')"><i class="fas fa-phone"></i> Appeler</button><button class="alert-btn secondary"><i class="fas fa-comment"></i> Message</button></div>':'')+'</div><span class="contact-status '+st[c.health].c+'">'+st[c.health].t+'</span></div>').join('')}
function renderGhost(){const sc={completed:'task-completed',progress:'task-progress',available:'task-pending'};g('ghostBox').innerHTML=A.ghostTasks.map(t=>'<div class="ghost-task"><div class="ghost-task-header"><div class="ghost-task-icon" style="background:'+t.bg+'">'+t.icon+'</div><span class="ghost-task-status '+sc[t.st]+'">'+t.stl+'</span></div><h3 style="font-size:14px;font-weight:600;margin-bottom:4px">'+t.title+'</h3><p style="font-size:12px;color:var(--text-secondary)">'+t.desc+'</p>'+(t.sav?'<div class="ghost-savings"><i class="fas fa-piggy-bank"></i><span>'+t.sav+'</span></div>':t.st==='available'?'<div style="margin-top:10px"><button class="alert-btn primary" onclick="pickTask()"><i class="fas fa-plus"></i> Choisir</button></div>':'')+'</div>').join('')}
function renderConn(){g('connDevices').innerHTML=A.devices.length?A.devices.map(id=>{const d=DEVICES_DATA.find(x=>x.id===id);return d?'<div class="device-found connected"><div class="device-icon">'+d.icon+'</div><div class="device-info"><h4>'+d.name+'</h4><p>'+d.type+' · Connecté</p></div><button class="device-btn connected-btn">✅</button></div>':''}).join(''):'<p style="color:var(--text-muted);font-size:13px;padding:12px">Aucun appareil</p>';renderAppConn('connApps');g('connPerms').innerHTML=PERMS_DATA.map(p=>{const ok=A.perms[p.id];return'<div class="perm-card '+(ok?'granted':'')+'" onclick="requestPerm(\''+p.id+'\',\''+(p.api||'')+'\')"><div class="perm-icon" style="background:'+p.bg+'">'+p.icon+'</div><div class="perm-info"><h3>'+p.name+'</h3><p>'+p.desc+'</p></div><div class="perm-status '+(ok?'ok':'pending')+'">'+(ok?'<i class="fas fa-check"></i>':'<i class="fas fa-chevron-right"></i>')+'</div></div>'}).join('')}

// NAVIGATION
function navigateTo(page){A.page=page;const map={home:'pageHome',shield:'pageShield',predictions:'pagePred',social:'pageSocial',ghost:'pageGhost',connections:'pageConn',settings:'pageSettings'},navMap={home:'home',shield:'shield',predictions:'predictions',social:'social',ghost:'settings',connections:'settings',settings:'settings'};document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));const tp=g(map[page]);if(tp)tp.classList.add('active');document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));const an=document.querySelector('.nav-item[data-page="'+navMap[page]+'"]');if(an)an.classList.add('active');if(page==='shield')setTimeout(()=>g('attBar').style.width='78%',300);if(page==='connections')renderConn();g('pagesWrapper').scrollTo({top:0,behavior:'smooth'})}

// INTERACTIONS
function toggleCheck(el){el.classList.toggle('checked');el.innerHTML=el.classList.contains('checked')?'<i class="fas fa-check"></i>':'';el.parentElement.style.opacity=el.classList.contains('checked')?'.5':'1'}
function toggleMode(el){el.classList.toggle('on');toast(el.classList.contains('on')?'✅':'⭕',el.classList.contains('on')?'Mode activé':'Mode désactivé')}
g('notifBtn').onclick=()=>{g('notifPanel').classList.add('open');g('notifOverlay').classList.add('open')};
g('notifClose').onclick=g('notifOverlay').onclick=()=>{g('notifPanel').classList.remove('open');g('notifOverlay').classList.remove('open');A.notifs.forEach(n=>n.u=false);g('notifCount').style.display='none'};
g('avatarBtn').onclick=()=>navigateTo('settings');
g('modalBack').onclick=()=>g('detailModal').classList.remove('open');
function showModal(title,content){g('modalTitle').textContent=title;g('modalBody').innerHTML='<div style="padding:20px 0"><p style="color:var(--text-secondary);line-height:1.6;font-size:14px">'+content+'</p></div>';g('detailModal').classList.add('open')}
function simCall(name){toast('📞','Appel vers '+name+'...');const c=A.user.contacts.find(x=>x.name===name);if(c){c.lastContact=0;c.health='healthy';renderSocial()}}
function pickTask(){const tasks=['Déclaration impôts','RDV médical','Contestation facture','Comparaison forfait','Renégociation abonnement'];showModal('🤖 Choisir tâche',tasks.map(t=>'<div style="padding:14px;background:var(--bg-card);border-radius:10px;border:var(--border-subtle);margin-bottom:8px;cursor:pointer" onclick="selectTask(\''+t+'\')"><strong>'+t+'</strong></div>').join(''))}
function selectTask(t){A.ghostTasks[1]={icon:'⏳',bg:'rgba(59,130,246,.15)',title:t,desc:'IA en cours. Résultat 24-48h.',st:'progress',stl:'🔄 En cours',sav:null};renderGhost();g('detailModal').classList.remove('open');toast('🤖',t+' — en cours');g('ghostSum').textContent='2 tâches ce mois';g('ghostBdg').textContent='2/2'}
function showUpgrade(){showModal('💎 CLAIRVOYANCE','<div style="text-align:center"><div style="font-size:50px;margin-bottom:12px">💎</div><p style="color:var(--accent-yellow);font-size:18px;font-weight:700;margin-bottom:16px">9,99€/mois</p>'+['Alertes illimitées','Tous modules','Ghost-Admin 20 tâches','Négociateur auto','Prédictions J+90','Matching symbiotique','Prédict-Carrière'].map(f=>'<div style="display:flex;align-items:center;gap:8px;padding:8px;background:rgba(124,58,237,.08);border-radius:8px;margin-bottom:6px;font-size:13px"><span style="color:var(--accent-green)">✅</span>'+f+'</div>').join('')+'<button style="width:100%;padding:14px;background:var(--gradient-main);border:none;border-radius:10px;color:white;font-size:15px;font-weight:700;margin-top:16px;cursor:pointer">Débloquer</button><p style="font-size:11px;color:var(--text-muted);margin-top:8px">Annulable · Remboursé 30j</p></div>')}
function openDeviceScan(){showModal('📡 Scanner','<div style="text-align:center;padding:20px"><div style="font-size:50px;margin-bottom:16px">📡</div><p style="color:var(--text-secondary)">Activez le Bluetooth...</p><div style="margin-top:20px">'+DEVICES_DATA.map(d=>'<div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-card);border-radius:10px;margin-bottom:8px;border:var(--border-subtle)"><span style="font-size:24px">'+d.icon+'</span><div style="flex:1;text-align:left"><strong style="font-size:13px">'+d.name+'</strong><br><span style="font-size:11px;color:var(--text-secondary)">'+d.type+'</span></div><button class="alert-btn primary" onclick="toast(\'⌚\',\''+d.name+' connecté !\');A.devices.push(\''+d.id+'\')">Lier</button></div>').join('')+'</div></div>')}
function analyzeContent(){const input=g('checkInput').value,res=g('checkResult');if(!input.trim()){res.style.display='block';res.innerHTML='<p style="color:var(--accent-red)">Entrez un lien ou texte.</p>';return}res.style.display='block';res.innerHTML='<div class="shimmer" style="height:100px;border-radius:10px"></div>';setTimeout(()=>{const r=Math.floor(Math.random()*40)+55,df=Math.random()>.8?'⚠️ POSITIF':'✅ NÉGATIF',b=['Biais confirmation','Cadrage émotionnel','Aucun biais','Appel à la peur'][Math.floor(Math.random()*4)];res.innerHTML='<div style="background:var(--bg-card);border-radius:10px;padding:14px;border:var(--border-subtle)"><h4 style="color:var(--accent-cyan);margin-bottom:10px">🛡️ Résultat</h4><div style="margin-bottom:6px"><span style="font-size:12px;color:var(--text-muted)">Fiabilité</span><div style="display:flex;align-items:center;gap:6px;margin-top:3px"><div style="flex:1;height:6px;background:var(--bg-secondary);border-radius:3px;overflow:hidden"><div style="width:'+r+'%;height:100%;background:'+(r>70?'var(--accent-green)':'var(--accent-yellow)')+';border-radius:3px"></div></div><span style="font-size:13px;font-weight:700;color:'+(r>70?'var(--accent-green)':'var(--accent-yellow)')+'">'+r+'%</span></div></div><div style="font-size:12px;margin-bottom:4px"><span style="color:var(--text-muted)">Deepfake :</span> <strong>'+df+'</strong></div><div style="font-size:12px"><span style="color:var(--text-muted)">Biais :</span> <strong style="color:var(--accent-yellow)">'+b+'</strong></div></div>'},2000)}
function toast(icon,text){const t=document.createElement('div');t.className='toast';t.innerHTML='<span class="toast-icon">'+icon+'</span><span class="toast-text">'+text+'</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>';g('toastContainer').appendChild(t);setTimeout(()=>{if(t.parentElement)t.remove()},4000)}

// SW
if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{})}

// SWIPE
let tx=0;document.addEventListener('touchstart',e=>tx=e.changedTouches[0].screenX);document.addEventListener('touchend',e=>{const d=e.changedTouches[0].screenX-tx;if(Math.abs(d)<80)return;const pages=['home','shield','predictions','social','settings'],ci=pages.indexOf(A.page);if(d<0&&ci<pages.length-1)navigateTo(pages[ci+1]);else if(d>0&&ci>0)navigateTo(pages[ci-1])});