// ── WORLD HOLIDAYS MODULE ──────────────────────────────────
const WH_WATCHLIST = ['GR','NL','DE','CN','US','TR','AE','SG','GB','BE','FR','IT','JP','IN','BR'];
const WH_NAMES = {GR:'Greece',NL:'Netherlands',DE:'Germany',CN:'China',US:'United States',TR:'Turkey',AE:'UAE',SG:'Singapore',GB:'United Kingdom',BE:'Belgium',FR:'France',IT:'Italy',JP:'Japan',IN:'India',BR:'Brazil'};

let wh_all=[], wh_today=[], wh_week=[], wh_byT={}, wh_byW={};
let wh_tab='today', wh_detail=null;

function wh_toDS(d){ return d.toISOString().slice(0,10); }
function wh_weekRange(){
  const n=new Date(), day=n.getDay(), mon=new Date(n);
  mon.setDate(n.getDate()-((day+6)%7)); mon.setHours(0,0,0,0);
  const sun=new Date(mon); sun.setDate(mon.getDate()+6); sun.setHours(23,59,59,999);
  return {mon,sun};
}
function wh_cname(cc){ return WH_NAMES[cc]||cc; }

function wh_initPage(){
  const dateEl = document.getElementById('holidaysDate');
  if(dateEl){ const n=new Date(); dateEl.textContent=n.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}); }
  const root = document.getElementById('holidays-root');
  if(!root||root.dataset.init) return;
  root.dataset.init='1';
  root.innerHTML = `
    <div class="holidays-layout">
      <div class="holidays-map-wrap" id="wh-map-wrap">
        <div id="wh-loading" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:13px;color:var(--text-3)">Loading...</div>
        <svg id="wh-svg" viewBox="0 0 960 500" style="width:100%;display:block;flex:1;"></svg>
        <div id="wh-tt" style="position:absolute;background:var(--bg-1);border:1px solid var(--border);border-radius:var(--radius);padding:7px 10px;font-size:12px;pointer-events:none;display:none;max-width:200px;z-index:10;">
          <strong id="wh-tt-c" style="display:block;font-size:13px;margin-bottom:3px;color:var(--text);font-family:var(--font)"></strong>
          <span id="wh-tt-i" style="color:var(--text-2);white-space:pre-line;line-height:1.5;font-size:11px;font-family:var(--font)"></span>
        </div>
        <div class="wh-legend">
          <span class="wh-leg"><span class="wh-dot" style="background:#378ADD"></span>Holiday today</span>
          <span class="wh-leg"><span class="wh-dot" style="background:var(--border-2)"></span>No holiday today</span>
        </div>
      </div>
      <div class="holidays-side">
        <div class="wh-stats">
          <div class="wh-stat"><div class="wh-stat-n" id="wh-s1">-</div><div class="wh-stat-l">today</div></div>
          <div class="wh-stat"><div class="wh-stat-n" id="wh-s2">-</div><div class="wh-stat-l">this week</div></div>
          <div class="wh-stat"><div class="wh-stat-n" id="wh-s3">-</div><div class="wh-stat-l">countries</div></div>
        </div>
        <div class="wh-status-bar"><span id="wh-status">Loading...</span><button class="wh-refresh" onclick="wh_load()">refresh</button></div>
        <div id="wh-main">
          <div class="wh-tabs">
            <button class="wh-tab on" id="wh-tab-today" onclick="wh_setTab('today')">Today</button>
            <button class="wh-tab" id="wh-tab-week" onclick="wh_setTab('week')">This week</button>
            <button class="wh-tab" id="wh-tab-watch" onclick="wh_setTab('watch')">Watchlist</button>
          </div>
          <input class="wh-search" id="wh-q" placeholder="Search..." oninput="wh_render()">
          <div class="wh-list" id="wh-list"></div>
        </div>
        <div id="wh-det" style="display:none;flex:1;overflow-y:auto;padding:14px;">
          <div id="wh-det-inner"></div>
        </div>
      </div>
    </div>`;
  wh_loadLibraries();
}

