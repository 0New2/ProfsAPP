// ── CONSTANTES ──
var T = new Date();
var MO  = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
var MS2 = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
var DF  = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
var DN_SHORT = ['Lun','Mar','Mer','Jeu','Ven'];
var COLS = ['#7A5C48','#A07858','#C4956A','#5A7848','#486878','#784858'];
var PCLS = ['py','pp','pb','pg','pl','po'];
var PCHX = ['#FFE55A','#FF9EC8','#82CCEE','#7DD87A','#B8A0FF','#FFA040'];
var AVCL = ['#7A5C48','#A07858','#C4956A','#486878','#784858','#5A7848'];
var NPC  = {PS:'nps',MS:'nms',GS:'ngs',TPS:'nps'};
var PERIODES = [
  {id:'P1',lbl:'P1 — Sep/Oct'},{id:'P2',lbl:'P2 — Nov/Déc'},
  {id:'P3',lbl:'P3 — Jan/Fév'},{id:'P4',lbl:'P4 — Mar/Avr'},
  {id:'P5',lbl:'P5 — Mai/Juin'}
];
var SLOTS = [
  {h:'08:00',lbl:'8h'},{h:'08:30',lbl:'8h30'},{h:'09:00',lbl:'9h'},
  {h:'09:30',lbl:'9h30'},{h:'10:00',lbl:'10h'},{h:'10:30',lbl:'10h30'},
  {h:'11:00',lbl:'11h'},{h:'11:30',lbl:'11h30'},
  {h:'BREAK',lbl:'☕'},
  {h:'13:00',lbl:'13h'},{h:'13:30',lbl:'13h30'},{h:'14:00',lbl:'14h'},
  {h:'14:30',lbl:'14h30'},{h:'15:00',lbl:'15h'},{h:'15:30',lbl:'15h30'},
  {h:'16:00',lbl:'16h'},{h:'16:30',lbl:'16h30'},{h:'17:00',lbl:'17h'}
];
var TP_HOURS  = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
var TP_DUREES = [{lbl:'15 min',val:'15'},{lbl:'30 min',val:'30'},{lbl:'45 min',val:'45'},{lbl:'1 h',val:'60'},{lbl:'1 h 30',val:'90'},{lbl:'2 h',val:'120'},{lbl:'2 h 30',val:'150'},{lbl:'3 h',val:'180'}];
var DEFAULT_TPLS = [
  {emoji:'🎨',name:'Peinture',color:'#C4956A',desc:'Pinceaux, peinture, tabliers.'},
  {emoji:'📚',name:'Lecture',color:'#7A5C48',desc:'Album de jeunesse. Compréhension et vocabulaire.'},
  {emoji:'🔢',name:'Numération',color:'#5A7848',desc:'Comptage, reconnaissance des chiffres.'},
  {emoji:'✏️',name:'Écriture',color:'#486878',desc:'Graphisme, tenue du crayon, tracés dirigés.'},
  {emoji:'✂️',name:'Découpage',color:'#A07858',desc:'Ciseaux adaptés, formes simples, motricité fine.'},
  {emoji:'🏺',name:'Modelage',color:'#784858',desc:'Pâte à modeler ou argile.'},
  {emoji:'🎵',name:'Musique',color:'#486878',desc:'Instruments, comptines, écoute musicale.'},
  {emoji:'🧮',name:'Jeux logiques',color:'#5A7848',desc:'Tri, classement, sériations, puzzles.'},
  {emoji:'🌱',name:'Sciences',color:'#5A7848',desc:'Observation, expérimentation simple.'},
  {emoji:'💪',name:'Motricité',color:'#C4956A',desc:'Parcours moteur, équilibre, coordination.'},
  {emoji:'🔤',name:'Phono',color:'#7A5C48',desc:'Syllabes, rimes, sons.'},
  {emoji:'💬',name:'Langage oral',color:'#786878',desc:'Raconte, décrit, échange.'},
  {emoji:'📝',name:'Copie',color:'#486878',desc:'Copie de prénoms, mots simples.'},
  {emoji:'🧩',name:'Jeux symboliques',color:'#784858',desc:'Coin cuisine, marionnettes, jeu de rôles.'},
  {emoji:'📖',name:'Bibliothèque',color:'#7A5C48',desc:'Lecture autonome, albums, documentaires.'},
  {emoji:'🖼️',name:'Arts plastiques',color:'#A07858',desc:'Collage, empreintes, techniques mixtes.'},
];

// ── ÉTAT ──
var cY = T.getFullYear(), cM = T.getMonth();
var sD = {d:T.getDate(), m:T.getMonth(), y:T.getFullYear()};
var sC = COLS[0], sE = '';
var jView = 'month', wOff = 0;
var tsActive = null, curEI = -1;
var openT = new Set();
var dsLPT = null;
var curEleveIdx = -1, curPeriod = 0;
var tplColor = COLS[0], tplEmoji = '';
var tpSelH = 2, tpSelD = 1, tpScrollT = null;
var tplEmojiIdx = 0;

// ── UTILS DOM ──
function el(tag,cls,txt) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (txt !== undefined) e.textContent = txt;
  return e;
}
function div(cls,txt) { return el('div',cls,txt); }
function btn(cls,txt,fn) { var b = el('button',cls,txt); if (fn) b.onclick = fn; return b; }
function dk(y,m,d) { return y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }

function showToast(msg, ms) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, ms || 2000);
}

// ── NAVIGATION ──
function sw(tab) {
  document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
  document.getElementById('nav-' + tab).classList.add('active');
  document.querySelectorAll('.view').forEach(function(v) { v.classList.remove('active'); });
  document.getElementById('view-' + tab).classList.add('active');
  document.getElementById('todayBtn').style.display = tab === 'journal' ? '' : 'none';
  var vb = document.getElementById('viewBar');
  if (vb) vb.classList.toggle('visible', tab === 'journal');
  if (tab === 'notes')  rPits();
  if (tab === 'ecole')  rEcole();
  if (tab === 'classe') renderClasse();
  if (tab === 'commu')  loadCommuFeed();
  updateBadges();
}

