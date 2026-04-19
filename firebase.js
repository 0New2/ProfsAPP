// ── FIREBASE CONFIG ──
firebase.initializeApp({
  apiKey: "AIzaSyCWhB6K_WLGxbULp4iP6foqvsYMo87Aw44",
  authDomain: "maclasse-b7975.firebaseapp.com",
  projectId: "maclasse-b7975",
  storageBucket: "maclasse-b7975.firebasestorage.app",
  messagingSenderId: "474281362182",
  appId: "1:474281362182:web:8882a11b9e58b12f905487"
});

var auth = firebase.auth();
var db   = firebase.firestore();

// ── ÉTAT GLOBAL ──
var currentUser = null;
var userDoc     = null;
var AT = {}, PT = [], H1 = [], EF = {ps:0,ms:0,gs:0}, EL = [], NOTES = [], SC = {}, TPLS = [];

// ── REFS FIRESTORE ──
function userRef()       { return db.collection('users').doc(currentUser.uid); }
function planRef(date)   { return userRef().collection('planning').doc(date); }
function elevesRef()     { return userRef().collection('eleves'); }
function tplsRef()       { return userRef().collection('templates'); }
function commuRef()      { return db.collection('communaute'); }

// ── AUTH ──
var authMode = 'login';

function toggleAuthMode() {
  authMode = authMode === 'login' ? 'register' : 'login';
  var isReg = authMode === 'register';
  document.getElementById('loginTitle').textContent = isReg ? 'Créer un compte' : 'Connexion';
  document.getElementById('loginBtn').textContent   = isReg ? 'Créer mon compte' : 'Se connecter';
  document.getElementById('loginSwitch').innerHTML  = isReg
    ? 'Déjà un compte\u00a0? <span onclick="toggleAuthMode()">Se connecter</span>'
    : 'Pas encore de compte\u00a0? <span onclick="toggleAuthMode()">Créer un compte</span>';
}

function loginEmail() {
  var email = document.getElementById('loginEmail').value.trim();
  var pwd   = document.getElementById('loginPwd').value;
  var errEl = document.getElementById('loginErr');
  errEl.style.display = 'none';
  if (!email || !pwd) { errEl.textContent = 'Remplis tous les champs.'; errEl.style.display = 'block'; return; }
  var p = authMode === 'login'
    ? auth.signInWithEmailAndPassword(email, pwd)
    : auth.createUserWithEmailAndPassword(email, pwd);
  p.catch(function(e) { errEl.textContent = e.message; errEl.style.display = 'block'; });
}

function loginGoogle() {
  var provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(function(e) {
    var errEl = document.getElementById('loginErr');
    errEl.textContent = e.message; errEl.style.display = 'block';
  });
}

function logout() { auth.signOut(); }

// ── AUTH STATE OBSERVER ──
auth.onAuthStateChanged(function(user) {
  document.getElementById('loader').style.display = 'none';
  if (user) {
    currentUser = user;
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    initUser(user);
  } else {
    currentUser = null;
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  }
});

function initUser(user) {
  // Avatar dans le header
  var avBtn = document.getElementById('avatarBtn');
  if (user.photoURL) {
    avBtn.innerHTML = '<img src="' + user.photoURL + '" alt="">';
  } else {
    avBtn.textContent = (user.displayName || user.email || '?')[0].toUpperCase();
  }
  loadUserData(user.uid);
}

// ── CHARGEMENT DONNÉES ──
function loadUserData(uid) {
  db.collection('users').doc(uid).get().then(function(doc) {
    if (!doc.exists) {
      var data = {
        nom: currentUser.displayName || '',
        email: currentUser.email || '',
        avatar: currentUser.photoURL || '',
        ia_today: 0, ia_date: '',
        effectifs: {ps:0,ms:0,gs:0}, agenda: [], ecole: {}, notes: [],
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      };
      db.collection('users').doc(uid).set(data);
      userDoc = data;
    } else {
      userDoc = doc.data();
      EF    = userDoc.effectifs || {ps:0,ms:0,gs:0};
      H1    = userDoc.agenda    || [];
      SC    = userDoc.ecole     || {};
      NOTES = userDoc.notes     || [];
    }
    updateIaCounter();
  });

  // Templates perso
  tplsRef().orderBy('created_at', 'desc').get().then(function(snap) {
    TPLS = [];
    snap.forEach(function(doc) { TPLS.push(Object.assign({id: doc.id}, doc.data())); });
  });

  // Élèves
  elevesRef().orderBy('nom').get().then(function(snap) {
    EL = [];
    snap.forEach(function(doc) { EL.push(Object.assign({id: doc.id}, doc.data())); });
  });

  // Planning du jour courant
  var today = dk(T.getFullYear(), T.getMonth(), T.getDate());
  loadAteliersForDate(today, function() {
    rCal();
    rWeek();
    updateBadges();
    renderCommuFilters();
  });
}