function wh_loadLibraries(){
  const scripts = [
    'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/topojson/3.0.2/topojson.min.js'
  ];
  let loaded=0;
  scripts.forEach(src=>{
    if(document.querySelector('script[src="'+src+'"]')){ loaded++; if(loaded===scripts.length) wh_initMap(); return; }
    const s=document.createElement('script'); s.src=src;
    s.onload=()=>{ loaded++; if(loaded===scripts.length) wh_initMap(); };
    document.head.appendChild(s);
  });
}

const WH_I2N={AF:4,AL:8,DZ:12,AD:20,AO:24,AG:28,AR:32,AM:51,AU:36,AT:40,AZ:31,BS:44,BH:48,BD:50,BB:52,BY:112,BE:56,BZ:84,BJ:204,BT:64,BO:68,BA:70,BW:72,BR:76,BN:96,BG:100,BF:854,BI:108,CV:132,KH:116,CM:120,CA:124,CF:140,TD:148,CL:152,CN:156,CO:170,KM:174,CG:178,CD:180,CR:188,CI:384,HR:191,CU:192,CY:196,CZ:203,DK:208,DJ:262,DM:212,DO:214,EC:218,EG:818,SV:222,GQ:226,ER:232,EE:233,SZ:748,ET:231,FJ:242,FI:246,FR:250,GA:266,GM:270,GE:268,DE:276,GH:288,GR:300,GD:308,GT:320,GN:324,GW:624,GY:328,HT:332,HN:340,HU:348,IS:352,IN:356,ID:360,IR:364,IQ:368,IE:372,IL:376,IT:380,JM:388,JP:392,JO:400,KZ:398,KE:404,KI:296,KW:414,KG:417,LA:418,LV:428,LB:422,LS:426,LR:430,LY:434,LI:438,LT:440,LU:442,MG:450,MW:454,MY:458,MV:462,ML:466,MT:470,MH:584,MR:478,MU:480,MX:484,FM:583,MD:498,MC:492,MN:496,ME:499,MA:504,MZ:508,MM:104,NA:516,NR:520,NP:524,NL:528,NZ:554,NI:558,NE:562,NG:566,NO:578,OM:512,PK:586,PW:585,PA:591,PG:598,PY:600,PE:604,PH:608,PL:616,PT:620,QA:634,RO:642,RU:643,RW:646,KN:659,LC:662,VC:670,WS:882,SM:674,ST:678,SA:682,SN:686,RS:688,SC:690,SL:694,SG:702,SK:703,SI:705,SB:90,SO:706,ZA:710,SS:728,ES:724,LK:144,SD:729,SR:740,SE:752,CH:756,SY:760,TW:158,TJ:762,TZ:834,TH:764,TL:626,TG:768,TO:776,TT:780,TN:788,TR:792,TM:795,TV:798,UG:800,UA:804,AE:784,GB:826,US:840,UY:858,UZ:860,VU:548,VE:862,VN:704,YE:887,ZM:894,ZW:716,MK:807,XK:383};
const WH_N2I={};
Object.entries(WH_I2N).forEach(([k,v])=>{ if(!WH_N2I[v]) WH_N2I[v]=k; });

function wh_initMap(){
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world=>{
    const svg=d3.select('#wh-svg');
    const proj=d3.geoNaturalEarth1().scale(153).translate([480,250]);
    const path=d3.geoPath(proj);
    svg.selectAll('path.wh-country')
      .data(topojson.feature(world,world.objects.countries).features)
      .join('path').attr('class','wh-country')
      .attr('d',path).attr('fill','var(--border-2)')
      .style('cursor','pointer').style('stroke','var(--bg-1)').style('stroke-width','0.4')
      .on('mousemove',function(ev,d){
        const cc=WH_N2I[+d.id];
        const sr=document.getElementById('wh-svg').getBoundingClientRect();
        const tt=document.getElementById('wh-tt');
        tt.style.left=Math.min(ev.clientX-sr.left+10,sr.width-210)+'px';
        tt.style.top=Math.max(ev.clientY-sr.top-60,4)+'px';
        tt.style.display='block';
        document.getElementById('wh-tt-c').textContent=cc?wh_cname(cc):'Unknown';
        const td=wh_toDS(new Date());
        const hT=cc?(wh_byT[cc]||[]):[], hW=cc?(wh_byW[cc]||[]).filter(h=>h.date!==td):[];
        if(!cc||(!hT.length&&!hW.length)){ document.getElementById('wh-tt-i').textContent='No holiday this week'; }
        else { let s=''; hT.forEach(h=>s+='* '+h.name+' (today)\n'); hW.forEach(h=>s+='o '+h.name+' ('+h.date.slice(5)+')\n'); document.getElementById('wh-tt-i').textContent=s.trim(); }
      })
      .on('mouseleave',()=>{ document.getElementById('wh-tt').style.display='none'; })
      .on('click',(ev,d)=>{ const cc=WH_N2I[+d.id]; if(cc) wh_showDetail(cc); });
    document.getElementById('wh-loading').style.display='none';
    wh_load();
  }).catch(()=>{ document.getElementById('wh-loading').textContent='Map unavailable'; wh_load(); });
}