function updateBadges() {
  var today = dk(T.getFullYear(), T.getMonth(), T.getDate());
  var tc = (AT[today] || []).length;
  var jb = document.getElementById('badge-journal');
  if (jb) { jb.textContent = tc; jb.classList.toggle('show', tc > 0); }
  var nb = document.getElementById('badge-notes');
  if (nb) { nb.textContent = NOTES.length; nb.classList.toggle('show', NOTES.length > 0); }
  var cb = document.getElementById('badge-classe');
  if (cb) { cb.textContent = EL.length; cb.classList.toggle('show', EL.length > 0); }
}

function swJV(v) {
  jView = v;
  ['month','week','day','period'].forEach(function(x) {
    var b = document.getElementById('vb-' + x); if (b) b.classList.toggle('active', x === v);
    var p = document.getElementById('jv-' + x);  if (p) p.style.display = x === v ? '' : 'none';
  });
  if (v === 'week')  rWeek();
  if (v === 'day')   { tsActive = null; rDay(); }
  if (v === 'period') rPeriod();
}

// ── CALENDRIER ──
function rCal() {
  var g = document.getElementById('calGrid'); if (!g) return; g.innerHTML = '';
  document.getElementById('monLbl').innerHTML = MO[cM] + ' <em>' + cY + '</em>';
  var fd  = new Date(cY,cM,1).getDay();
  var dim = new Date(cY,cM+1,0).getDate();
  var pv  = new Date(cY,cM,0).getDate();
  var off = fd === 0 ? 6 : fd - 1;
  for (var i = off-1; i >= 0; i--) g.appendChild(mkC(pv-i, cM-1, true));
  for (var d = 1; d <= dim; d++)    g.appendChild(mkC(d, cM, false));
  var rem = (off+dim)%7 === 0 ? 0 : 7-(off+dim)%7;
  for (var d2 = 1; d2 <= rem; d2++) g.appendChild(mkC(d2, cM+1, true));
  rDP();
}

function mkC(d, m, oth) {
  var e  = div('dc');
  var rm = oth ? (m<0?11:m>11?0:m) : cM;
  var ry = oth ? (m<0?cY-1:m>11?cY+1:cY) : cY;
  var lst = AT[dk(ry,rm,d)] || [];
  var dow = new Date(ry,rm,d).getDay();
  if (oth) e.classList.add('oth');
  if (dow===0||dow===6) e.classList.add('wk');
  if (d===T.getDate()&&rm===T.getMonth()&&ry===T.getFullYear()) e.classList.add('tod');
  if (sD && d===sD.d && rm===sD.m && ry===sD.y && !oth) e.classList.add('sel');
  var n = div('dn', String(d)); e.appendChild(n);
  if (lst.length) {
    var ds = div('ddts');
    lst.slice(0,3).forEach(function(a) { var dt=div('ddt'); dt.style.background=a.color; ds.appendChild(dt); });
    e.appendChild(ds);
  }
  if (!oth) {
    (function(dd,mm,yy) {
      e.onclick = function() {
        sD = {d:dd,m:mm,y:yy};
        loadAteliersForDate(dk(yy,mm,dd), function() { rCal(); });
      };
      e.addEventListener('mousedown', function() { dsLPT = setTimeout(function() { sD={d:dd,m:mm,y:yy}; openTplSheet(); }, 600); });
      e.addEventListener('mouseup',   function() { clearTimeout(dsLPT); });
      e.addEventListener('mouseleave',function() { clearTimeout(dsLPT); });
      e.addEventListener('touchstart',function(ev) { dsLPT = setTimeout(function() { ev.preventDefault(); sD={d:dd,m:mm,y:yy}; openTplSheet(); }, 500); }, {passive:false});
      e.addEventListener('touchend',  function() { clearTimeout(dsLPT); });
    })(d, rm, ry);
  }
  return e;
}

function goToday() {
  cY=T.getFullYear(); cM=T.getMonth();
  sD={d:T.getDate(),m:T.getMonth(),y:T.getFullYear()};
  rCal();
}
function chM(dir) { cM+=dir; if(cM<0){cM=11;cY--;} if(cM>11){cM=0;cY++;} rCal(); }

// ── PANNEAU JOUR ──
function rDP() {
  if (!sD) return;
  var d=sD.d, m=sD.m, y=sD.y;
  var dow = new Date(y,m,d).getDay();
  document.getElementById('dpDate').textContent = DF[dow===0?6:dow-1]+' '+d+' '+MS2[m];
  var lst = AT[dk(y,m,d)] || [];
  document.getElementById('dpBadge').textContent = lst.length
    ? (lst.length + ' atelier' + (lst.length>1?'s':''))
    : 'Aucun atelier';
  var cont = document.getElementById('atelierList'); cont.innerHTML = '';
  if (!lst.length) { cont.appendChild(div('emptxt','Aucun atelier prévu')); return; }
  lst.forEach(function(a, i) {
    var row  = div('arow');
    var bar  = div('abar'); bar.style.background = a.color; row.appendChild(bar);
    var body = div('arow-body');
    var ico  = div('arow-ico', a.emoji || '');
    if (!a.emoji) { var sp=el('span'); sp.style.cssText='font-size:12px;color:var(--tl)'; sp.textContent='◈'; ico.appendChild(sp); }
    body.appendChild(ico);
    var info = div('arow-info');
    info.appendChild(div('arow-name', a.text));
    var meta = (a.heure||'') + (a.duree ? ' · '+a.duree+'min' : '');
    info.appendChild(div('arow-meta', meta));
    body.appendChild(info);
    var acts = div('arow-acts');
    (function(idx) {
      acts.appendChild(btn('xbtn','✎', function() { openEditModal(idx); }));
      acts.appendChild(btn('xbtn d','×', function() { delA(idx); }));
    })(i);
    row.appendChild(acts);
    cont.appendChild(row);
  });
  updateBadges();
}