// ── SAUVEGARDE PLANNING ──
function saveAtelier(dateStr) {
  if (!currentUser) return;
  planRef(dateStr).set({
    ateliers: AT[dateStr] || [],
    updated_at: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function loadAteliersForDate(dateStr, cb) {
  if (!currentUser) { if (cb) cb(); return; }
  planRef(dateStr).get().then(function(doc) {
    if (doc.exists && doc.data().ateliers) AT[dateStr] = doc.data().ateliers;
    else AT[dateStr] = AT[dateStr] || [];
    if (cb) cb();
  });
}

// ── SAUVEGARDE MISC (effectifs, agenda, école, notes) ──
function saveMisc() {
  if (!currentUser) return;
  db.collection('users').doc(currentUser.uid).update({
    effectifs: EF, agenda: H1, ecole: SC, notes: NOTES
  });
}

// ── SAUVEGARDE ÉLÈVE ──
function saveEleve(eleve) {
  if (!currentUser) return null;
  if (eleve.id) {
    var id = eleve.id;
    var d  = Object.assign({}, eleve); delete d.id;
    elevesRef().doc(id).set(d);
    return null;
  } else {
    return elevesRef().add(Object.assign({}, eleve, {
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    }));
  }
}

// ── SAUVEGARDE TEMPLATE ──
function saveTpl(tpl) {
  if (!currentUser) return Promise.reject('no user');
  return tplsRef().add(Object.assign({}, tpl, {
    created_at: firebase.firestore.FieldValue.serverTimestamp()
  }));
}

// ── COMPTEUR IA ──
function updateIaCounter() {
  if (!userDoc) return;
  var today = new Date().toISOString().split('T')[0];
  if (userDoc.ia_date !== today) userDoc.ia_today = 0;
  var count = userDoc.ia_today || 0;
  var iaEl  = document.getElementById('iaCount');
  var barEl = document.getElementById('iaBarFill');
  if (iaEl)  iaEl.textContent = count;
  if (barEl) barEl.style.width = (count / 5 * 100) + '%';
}

function canUseIA() {
  if (!userDoc) return false;
  var today = new Date().toISOString().split('T')[0];
  if (userDoc.ia_date !== today) return true;
  return (userDoc.ia_today || 0) < 5;
}

function incrementIA() {
  if (!currentUser || !userDoc) return;
  var today = new Date().toISOString().split('T')[0];
  if (userDoc.ia_date !== today) { userDoc.ia_today = 0; userDoc.ia_date = today; }
  userDoc.ia_today++;
  db.collection('users').doc(currentUser.uid).update({
    ia_today: userDoc.ia_today,
    ia_date: today
  });
  updateIaCounter();
}

// ── PROFIL ──
function openProfile() {
  var u = currentUser; if (!u) return;
  var av = document.getElementById('profileAvatar');
  if (u.photoURL) {
    av.innerHTML = '<img src="' + u.photoURL + '" alt="" style="width:100%;height:100%;object-fit:cover">';
  } else {
    av.textContent = (u.displayName || u.email || '?')[0].toUpperCase();
  }
  document.getElementById('profileName').textContent  = u.displayName || 'Enseignant·e';
  document.getElementById('profileEmail').textContent = u.email || '';
  updateIaCounter();
  // Compter les ateliers publiés
  commuRef().where('auteur_uid', '==', u.uid).get().then(function(snap) {
    var el = document.getElementById('profilePubCount');
    if (el) el.textContent = snap.size
      ? snap.size + ' atelier' + (snap.size > 1 ? 's partagés' : ' partagé')
      : 'Aucun atelier partagé pour l\'instant';
  });
  document.getElementById('profilePage').classList.add('open');
}

function closeProfile() {
  document.getElementById('profilePage').classList.remove('open');
}