function wh_paintMap(){
  if(typeof d3==='undefined') return;
  d3.selectAll('.wh-country').each(function(d){
    const cc=WH_N2I[+d.id];
    d3.select(this).attr('fill',cc&&wh_byT[cc]?'#378ADD':'var(--border-2)');
  });
}

async function wh_load(){
  const statusEl=document.getElementById('wh-status');
  if(statusEl) statusEl.textContent='Loading...';
  try{
    const r=await fetch('https://date.nager.at/api/v3/NextPublicHolidaysWorldwide');
    if(!r.ok) throw new Error();
    wh_all=await r.json();
    const td=wh_toDS(new Date()),{mon,sun}=wh_weekRange();
    wh_today=wh_all.filter(h=>h.date===td);
    wh_week=wh_all.filter(h=>{ const d=new Date(h.date+'T00:00:00'); return d>=mon&&d<=sun; });
    wh_byT={}; wh_today.forEach(h=>{ if(!wh_byT[h.countryCode]) wh_byT[h.countryCode]=[]; wh_byT[h.countryCode].push(h); });
    wh_byW={}; wh_week.forEach(h=>{ if(!wh_byW[h.countryCode]) wh_byW[h.countryCode]=[]; wh_byW[h.countryCode].push(h); });
    const s1=document.getElementById('wh-s1'), s2=document.getElementById('wh-s2'), s3=document.getElementById('wh-s3');
    if(s1) s1.textContent=wh_today.length;
    if(s2) s2.textContent=wh_week.length;
    if(s3) s3.textContent=new Set(wh_week.map(h=>h.countryCode)).size;
    if(statusEl) statusEl.textContent='Updated '+new Date().toLocaleTimeString();
    wh_paintMap();
    wh_render();
  }catch(e){
    if(statusEl) statusEl.textContent='Error loading data';
  }
}

function wh_setTab(t){
  wh_tab=t; wh_detail=null;
  ['today','week','watch'].forEach(x=>{ document.getElementById('wh-tab-'+x).classList.toggle('on',x===t); });
  document.getElementById('wh-main').style.display='';
  document.getElementById('wh-det').style.display='none';
  document.getElementById('wh-q').value='';
  wh_render();
}