function delA(i) {
  var key = dk(sD.y,sD.m,sD.d);
  if (AT[key]) { AT[key].splice(i,1); if (!AT[key].length) delete AT[key]; }
  saveAtelier(key); rDP(); rCal();
  if (jView==='day') rDay();
}

// ── VUE SEMAINE ──
function chW(dir) { wOff += dir; rWeek(); }

function rWeek() {
  var d0  = new Date(sD.y,sD.m,sD.d), dow = d0.getDay();
  var mon = new Date(d0); mon.setDate(d0.getDate()-(dow===0?6:dow-1)+wOff*7);
  var fri = new Date(mon); fri.setDate(mon.getDate()+4);
  var lbl = mon.getDate()+' '+MS2[mon.getMonth()];
  if (mon.getMonth()!==fri.getMonth()) lbl += ' – '+fri.getDate()+' '+MS2[fri.getMonth()];
  else lbl += ' – '+fri.getDate();
  document.getElementById('wgRange').textContent = lbl;
  var grid = document.getElementById('wgGrid'); grid.innerHTML = '';
  // En-têtes
  grid.appendChild(div('wg-corner'));
  for (var i = 0; i < 5; i++) {
    (function(idx) {
      var d = new Date(mon); d.setDate(mon.getDate()+idx);
      var isT = d.toDateString()===T.toDateString();
      var hd  = div('wg-dayhd'+(isT?' today':''));
      var nd  = div('wg-daynum');
      if (isT) { var sp=el('span'); sp.textContent=String(d.getDate()); nd.appendChild(sp); }
      else nd.textContent = String(d.getDate());
      hd.appendChild(nd);
      hd.appendChild(div('wg-dayname', DN_SHORT[idx]));
      var dd=d.getDate(),mm=d.getMonth(),yy=d.getFullYear();
      hd.onclick = function() { sD={d:dd,m:mm,y:yy}; swJV('day'); };
      grid.appendChild(hd);
    })(i);
  }
  // Créneaux
  SLOTS.forEach(function(slot) {
    var isBreak = slot.h === 'BREAK';
    grid.appendChild(div('wg-timelbl'+(isBreak?' break':''), slot.lbl));
    for (var i = 0; i < 5; i++) {
      (function(idx) {
        var d   = new Date(mon); d.setDate(mon.getDate()+idx);
        var isT = d.toDateString()===T.toDateString();
        var key = dk(d.getFullYear(),d.getMonth(),d.getDate());
        var dd=d.getDate(),mm=d.getMonth(),yy=d.getFullYear();
        var cell = div('wg-slot'+(isBreak?' break':'')+(isT?' today-col':''));
        if (idx===4) cell.style.borderRight='none';
        if (!isBreak) {
          var lst    = AT[key] || [];
          var events = lst.filter(function(a) { return a.heure===slot.h; });
          events.forEach(function(a, ei) {
            var aidx = lst.indexOf(a);
            var ev   = div('wg-event');
            ev.style.background = a.color;
            ev.style.top        = (2+ei*22)+'px';
            if (ei>0) cell.style.minHeight = (48+ei*22)+'px';
            if (a.emoji) { var emj=el('span'); emj.textContent=a.emoji; emj.style.marginRight='2px'; ev.appendChild(emj); }
            ev.appendChild(el('span','wg-event-name', a.text));
            (function(k, ai) {
              var del = btn('wg-event-del','×', function(e) { e.stopPropagation(); delWG(k,ai); });
              ev.appendChild(del);
              ev.onclick = function(e) { e.stopPropagation(); sD={d:dd,m:mm,y:yy}; openEditModal(ai); };
            })(key, aidx);
            cell.appendChild(ev);
          });
          cell.appendChild(div('wg-slot-add','+'));
          (function(dd2,mm2,yy2,hh) {
            cell.onclick = function() { quickAddWG(dd2,mm2,yy2,hh); };
          })(dd,mm,yy,slot.h);
        }
        grid.appendChild(cell);
      })(i);
    }
  });
}

function delWG(key, i) {
  if (!AT[key]) return;
  AT[key].splice(i,1); if (!AT[key].length) delete AT[key];
  saveAtelier(key); rWeek(); rCal();
}

function quickAddWG(d, m, y, heure) {
  sD = {d:d, m:m, y:y};
  openTplSheet();
  setTimeout(function() {
    var hIdx = TP_HOURS.indexOf(heure);
    if (hIdx >= 0) {
      tpSelH = hIdx;
      var hInp = document.getElementById('tplHeureIn'); if (hInp) hInp.value = heure;
      var lbl  = document.getElementById('tpLabel');    if (lbl) lbl.textContent = heure;
      var trig = document.getElementById('tpTrigger');  if (trig) trig.classList.add('has-val');
    }
    var title = document.getElementById('tplTitle');
    var dow   = new Date(y,m,d).getDay();
    if (title) title.textContent = DF[dow===0?6:dow-1]+' '+d+' — '+heure;
  }, 60);
}

// ── VUE JOUR ──
function chD(dir) {
  var d = new Date(sD.y,sD.m,sD.d); d.setDate(d.getDate()+dir);
  sD = {d:d.getDate(), m:d.getMonth(), y:d.getFullYear()};
  loadAteliersForDate(dk(sD.y,sD.m,sD.d), function() { tsActive=null; rDay(); });
}

