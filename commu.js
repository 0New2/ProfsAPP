// ── COMMUNAUTÉ ──
var COMMU_FILTERS = ['Tous','PS','MS','GS','Langage','Maths','Arts','Motricité','Sciences','Phono'];
var commuFilter   = 'Tous';
var pubColor      = COLS[0];
var pubEmoji      = '🎨';
var pubEmojiIdx   = 0;

// ── FILTRES ──
function renderCommuFilters() {
  var cont = document.getElementById('commuFilters');
  if (!cont) return;
  cont.innerHTML = '';
  COMMU_FILTERS.forEach(function(f) {
    var b = document.createElement('button');
    b.className = 'cf' + (f === commuFilter ? ' active' : '');
    b.textContent = f;
    b.onclick = function() {
      commuFilter = f;
      renderCommuFilters();
      loadCommuFeed();
    };
    cont.appendChild(b);
  });
}

// ── FIL ──
function loadCommuFeed() {
  var cont = document.getElementById('commuFeed');
  if (!cont) return;
  cont.innerHTML = '<div class="commu-loading">Chargement…</div>';

  var q = commuRef().orderBy('created_at', 'desc').limit(30);
  if (commuFilter !== 'Tous') {
    q = q.where('tags', 'array-contains', commuFilter);
  }

  q.get().then(function(snap) {
    cont.innerHTML = '';
    if (snap.empty) {
      var empty = document.createElement('div');
      empty.className = 'commu-empty';
      empty.textContent = 'Aucun atelier partagé pour l\'instant.\nSois le premier à partager !';
      cont.appendChild(empty);
      return;
    }
    snap.forEach(function(doc) {
      cont.appendChild(mkPubCard(doc.id, doc.data()));
    });
  }).catch(function(err) {
    cont.innerHTML = '<div class="commu-empty">Erreur de chargement. Vérifie ta connexion.</div>';
    console.error(err);
  });
}

// ── CARTE COMMUNAUTÉ ──
function mkPubCard(id, data) {
  var card = document.createElement('div');
  card.className = 'pub-card';

  // Bande couleur
  var band = document.createElement('div');
  band.className = 'pub-band';
  band.style.background = data.color || COLS[0];
  card.appendChild(band);

  var body = document.createElement('div');
  body.className = 'pub-body';

  // Top : icone + info
  var top  = document.createElement('div'); top.className = 'pub-top';
  var ico  = document.createElement('div'); ico.className = 'pub-ico'; ico.textContent = data.emoji || '◈';
  var info = document.createElement('div'); info.className = 'pub-info';
  var name = document.createElement('div'); name.className = 'pub-name'; name.textContent = data.titre || '';
  info.appendChild(name);
  if (data.desc) {
    var desc = document.createElement('div'); desc.className = 'pub-desc'; desc.textContent = data.desc;
    info.appendChild(desc);
  }
  top.appendChild(ico); top.appendChild(info);
  body.appendChild(top);

  // Tags
  if (data.tags && data.tags.length) {
    var tags = document.createElement('div'); tags.className = 'pub-tags';
    data.tags.forEach(function(t) {
      var tag = document.createElement('div'); tag.className = 'pub-tag'; tag.textContent = t;
      tags.appendChild(tag);
    });
    body.appendChild(tags);
  }

  // Footer
  var footer = document.createElement('div'); footer.className = 'pub-footer';

  // Auteur
  var author = document.createElement('div'); author.className = 'pub-author';
  var av = document.createElement('div'); av.className = 'pub-avatar';
  var nom = data.auteur_nom || 'Anonyme';
  av.textContent = nom[0].toUpperCase();
  av.style.background = AVCL[Math.abs(nom.charCodeAt(0) || 0) % AVCL.length];
  var authorName = document.createElement('div'); authorName.className = 'pub-author-name'; authorName.textContent = nom;
  author.appendChild(av); author.appendChild(authorName);
  footer.appendChild(author);

  // Actions
  var actions = document.createElement('div'); actions.className = 'pub-actions';

  // Like
  var uid     = currentUser ? currentUser.uid : null;
  var isLiked = data.likedBy && uid && data.likedBy.includes(uid);
  var likeBtn = document.createElement('button');
  likeBtn.className = 'pub-like-btn' + (isLiked ? ' liked' : '');
  likeBtn.textContent = '❤ ' + (data.likes || 0);
  (function(docId, liked) {
    likeBtn.onclick = function() { toggleLike(docId, liked, likeBtn); };
  })(id, isLiked);
  actions.appendChild(likeBtn);

  // Sauvegarder
  var saveBtn = document.createElement('button');
  saveBtn.className = 'pub-save-btn';
  saveBtn.textContent = '+';
  saveBtn.title = 'Sauvegarder dans mes modèles';
  (function(d2) {
    saveBtn.onclick = function() { savePubToTpls(d2, saveBtn); };
  })(data);
  actions.appendChild(saveBtn);

  footer.appendChild(actions);
  body.appendChild(footer);
  card.appendChild(body);
  return card;
}