function wh_render(){
  const q=document.getElementById('wh-q').value.toLowerCase();
  const td=wh_toDS(new Date());
  let rows=[];
  if(wh_tab==='today'){
    rows=wh_today.filter(h=>!q||h.countryCode.toLowerCase().includes(q)||h.name.toLowerCase().includes(q));
    rows.sort((a,b)=>{ const ai=WH_WATCHLIST.indexOf(a.countryCode),bi=WH_WATCHLIST.indexOf(b.countryCode); if(ai>=0&&bi<0)return -1; if(bi>=0&&ai<0)return 1; return a.countryCode.localeCompare(b.countryCode); });
  } else if(wh_tab==='week'){
    rows=wh_week.filter(h=>!q||h.countryCode.toLowerCase().includes(q)||h.name.toLowerCase().includes(q));
    rows.sort((a,b)=>{ const ai=WH_WATCHLIST.indexOf(a.countryCode),bi=WH_WATCHLIST.indexOf(b.countryCode); if(ai>=0&&bi<0)return -1; if(bi>=0&&ai<0)return 1; if(a.date!==b.date)return a.date.localeCompare(b.date); return a.countryCode.localeCompare(b.countryCode); });
  } else {
    WH_WATCHLIST.forEach(cc=>{
      const hols=wh_byW[cc]||[];
      if(!q||cc.toLowerCase().includes(q)||(WH_NAMES[cc]||'').toLowerCase().includes(q)||hols.some(h=>h.name.toLowerCase().includes(q))){
        if(hols.length) hols.forEach(h=>rows.push(h));
        else rows.push({countryCode:cc,_empty:true});
      }
    });
  }
  const list=document.getElementById('wh-list');
  if(!list) return;
  if(!rows.length){ list.innerHTML='<div style="padding:20px;text-align:center;font-size:13px;color:var(--text-3)">No holidays found.</div>'; return; }
  list.innerHTML=rows.map(h=>{
    if(h._empty) return '<div class="wh-item" style="opacity:0.4;cursor:default"><div class="wh-item-name">'+wh_cname(h.countryCode)+'</div><div class="wh-item-sub">No holiday this week</div></div>';
    const isT=h.date===td, isB=(h.types||[]).includes('Bank'), isN=h.global;
    const badges=(isT?'<span class="wh-badge wh-b-today">today</span>':'')+(isB?'<span class="wh-badge wh-b-bank">bank</span>':'')+(isN?'<span class="wh-badge wh-b-nat">national</span>':'');
    return '<div class="wh-item" onclick="wh_showDetail(\''+h.countryCode+'\')"><div class="wh-item-top"><span class="wh-item-name">'+wh_cname(h.countryCode)+'</span>'+badges+'</div><div class="wh-item-sub">'+h.name+(h.localName&&h.localName!==h.name?' - '+h.localName:'')+'</div><div class="wh-item-date">'+h.date+'</div></div>';
  }).join('');
}

function wh_showDetail(cc){
  wh_detail=cc;
  const td=wh_toDS(new Date()),{mon,sun}=wh_weekRange();
  const thH=wh_all.filter(h=>h.countryCode===cc&&h.date===td);
  const twH=wh_all.filter(h=>{ const d=new Date(h.date+'T00:00:00'); return h.countryCode===cc&&d>=mon&&d<=sun&&h.date!==td; });
  let html='<button class="wh-back-btn" onclick="wh_backToList()">back</button>'
    +'<p class="wh-detail-title">'+wh_cname(cc)+'</p>';
  if(thH.length){
    html+='<div class="wh-detail-section-label" style="color:var(--accent-2)">Today</div>';
    html+=thH.map(h=>'<div class="wh-detail-item"><div class="wh-detail-name">'+h.name+'</div>'+(h.localName&&h.localName!==h.name?'<div class="wh-detail-local">'+h.localName+'</div>':'')+'<div class="wh-detail-meta">'+h.date+' - '+(h.types||['Public']).join(', ')+'</div></div>').join('');
  }
  if(twH.length){
    html+='<div class="wh-detail-section-label" style="color:var(--green)">This week</div>';
    html+=twH.map(h=>'<div class="wh-detail-item"><div class="wh-detail-name">'+h.name+'</div>'+(h.localName&&h.localName!==h.name?'<div class="wh-detail-local">'+h.localName+'</div>':'')+'<div class="wh-detail-meta">'+h.date+' - '+(h.types||['Public']).join(', ')+'</div></div>').join('');
  }
  if(!thH.length&&!twH.length) html+='<div style="padding:16px 0;text-align:center;font-size:13px;color:var(--text-3)">No holidays today or this week.</div>';
  document.getElementById('wh-det-inner').innerHTML=html;
  document.getElementById('wh-main').style.display='none';
  document.getElementById('wh-det').style.display='block';
}

function wh_backToList(){
  wh_detail=null;
  document.getElementById('wh-main').style.display='';
  document.getElementById('wh-det').style.display='none';
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.nav-item[data-page="holidays"], .tool-btn[data-page="holidays"]').forEach(el=>{
    el.addEventListener('click',()=>setTimeout(wh_initPage,50));
  });
});