function rDay() {
  var d=sD.d, m=sD.m, y=sD.y;
  var dow = new Date(y,m,d).getDay();
  var lbl = document.getElementById('dayLbl'); lbl.textContent='';
  lbl.appendChild(document.createTextNode(DF[dow===0?6:dow-1]+' '));
  var em=el('em'); em.textContent=String(d); lbl.appendChild(em);
  lbl.appendChild(document.createTextNode(' '+MS2[m]));
  var key=dk(y,m,d), lst=AT[key]||[];
  var tl=document.getElementById('timeline'); tl.innerHTML='';
  if (lst.length) lst.forEach(function(a,i) { tl.appendChild(mkDayCard(a,i,key)); });
  else { var em2=div('emptxt','Aucun atelier pour ce jour'); em2.style.padding='26px 0'; tl.appendChild(em2); }
  tl.appendChild(btn('add-atelier-btn','＋ Ajouter un atelier', function() { openTplSheet(); }));
}

function mkDayCard(a, i, key) {
  var card = div('tscard');
  var band = div('tscard-band'); band.style.background=a.color; card.appendChild(band);
  var body = div('tscard-body');
  var top  = div('tscard-top');
  var left = div('tscard-left');
  var ico  = div('tscard-ico', a.emoji||'');
  if (!a.emoji) { var sp=el('span'); sp.style.cssText='font-size:12px;color:var(--tl)'; sp.textContent='◈'; ico.textContent=''; ico.appendChild(sp); }
  left.appendChild(ico);
  var info = div('tscard-info');
  if (a.heure) info.appendChild(div('tscard-time', a.heure+(a.duree?' · '+a.duree+'min':'')));
  info.appendChild(div('tscard-name', a.text));
  left.appendChild(info); top.appendChild(left);
  var acts = div('tscard-acts');
  (function(idx) {
    acts.appendChild(btn('xbtn','✎', function(e) { e.stopPropagation(); openEditModal(idx); }));
    acts.appendChild(btn('xbtn d','×', function(e) { e.stopPropagation(); delDayItem(idx); }));
  })(i);
  top.appendChild(acts); body.appendChild(top);
  var ta = el('textarea','tscard-addnote');
  ta.placeholder='Description, objectif, matériel…'; ta.value=a.desc||'';
  ta.onclick=function(e){e.stopPropagation();};
  (function(idx) { ta.onchange=function(){updDesc(idx,this.value);}; })(i);
  body.appendChild(ta);
  var foot = div('tscard-foot');
  var ts = el('span'); ts.style.cssText='font-size:10px;color:var(--tl)'; ts.textContent=a.heure||'Libre';
  foot.appendChild(ts); body.appendChild(foot); card.appendChild(body);
  return card;
}

function delDayItem(i) {
  var key=dk(sD.y,sD.m,sD.d);
  if (AT[key]) { AT[key].splice(i,1); if(!AT[key].length) delete AT[key]; }
  saveAtelier(key); rDay(); rCal();
}

function updDesc(i, v) {
  var key=dk(sD.y,sD.m,sD.d);
  if (AT[key]&&AT[key][i]) { AT[key][i].desc=v; saveAtelier(key); }
}

// ── MODAL MODIFIER ──
function openEditModal(i) {
  curEI = i;
  var key = dk(sD.y,sD.m,sD.d); var a=(AT[key]||[])[i]; if(!a) return;
  document.getElementById('editName').value  = a.text||'';
  document.getElementById('editHeure').value = a.heure||'';
  document.getElementById('editDesc').value  = a.desc||'';
  var cr = document.getElementById('editColors'); cr.innerHTML='';
  COLS.forEach(function(col) {
    var d=div('edit-cdot'+(col===a.color?' active':'')); d.style.background=col;
    d.onclick=function(){cr.querySelectorAll('.edit-cdot').forEach(function(x){x.classList.remove('active');}); d.classList.add('active');};
    cr.appendChild(d);
  });
  document.getElementById('editModal').classList.add('open');
}

function closeEditModal() { document.getElementById('editModal').classList.remove('open'); curEI=-1; }

function saveEditModal() {
  if (curEI<0) return;
  var key=dk(sD.y,sD.m,sD.d); var a=AT[key]&&AT[key][curEI]; if(!a) return;
  a.text  = document.getElementById('editName').value.trim()||a.text;
  a.heure = document.getElementById('editHeure').value;
  a.desc  = document.getElementById('editDesc').value.trim();
  var ac=document.querySelector('#editColors .edit-cdot.active'); if(ac) a.color=ac.style.background;
  saveAtelier(key); closeEditModal(); rDP(); rCal();
  if (jView==='day') rDay();
  if (jView==='week') rWeek();
}

// ── PÉRIODE ──
function rPeriod() {
  var nav=document.getElementById('periodNav'); nav.innerHTML='';
  PERIODES.forEach(function(p,i) {
    var b=btn('period-pill'+(i===curPeriod?' active':''), p.lbl, function(){curPeriod=i;rPeriod();});
    nav.appendChild(b);
  });
  var grid=document.getElementById('periodGrid'); grid.innerHTML='';
  var cats=PT.filter(function(c){return c.period===PERIODES[curPeriod].id;});
  if (!cats.length) { grid.appendChild(div('emptxt','Aucune catégorie pour cette période')); return; }
  cats.forEach(function(cat,ci) { grid.appendChild(mkPcat(cat,ci)); });
}