// ── LIKE ──
function toggleLike(docId, wasLiked, btn) {
  if (!currentUser) { showToast('Connecte-toi pour liker.'); return; }
  var ref = commuRef().doc(docId);
  if (wasLiked) {
    ref.update({
      likes:    firebase.firestore.FieldValue.increment(-1),
      likedBy:  firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
    });
    btn.classList.remove('liked');
    btn.textContent = '❤ ' + (parseInt(btn.textContent.replace('❤ ','')) - 1);
  } else {
    ref.update({
      likes:   firebase.firestore.FieldValue.increment(1),
      likedBy: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
    });
    btn.classList.add('liked');
    btn.textContent = '❤ ' + (parseInt(btn.textContent.replace('❤ ','')) + 1);
  }
}

// ── SAUVEGARDER DANS MES MODÈLES ──
function savePubToTpls(data, btnEl) {
  if (!currentUser) { showToast('Connecte-toi d\'abord.'); return; }
  var newTpl = {emoji: data.emoji||'', name: data.titre||'', color: data.color||COLS[0], desc: data.desc||''};
  saveTpl(newTpl).then(function(ref) {
    newTpl.id = ref.id;
    TPLS.push(newTpl);
    btnEl.textContent = '✓';
    btnEl.classList.add('saved');
    showToast('Sauvegardé dans tes modèles ★');
  }).catch(function() {
    showToast('Erreur lors de la sauvegarde.');
  });
}

// ── SHEET PUBLIER ──
function openPublishSheet() {
  if (!currentUser) { showToast('Connecte-toi pour partager.'); return; }
  // Reset
  document.getElementById('pubTitle').value = '';
  document.getElementById('pubDesc').value  = '';
  pubColor = COLS[0]; pubEmoji = '🎨'; pubEmojiIdx = 0;
  document.getElementById('pubEmoji').textContent = '🎨';
  document.querySelectorAll('#pubNiveaux .pub-chip, #pubDomaines .pub-chip').forEach(function(c) {
    c.classList.remove('active');
  });
  // Couleurs
  var cr = document.getElementById('pubColorRow'); cr.innerHTML = '';
  COLS.forEach(function(col) {
    var d = document.createElement('div');
    d.className = 'tpl-cdot' + (col === pubColor ? ' active' : '');
    d.style.background = col;
    d.onclick = function() {
      pubColor = col;
      cr.querySelectorAll('.tpl-cdot').forEach(function(x) { x.classList.remove('active'); });
      d.classList.add('active');
    };
    cr.appendChild(d);
  });
  document.getElementById('publishSheet').classList.add('open');
}

function closePublishSheet() {
  document.getElementById('publishSheet').classList.remove('open');
}

function cyclePubEmoji() {
  var emojis = DEFAULT_TPLS.map(function(t) { return t.emoji; });
  pubEmojiIdx = (pubEmojiIdx + 1) % emojis.length;
  pubEmoji = emojis[pubEmojiIdx];
  document.getElementById('pubEmoji').textContent = pubEmoji;
}

function toggleChip(el2) {
  el2.classList.toggle('active');
}

function publishAtelier() {
  if (!currentUser) return;
  var titre = document.getElementById('pubTitle').value.trim();
  if (!titre) { showToast('Ajoute un titre !'); return; }
  var desc     = document.getElementById('pubDesc').value.trim();
  var niveaux  = Array.from(document.querySelectorAll('#pubNiveaux .pub-chip.active')).map(function(c) { return c.textContent; });
  var domaines = Array.from(document.querySelectorAll('#pubDomaines .pub-chip.active')).map(function(c) { return c.textContent; });
  var tags     = niveaux.concat(domaines);

  var data = {
    titre:       titre,
    desc:        desc,
    emoji:       pubEmoji,
    color:       pubColor,
    tags:        tags,
    auteur_uid:  currentUser.uid,
    auteur_nom:  currentUser.displayName || currentUser.email.split('@')[0],
    auteur_avatar: currentUser.photoURL || '',
    likes:       0,
    likedBy:     [],
    created_at:  firebase.firestore.FieldValue.serverTimestamp()
  };

  // Vérifier la limite IA (la publication compte comme une action premium)
  commuRef().add(data).then(function() {
    closePublishSheet();
    showToast('Atelier partagé avec la communauté ✓', 2500);
    // Badge communauté
    var badge = document.getElementById('badge-commu');
    if (badge) { badge.textContent = '✦'; badge.classList.add('show'); }
    // Recharger le fil
    loadCommuFeed();
  }).catch(function(e) {
    showToast('Erreur : ' + e.message);
  });
}
