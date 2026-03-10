/* SIXIÈME SENS — Security Integration v2.0 */
'use strict';

(function(){
    const pinExists=SixSecurity.init();

    // Override saveAndLaunch to add PIN setup
    const _orig=window.saveAndLaunch;
    window.saveAndLaunch=function(){
        if(!SixSecurity.isPIN()){
            LockScreen.show('setup',async function(){
                try{
                    await SixSecurity.Storage.set('userData',A.user);
                    await SixSecurity.Storage.set('perms',A.perms);
                    await SixSecurity.Storage.set('devices',A.devices);
                    await SixSecurity.Storage.set('apps',A.apps);
                    toast('🔐','Données chiffrées AES-256');
                }catch(e){console.error(e)}
                localStorage.setItem('6s_v2',JSON.stringify(A));
                launchApp();
            });
        }else{if(_orig)_orig();else{localStorage.setItem('6s_v2',JSON.stringify(A));launchApp()}}
    };

    // On load: check PIN
    window.addEventListener('load',function(){
        if(pinExists&&SixSecurity.isLocked()){
            setTimeout(function(){
                LockScreen.show('unlock',async function(){
                    try{
                        const ud=await SixSecurity.Storage.get('userData');
                        if(ud){A.user=ud;localStorage.setItem('6s_v2',JSON.stringify(A))}
                        toast('✅','Session déverrouillée');
                    }catch(e){console.error(e)}
                    launchApp();
                });
            },100);
        }
    });

    // Auto-lock listener
    window.addEventListener('6s-locked',function(){
        LockScreen.show('unlock',async function(){
            try{const ud=await SixSecurity.Storage.get('userData');if(ud)A.user=ud;toast('🔓','Session restaurée')}catch(e){}
        });
    });

    // Auto-save encrypted on render
    const _rh=window.renderHome;
    if(typeof _rh==='function'){
        window.renderHome=function(){
            _rh();
            if(!SixSecurity.isLocked()){
                SixSecurity.Storage.set('userData',A.user).catch(()=>{});
                SixSecurity.Storage.set('state',{scores:A.scores,ts:Date.now()}).catch(()=>{});
            }
        };
    }

    // Sanitize inputs on blur
    document.addEventListener('blur',function(e){
        if(e.target.tagName==='INPUT'&&e.target.type==='text'){
            e.target.value=SixSecurity.Sanitizer.clean(e.target.value);
        }
    },true);

    // Add security section to settings
    setTimeout(function(){
        const slot=document.getElementById('securitySettingsSlot');
        if(!slot)return;
        slot.innerHTML=`<div class="settings-section"><h3>🔐 Sécurité</h3>
        <div class="settings-item" onclick="SixSecurity.lock();LockScreen.show('setup',function(){toast('🔐','PIN modifié')})"><i class="fas fa-key" style="color:var(--accent-purple)"></i><span>Changer le PIN</span><i class="fas fa-chevron-right chevron"></i></div>
        <div class="settings-item" onclick="viewAuditLog()"><i class="fas fa-list-alt" style="color:var(--accent-purple)"></i><span>Journal sécurité</span><span style="color:var(--text-muted);font-size:11px" id="auditCnt">${SixSecurity.getAudit().length}</span></div>
        <div class="settings-item" onclick="SixSecurity.lock();SixSecurity.audit('MANUAL_LOCK',{})"><i class="fas fa-lock" style="color:var(--accent-yellow)"></i><span>Verrouiller</span></div>
        <div class="settings-item" onclick="doExport()" style="background:rgba(16,185,129,.05)"><i class="fas fa-file-export" style="color:var(--accent-green)"></i><span>Export chiffré (RGPD)</span></div>
        </div>`;
    },1500);

    window.viewAuditLog=function(){
        const logs=SixSecurity.getAudit().slice(-50).reverse();
        const icons={PIN_SET:'🔐',UNLOCK_OK:'🔓',UNLOCK_FAIL:'❌',LOCKED_OUT:'⛔',AUTO_LOCK:'🔒',BG_LOCK:'🔒',WIPED:'🗑️',EXPORTED:'📤',WRITE:'💾',READ:'📖',INTEGRITY_FAIL:'🚨',BLOCKED_KEY:'🚫',RATE_LIM:'⏳',INIT:'🚀',SESSION_EXP:'⏰',HIDDEN:'👁️',MANUAL_LOCK:'🔒'};
        const html=logs.length?logs.map(l=>'<div style="padding:10px;border-bottom:1px solid rgba(124,58,237,.08);display:flex;gap:8px"><span style="font-size:16px">'+(icons[l.ev]||'📋')+'</span><div style="flex:1"><div style="font-size:12px;font-weight:600">'+l.ev.replace(/_/g,' ')+'</div><div style="font-size:10px;color:var(--text-muted)">'+new Date(l.ts).toLocaleString('fr-FR')+'</div></div></div>').join(''):'<p style="text-align:center;color:var(--text-muted);padding:40px">Aucun événement</p>';
        showModal('📋 Journal sécurité','<div style="max-height:60vh;overflow-y:auto;border-radius:10px;background:var(--bg-card)">'+html+'</div><button style="width:100%;padding:12px;background:rgba(239,68,68,.1);border:none;border-radius:8px;color:var(--accent-red);font-size:13px;font-weight:600;margin-top:12px;cursor:pointer;font-family:Inter,sans-serif" onclick="SixSecurity.clearAudit();toast(\'🗑️\',\'Journal effacé\');document.getElementById(\'detailModal\').classList.remove(\'open\')">Effacer le journal</button>');
    };

    window.doExport=async function(){try{await SixSecurity.exportData();toast('📤','Données exportées !')}catch(e){toast('❌',e.message)}};

    // Block unauthorized fetch
    if(window.fetch){const _f=window.fetch;window.fetch=function(u,o){const ok=['fonts.googleapis.com','fonts.gstatic.com','cdnjs.cloudflare.com',location.hostname];if(typeof u==='string'){try{const p=new URL(u,location.origin);if(!ok.some(d=>p.hostname.includes(d))){SixSecurity.audit('BLOCKED_REQ',{h:p.hostname});return Promise.reject(new Error('Blocked'))}}catch(e){}}return _f.call(this,u,o)}}

})();