function mkPcat(cat, ci) {
  var d=div('pcat'+(openT.has(ci)?' open':''));
  var head=div('pcat-head');
  var icoWrap=div('pcat-ico-wrap'); icoWrap.style.background=(cat.color||AVCL[ci%AVCL.length])+'22';
  icoWrap.appendChild(el('span',null,cat.emoji||'📚'));
  head.appendChild(icoWrap);
  head.appendChild(div('pcat-name',cat.name||'Catégorie'));
  head.appendChild(div('pcat-count',String((cat.ideas||[]).length)));
  head.appendChild(div('pcat-arr','▼'));
  head.appendChild(btn('pcat-del','✕',function(e){e.stopPropagation();delPcat(ci);}));
  head.onclick=function(){togPcat(ci);}; d.appendChild(head);
  var body=div('pcat-body');
  var ideas=div('pideas'); ideas.id='pideas-'+ci;
  (cat.ideas||[]).forEach(function(idea,ii) {
    (function(iii) {
      var tag=div('pidea');
      tag.appendChild(el('span',null,idea));
      tag.appendChild(btn('pidea-del','×',function(){delPidea(ci,iii);}));
      ideas.appendChild(tag);
    })(ii);
  });
  body.appendChild(ideas);
  var addRow=div('pidea-add');
  var inp=el('input','pidea-input'); inp.id='pidea-in-'+ci; inp.placeholder='Ajouter une idée…';
  inp.onkeydown=function(e){if(e.key==='Enter') addPidea(ci);};
  addRow.appendChild(inp);
  addRow.appendChild(btn('pidea-submit','+',function(){addPidea(ci);}));
  body.appendChild(addRow); d.appendChild(body);
  return d;
}

function togPcat(ci) { if(openT.has(ci)) openT.delete(ci); else openT.add(ci); rPeriod(); }
function addPeriodCat() {
  var name=prompt('Nom de la catégorie :'); if(!name) return;
  PT.push({period:PERIODES[curPeriod].id,name:name,emoji:'📚',color:AVCL[PT.length%AVCL.length],ideas:[]});
  rPeriod();
}
function delPcat(ci) {
  var cats=PT.filter(function(c){return c.period===PERIODES[curPeriod].id;});
  var idx=PT.indexOf(cats[ci]); if(idx>=0) PT.splice(idx,1); rPeriod();
}
function addPidea(ci) {
  var cats=PT.filter(function(c){return c.period===PERIODES[curPeriod].id;});
  var cat=cats[ci]; if(!cat) return;
  var inp=document.getElementById('pidea-in-'+ci); var v=inp.value.trim(); if(!v) return;
  if(!cat.ideas) cat.ideas=[];
  cat.ideas.push(v); inp.value=''; rPeriod(); openT.add(ci);
}
function delPidea(ci, ii) {
  var cats=PT.filter(function(c){return c.period===PERIODES[curPeriod].id;});
  var cat=cats[ci]; if(!cat) return;
  cat.ideas.splice(ii,1); rPeriod(); openT.add(ci);
}

// ── NOTES ──
function rPits() {
  var grid=document.getElementById('pitGrid'); if(!grid) return; grid.innerHTML='';
  if (!NOTES.length) {
    var empty=div(); empty.style.cssText='grid-column:1/-1;text-align:center;padding:36px 0;font-family:"Cormorant Garamond",serif;font-size:17px;font-style:italic;color:var(--tl)';
    empty.textContent='Aucune note — appuie sur + pour créer';
    grid.appendChild(empty); return;
  }
  NOTES.forEach(function(n,i) { grid.appendChild(mkPit(n,i)); });
}

function mkPit(n, i) {
  var e=div('pit '+(n.cls||PCLS[i%PCLS.length]));
  e.appendChild(btn('pdel','×',function(){delPit(i);}));
  var inp=el('input','ptit'); inp.placeholder='Titre…'; inp.value=n.title||'';
  (function(idx){inp.onchange=function(){updPit(idx,'title',this.value);};})(i);
  e.appendChild(inp);
  var ta=el('textarea','ptarea'); ta.placeholder='Contenu…'; ta.value=n.body||'';
  (function(idx){ta.onchange=function(){updPit(idx,'body',this.value);};})(i);
  e.appendChild(ta);
  var ctrl=div('pctrl'); var cols=div('pcols');
  PCLS.forEach(function(cls,ci) {
    var dot=div('pcdot'+(n.cls===cls?' active':'')); dot.style.background=PCHX[ci];
    (function(c,idx){dot.onclick=function(){chPitCls(idx,c);};})(cls,i);
    cols.appendChild(dot);
  });
  ctrl.appendChild(cols); e.appendChild(ctrl);
  return e;
}

function addPit() { NOTES.unshift({title:'',body:'',cls:PCLS[Math.floor(Math.random()*PCLS.length)]}); saveMisc(); rPits(); updateBadges(); }
function delPit(i) { NOTES.splice(i,1); saveMisc(); rPits(); updateBadges(); }
function updPit(i,k,v) { if(NOTES[i]){NOTES[i][k]=v; saveMisc();} }
function chPitCls(i,cls) { if(NOTES[i]){NOTES[i].cls=cls; saveMisc(); rPits();} }

// ── ÉCOLE ──
function mkCard(ico,title,sub,bg) {
  var card=div('acard');
  var head=div('ahead');
  var icon=div('aico',ico); icon.style.background=bg;
  var info=div(); info.appendChild(div('atitle',title)); info.appendChild(div('asub',sub));
  head.appendChild(icon); head.appendChild(info); card.appendChild(head);
  return card;
}

function rEcole() {
  var body=document.getElementById('ecoleBody'); if(!body) return; body.innerHTML='';
  // Effectifs
  var eff=mkCard('👥','Effectifs','Élèves inscrits par niveau','#FFF0E8');
  var eg=div('');
  [{k:'ps',lbl:'PS',bg:'#F5E0CC',col:'var(--brown)',full:'Petite Section'},
   {k:'ms',lbl:'MS',bg:'#D4EED8',col:'#4A9055',full:'Moyenne Section'},
   {k:'gs',lbl:'GS',bg:'#DDD8F5',col:'#6A5EA8',full:'Grande Section'}
  ].forEach(function(niv) {
    var row=div('eff-row');
    var badge=div('eff-badge',niv.lbl); badge.style.background=niv.bg; badge.style.color=niv.col;
    row.appendChild(badge); row.appendChild(div('eff-lbl',niv.full));
    var ctrl=div('eff-controls');
    var ve=div('eff-val',String(EF[niv.k]||0)); ve.id='eff-'+niv.k; ve.style.color=niv.col;
    (function(k,v) {
      ctrl.appendChild(btn('eff-btn','−',function(){EF[k]=Math.max(0,(EF[k]||0)-1);v.textContent=String(EF[k]);updEffTotal();saveMisc();}));
      ctrl.appendChild(v);
      ctrl.appendChild(btn('eff-btn','+',function(){EF[k]=(EF[k]||0)+1;v.textContent=String(EF[k]);updEffTotal();saveMisc();}));
    })(niv.k, ve);
    row.appendChild(ctrl); eg.appendChild(row);
  });
  eff.appendChild(eg);
  var total=div('eff-total'); total.appendChild(div('eff-total-lbl','Total classe'));
  var tv=div('eff-total-val',String((EF.ps||0)+(EF.ms||0)+(EF.gs||0))); tv.id='eff-total';
  total.appendChild(tv); eff.appendChild(total); body.appendChild(eff);
  // Infos école
  var info=mkCard('🏫','Mon École','Informations générales','#E8F4FF');
  [{key:'nom',ph:"Nom de l'école…"},{key:'niv',ph:'Niveau…'},{key:'an',ph:'Année scolaire…'}].forEach(function(f) {
    var inp=el('input','smin'); inp.placeholder=f.ph; inp.value=SC[f.key]||''; inp.style.marginBottom='8px';
    (function(k){inp.onchange=function(){SC[k]=this.value;saveMisc();};})(f.key);
    info.appendChild(inp);
  });
  body.appendChild(info);
  // Agenda
  var ag=mkCard('📅','Agenda','Réunions & événements','#E8F0E8');
  var agList=div(); agList.id='agendaList';
  if (H1.length) {
    H1.forEach(function(h,i) {
      var item=div('hitem'); item.appendChild(div('hchk','✓')); item.appendChild(div('hname',h));
      (function(idx){item.appendChild(btn('ctdl','×',function(){delAg(idx);}));})(i);
      agList.appendChild(item);
    });
  } else { agList.appendChild(div('emptxt','Aucun événement')); }
  ag.appendChild(agList);
  var addRow=div('addrow');
  var agInp=el('input','smin'); agInp.id='ag-in'; agInp.placeholder='Ajouter un événement…';
  agInp.onkeydown=function(e){if(e.key==='Enter') addAg();};
  addRow.appendChild(agInp); addRow.appendChild(btn('smbtn','+',addAg));
  ag.appendChild(addRow); body.appendChild(ag);
}

function updEffTotal() { var t=document.getElementById('eff-total'); if(t) t.textContent=String((EF.ps||0)+(EF.ms||0)+(EF.gs||0)); }
function addAg() { var v=document.getElementById('ag-in'); if(!v||!v.value.trim()) return; H1.push(v.value.trim()); saveMisc(); rEcole(); }
function delAg(i) { H1.splice(i,1); saveMisc(); rEcole(); }

// ── CLASSE ──
function renderClasse() { displayEleves(EL); }

function displayEleves(list) {
  var grid=document.getElementById('clasGrid'); if(!grid) return; grid.innerHTML='';
  if (!list.length) {
    var empty=div(); empty.style.cssText='text-align:center;padding:36px 0;font-family:"Cormorant Garamond",serif;font-size:17px;font-style:italic;color:var(--tl)';
    empty.textContent='Aucun élève — appuie sur + pour en ajouter';
    grid.appendChild(empty); return;
  }
  var levels={TPS:[],PS:[],MS:[],GS:[]};
  list.forEach(function(e){(levels[e.niveau]||levels.PS).push(e);});
  Object.keys(levels).forEach(function(niv) {
    var els=levels[niv]; if(!els.length) return;
    var g=div('nivg');
    g.appendChild(div('nivl',niv+' — '+els.length+' élève'+(els.length>1?'s':'')));
    els.forEach(function(e) {
      var idx=EL.indexOf(e);
      var card=div('eleve-card');
      var inner=div('eleve-inner');
      var thumb=div('ethumb');
      var av=div('ctav',((e.prenom?e.prenom[0]:'')+(e.nom?e.nom[0]:'')).toUpperCase()||'?');
      av.style.background=AVCL[idx%AVCL.length]; thumb.appendChild(av); inner.appendChild(thumb);
      var info=div('einfo');
      info.appendChild(div('eprn',(e.prenom||'Prénom')+' '+(e.nom||'')));
      info.appendChild(div('enom',e.ddn?'Né·e le '+e.ddn:(e.allergies?'⚠ '+e.allergies:'')));
      inner.appendChild(info);
      inner.appendChild(div('npill '+(NPC[e.niveau]||'nps'),e.niveau));
      card.appendChild(inner);
      (function(i2){card.onclick=function(){openElevePage(i2);};})(idx);
      g.appendChild(card);
    });
    grid.appendChild(g);
  });
  updateBadges();
}

function filterClasse() {
  var q=((document.getElementById('clasSearch')||{}).value||'').toLowerCase();
  displayEleves(q?EL.filter(function(e){return((e.prenom||'')+' '+(e.nom||'')).toLowerCase().includes(q);}):EL);
}

function addEleve() {
  var prenom=prompt('Prénom :'); if(!prenom) return;
  var nom   =prompt('Nom :')||'';
  var niveau=(prompt('Niveau (TPS/PS/MS/GS) :')||'PS').toUpperCase();
  var newEl={prenom:prenom.trim(),nom:nom.trim(),niveau:niveau||'PS',ddn:'',p1:'',p1t:'',p2:'',p2t:'',allergies:'',notes:''};
  var p=saveEleve(newEl);
  if (p) { p.then(function(ref){newEl.id=ref.id;EL.push(newEl);renderClasse();updateBadges();}); }
  else   { EL.push(newEl); renderClasse(); updateBadges(); }
}

// ── PAGE ÉLÈVE ──
function openElevePage(i) {
  curEleveIdx=i; var e=EL[i]; if(!e) return;
  var av=document.getElementById('epAvatar');
  av.textContent=((e.prenom?e.prenom[0]:'')).toUpperCase()||'?';
  av.style.background=AVCL[i%AVCL.length]+'33'; av.style.color=AVCL[i%AVCL.length];
  document.getElementById('epName').textContent=(e.prenom||'')+' '+(e.nom||'');
  var niv=document.getElementById('epNiveau'); niv.textContent=e.niveau||'PS'; niv.className='ep-pill '+(NPC[e.niveau]||'nps');
  document.getElementById('epPrenom').value=e.prenom||'';
  document.getElementById('epNom').value=e.nom||'';
  document.getElementById('epDobIn').value=e.ddn||'';
  document.getElementById('epNivIn').value=e.niveau||'PS';
  document.getElementById('epP1').value=e.p1||''; document.getElementById('epP1t').value=e.p1t||'';
  document.getElementById('epP2').value=e.p2||''; document.getElementById('epP2t').value=e.p2t||'';
  document.getElementById('epAllerg').value=e.allergies||'';
  document.getElementById('epNotes').value=e.notes||'';
  document.getElementById('elevePage').classList.add('open');
}

function closeElevePage() { document.getElementById('elevePage').classList.remove('open'); curEleveIdx=-1; }

function epUpdateNiv() {
  if (curEleveIdx<0) return;
  var niv=document.getElementById('epNivIn').value;
  var el2=document.getElementById('epNiveau'); el2.textContent=niv; el2.className='ep-pill '+(NPC[niv]||'nps');
}

function saveElevePage() {
  if (curEleveIdx<0) return;
  var e=EL[curEleveIdx]; if(!e) return;
  e.prenom=document.getElementById('epPrenom').value.trim();
  e.nom   =document.getElementById('epNom').value.trim();
  e.ddn   =document.getElementById('epDobIn').value;
  e.niveau=document.getElementById('epNivIn').value;
  e.p1=document.getElementById('epP1').value.trim(); e.p1t=document.getElementById('epP1t').value.trim();
  e.p2=document.getElementById('epP2').value.trim(); e.p2t=document.getElementById('epP2t').value.trim();
  e.allergies=document.getElementById('epAllerg').value.trim();
  e.notes    =document.getElementById('epNotes').value.trim();
  saveEleve(e);
  document.getElementById('epName').textContent=e.prenom+' '+e.nom;
  document.getElementById('epNiveau').textContent=e.niveau;
  document.getElementById('epAvatar').textContent=(e.prenom?e.prenom[0]:'').toUpperCase()||'?';
  renderClasse();
  var sb=document.querySelector('.ep-save-btn');
  if (sb) { var o=sb.textContent; sb.textContent='Enregistré ✓'; sb.style.background='#5A7848'; setTimeout(function(){sb.textContent=o;sb.style.background='';},1500); }
}

function delEleveFromPage() {
  if (curEleveIdx<0||!confirm('Supprimer cet élève ?')) return;
  var e=EL[curEleveIdx];
  if (e.id) elevesRef().doc(e.id).delete();
  EL.splice(curEleveIdx,1); closeElevePage(); renderClasse(); updateBadges();
}

function togEpSec(id) { document.getElementById(id).classList.toggle('open'); }

// ── SHEET TEMPLATES + ADD ──
function openTplSheet() {
  tplColor=COLS[0]; tplEmoji='';
  rTplColors();
  var inp=document.getElementById('tplAtelierIn'); if(inp) inp.value='';
  var hInp=document.getElementById('tplHeureIn'); if(hInp) hInp.value='';
  var dInp=document.getElementById('tplDureeIn'); if(dInp) dInp.value='';
  var lbl=document.getElementById('tpLabel');     if(lbl) lbl.textContent='Heure';
  var trig=document.getElementById('tpTrigger');  if(trig) trig.classList.remove('has-val');
  var ep=document.getElementById('tplEmojiPre');  if(ep) ep.textContent='+';
  var title=document.getElementById('tplTitle');  if(title) title.textContent='Nouvel atelier';
  rTplSheet();
  document.getElementById('tplSheet').classList.add('open');
  setTimeout(function(){var i=document.getElementById('tplAtelierIn');if(i) i.focus();},300);
}

function closeTplSheet() {
  document.getElementById('tplSheet').classList.remove('open');
  var title=document.getElementById('tplTitle'); if(title) title.textContent='Nouvel atelier';
}

function rTplColors() {
  var row=document.getElementById('tplColorRow'); if(!row) return; row.innerHTML='';
  COLS.forEach(function(col) {
    var d=div('tpl-cdot'+(col===tplColor?' active':'')); d.style.background=col;
    d.onclick=function(){tplColor=col;rTplColors();}; row.appendChild(d);
  });
}

function rTplSheet() {
  var scroll=document.getElementById('tplScroll'); if(!scroll) return; scroll.innerHTML='';
  // Mes modèles perso en premier
  var perso=TPLS.filter(function(t){return !DEFAULT_TPLS.some(function(d){return d.name===t.name;});});
  if (perso.length) {
    scroll.appendChild(div('tpl-section-lbl','Mes modèles ★'));
    var gPerso=div('tpl-grid');
    perso.forEach(function(tpl){gPerso.appendChild(mkTplCard(tpl,true,TPLS.indexOf(tpl)));});
    scroll.appendChild(gPerso);
  }
  // Templates par défaut
  scroll.appendChild(div('tpl-section-lbl','Activités maternelle'));
  var gDef=div('tpl-grid');
  DEFAULT_TPLS.forEach(function(tpl){gDef.appendChild(mkTplCard(tpl,false,-1));});
  scroll.appendChild(gDef);
}

function mkTplCard(tpl, isDel, idx) {
  var card=div('tpl-card');
  var band=div('tpl-card-band'); band.style.background=tpl.color; card.appendChild(band);
  card.appendChild(el('span','tpl-card-emoji',tpl.emoji||''));
  card.appendChild(div('tpl-card-name',tpl.name));
  if (tpl.desc) card.appendChild(div('tpl-card-desc',tpl.desc));
  if (isDel && idx>=0) {
    (function(i) {
      var d=btn('tpl-card-del','×',function(e) {
        e.stopPropagation();
        var t=TPLS[i]; if(t&&t.id) tplsRef().doc(t.id).delete();
        TPLS.splice(i,1); rTplSheet();
      });
      card.appendChild(d);
    })(idx);
  }
  // Tap = ajout direct
  card.onclick = function() {
    if (!sD) return;
    var key=dk(sD.y,sD.m,sD.d); if(!AT[key]) AT[key]=[];
    var heure=document.getElementById('tplHeureIn').value||'';
    var duree=document.getElementById('tplDureeIn').value||'';
    AT[key].push({text:tpl.name,color:tpl.color,emoji:tpl.emoji||'',heure:heure,duree:duree,desc:tpl.desc||''});
    saveAtelier(key); closeTplSheet(); rDP(); rCal();
    if (jView==='week') rWeek();
    if (jView==='day') {tsActive=null;rDay();}
    updateBadges();
    showToast((tpl.emoji?tpl.emoji+' ':'')+tpl.name+' ajouté ✓');
  };
  return card;
}

function addFromSheet() {
  var inp=document.getElementById('tplAtelierIn'); var txt=inp?inp.value.trim():'';
  if (!txt||!sD) { showToast('Saisis un titre.'); return; }
  var key=dk(sD.y,sD.m,sD.d); if(!AT[key]) AT[key]=[];
  AT[key].push({text:txt,color:tplColor,emoji:tplEmoji,heure:document.getElementById('tplHeureIn').value||'',duree:document.getElementById('tplDureeIn').value||'',desc:''});
  saveAtelier(key); closeTplSheet(); rDP(); rCal();
  if (jView==='week') rWeek();
  if (jView==='day') {tsActive=null;rDay();}
  updateBadges(); showToast('Atelier ajouté ✓');
}

function saveAsTpl() {
  var inp=document.getElementById('tplAtelierIn'); var txt=inp?inp.value.trim():'';
  if (!txt) { showToast("Saisis d'abord un titre."); return; }
  var newTpl={emoji:tplEmoji,name:txt,color:tplColor,desc:''};
  saveTpl(newTpl).then(function(ref) {
    newTpl.id=ref.id; TPLS.push(newTpl); rTplSheet();
    showToast('★ Modèle sauvegardé');
  });
}

function cycleTplEmoji() {
  var emojis=DEFAULT_TPLS.map(function(t){return t.emoji;});
  tplEmojiIdx=(tplEmojiIdx+1)%emojis.length; tplEmoji=emojis[tplEmojiIdx];
  var ep=document.getElementById('tplEmojiPre'); if(ep) ep.textContent=tplEmoji;
}

// ── TIME PICKER ──
function openTimePicker() {
  buildDrum('tpDrumH', TP_HOURS, tpSelH);
  buildDrum('tpDrumD', TP_DUREES.map(function(d){return d.lbl;}), tpSelD);
  document.getElementById('tpSheet').classList.add('open');
}
function closeTimePicker() { document.getElementById('tpSheet').classList.remove('open'); }

function buildDrum(id, items, selIdx) {
  var drum=document.getElementById(id); if(!drum) return; drum.innerHTML='';
  items.forEach(function(item,i) {
    var e=div('tp-item'+(i===selIdx?' active':''),item);
    e.onclick=function(){scrollToIdx(drum,Array.from(drum.children).indexOf(e));};
    drum.appendChild(e);
  });
  setTimeout(function(){scrollToIdx(drum,selIdx,true);},50);
}

function scrollToIdx(drum,idx,instant) {
  drum.scrollTo({top:idx*40,behavior:instant?'instant':'smooth'});
}

function onDrumScroll(drum,which) {
  clearTimeout(tpScrollT);
  tpScrollT=setTimeout(function(){snapDrum(drum,which);},80);
}

function snapDrum(drum,which) {
  var idx=Math.round(drum.scrollTop/40);
  var maxIdx=(which==='h'?TP_HOURS.length:TP_DUREES.length)-1;
  idx=Math.max(0,Math.min(idx,maxIdx));
  drum.scrollTo({top:idx*40,behavior:'smooth'});
  Array.from(drum.querySelectorAll('.tp-item')).forEach(function(it,i){it.classList.toggle('active',i===idx);});
  if (which==='h') tpSelH=idx; else tpSelD=idx;
}

function confirmTimePicker() {
  var heure=TP_HOURS[tpSelH]||'';
  var duree=TP_DUREES[tpSelD];
  var hInp=document.getElementById('tplHeureIn'); if(hInp) hInp.value=heure;
  var dInp=document.getElementById('tplDureeIn'); if(dInp) dInp.value=duree?duree.val:'';
  var lbl=document.getElementById('tpLabel');
  if(lbl) lbl.textContent=heure+(duree?' • '+duree.lbl:'');
  var trig=document.getElementById('tpTrigger'); if(trig) trig.classList.add('has-val');
  closeTimePicker();
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('keydown', function(e) {
    if (e.key==='Enter' && document.activeElement.id==='tplAtelierIn') addFromSheet();
    if (e.key==='Escape') {
      closeTplSheet(); closeTimePicker();
      document.getElementById('editModal').classList.remove('open');
    }
  });
});
