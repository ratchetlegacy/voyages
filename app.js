/* Nos voyages — carnet de voyages de Chloé et Mathieu */
var SB_URL='https://ihucxnmqnhevfvlamgwc.supabase.co';
var SB_KEY='sb_publishable_kEE6pdoje5XIxfyiI9J4FA_qJ4Z-3-p';
var sb=supabase.createClient(SB_URL,SB_KEY,{auth:{persistSession:false,autoRefreshToken:false}});

var NOMS={chloe:'Chloé',mathieu:'Mathieu',ensemble:'À deux'};
var $=function(id){return document.getElementById(id)};
function norm(s){return String(s||'').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’']/g,' ').replace(/\s+/g,' ')}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function flag(a2){return a2?a2.replace(/./g,function(c){return String.fromCodePoint(127397+c.charCodeAt(0))}):''}
function col(p){return getComputedStyle(document.documentElement).getPropertyValue('--'+(p==='ensemble'?'deux':p)).trim()}

/* ---------- Dates (jour et mois facultatifs) ---------- */
var MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function lireDate(s){s=String(s||'').trim();if(!s)return '';var p=s.split(/[^0-9]+/).filter(Boolean);
  if(p.length===1&&/^\d{8}$/.test(p[0]))p=[p[0].slice(0,2),p[0].slice(2,4),p[0].slice(4)];
  if(p.length===1&&/^\d{6}$/.test(p[0]))p=[p[0].slice(0,2),p[0].slice(2)];
  var y,m,d;if(p.length===3){d=+p[0];m=+p[1];y=+p[2]}else if(p.length===2){m=+p[0];y=+p[1]}else if(p.length===1){y=+p[0]}else return null;
  if(!(y>=1900&&y<=2100))return null;if(m!=null&&!(m>=1&&m<=12))return null;
  if(d!=null){var max=new Date(y,m,0).getDate();if(!(d>=1&&d<=max))return null}
  return y+(m?'-'+String(m).padStart(2,'0'):'')+(d?'-'+String(d).padStart(2,'0'):'')}
function ecrireDate(v){if(!v)return'';var p=v.split('-');return p.length===3?p[2]+'/'+p[1]+'/'+p[0]:p.length===2?p[1]+'/'+p[0]:p[0]}
function joliDate(v){if(!v)return'';var p=v.split('-');return p.length===3?(+p[2])+(p[2]==='01'?'er':'')+' '+MOIS[+p[1]-1]+' '+p[0]:p.length===2?MOIS[+p[1]-1]+' '+p[0]:p[0]}
function periode(r){if(!r.debut)return'';if(!r.fin||r.fin===r.debut)return joliDate(r.debut);
  var a=r.debut.split('-'),b=r.fin.split('-');
  if(a.length===3&&b.length===3&&a[0]===b[0]&&a[1]===b[1])return 'du '+(+a[2])+(a[2]==='01'?'er':'')+' au '+joliDate(r.fin);
  if(a.length===3&&b.length===3&&a[0]===b[0])return 'du '+(+a[2])+(a[2]==='01'?'er':'')+' '+MOIS[+a[1]-1]+' au '+joliDate(r.fin);
  if(a.length===2&&b.length===2&&a[0]===b[0])return 'de '+MOIS[+a[1]-1]+' à '+joliDate(r.fin);
  return 'du '+joliDate(r.debut)+' au '+joliDate(r.fin)}
function cleDate(r){return (r.debut||String(r.annee))+'-00-00'}

/* ---------- Pays ---------- */
var PAYS_IDX={},PAYS_LISTE=[];
PAYS.forEach(function(r){var o={a2:r[0],num:r[1],nom:r[2]};PAYS_LISTE.push(o);r.slice(2).forEach(function(n){PAYS_IDX[norm(n)]=o})});
PAYS_LISTE.sort(function(a,b){return a.nom.localeCompare(b.nom,'fr')});
function pays(nom){return PAYS_IDX[norm(nom)]||null}

/* Lieux de France connus (régions, îles, coins de vacances) */
var LIEUX_FR=[['Alsace',7.5,48.3],['Ardèche',4.4,44.7],['Auvergne',3.0,45.5],['Bretagne',-3.0,48.1],['Camargue',4.5,43.55],['Corse',9.05,42.1],['Côte d’Azur',7.0,43.6],['Côte Basque',-1.55,43.45],['Pays basque',-1.3,43.3],['Dordogne',0.75,45.0],['Jura',5.8,46.6],['Alpes',6.5,45.3],['Pyrénées',0.5,42.85],['Vosges',6.9,48.1],['Normandie',0.0,49.2],['Provence',5.5,43.8],['Luberon',5.4,43.8],['Vendée',-1.4,46.65],['Île de Ré',-1.4,46.2],['Île d’Oléron',-1.3,45.93],['Belle-Île-en-Mer',-3.18,47.33],['Île d’Yeu',-2.35,46.71],['Noirmoutier',-2.25,47.0],['Gorges du Verdon',6.3,43.75],['Mont-Saint-Michel',-1.51,48.64],['Bassin d’Arcachon',-1.15,44.66],['Landes',-1.0,44.0],['Périgord',0.9,45.0],['Lot',1.6,44.6],['Savoie',6.4,45.5],['Haute-Savoie',6.4,46.0],['Cévennes',3.7,44.2],['Loire',0.7,47.35],['Châteaux de la Loire',1.2,47.4],['Champagne',4.0,49.0],['Bourgogne',4.8,47.1],['Beaujolais',4.6,46.1],['Quercy',1.5,44.4],['Gers',0.4,43.65],['Charente-Maritime',-0.9,45.8],['Côte d’Opale',1.6,50.6],['Baie de Somme',1.6,50.2]];
LIEUX_FR=LIEUX_FR.map(function(l){return{nom:l[0],lon:l[1],lat:l[2],sub:'Région / coin de vacances'}});

/* ---------- État ---------- */
var S={profil:'ensemble',type:'monde',inc:true,rows:[],delAsk:null,edit:null,f:{who:'ensemble',type:'monde',coord:null},placeId:null,tipKey:null,user:null};

/* ---------- Connexion (pseudo + mot de passe) ---------- */
var TOKEN=null;try{TOKEN=localStorage.getItem('voyages-token')}catch(e){}
function memo(t){TOKEN=t;try{t?localStorage.setItem('voyages-token',t):localStorage.removeItem('voyages-token')}catch(e){}}
function rpc(nom,args){return sb.rpc(nom,Object.assign({p_token:TOKEN},args||{})).then(function(r){if(r.error&&/session_invalide/.test(r.error.message)){memo(null);vue('vLogin')}return r})}
$('fLogin').onsubmit=async function(e){e.preventDefault();var m=$('lMsg');m.className='msg';m.textContent='';$('lGo').disabled=true;
  var pseudo=norm($('lPseudo').value).replace(/\s/g,''),pw=$('lPw').value;
  var r=await sb.rpc('voyages_connexion',{p_pseudo:pseudo,p_mdp:pw});
  $('lGo').disabled=false;
  if(r.error){var t=r.error.message;
    m.textContent=/pseudo_inconnu/.test(t)?'Pseudo inconnu. Utilisez « Chloé » ou « Mathieu ».':/mdp_faux/.test(t)?'Mot de passe incorrect.':/bloque/.test(t)?'Trop d’essais. Réessayez dans 15 minutes.':/mdp_court/.test(t)?'Le mot de passe doit faire au moins 4 caractères.':'Connexion impossible. Vérifiez votre connexion internet.';return}
  memo(r.data.token);try{localStorage.setItem('voyages-nom',r.data.nom)}catch(x){}
  demarrer();
};
document.querySelectorAll('[data-logout]').forEach(function(b){b.onclick=async function(){if(TOKEN)await sb.rpc('voyages_deconnexion',{p_token:TOKEN});memo(null);location.reload()}});

function vue(v){['vLogin','vApp'].forEach(function(id){$(id).hidden=id!==v})}
function demarrer(){
  if(!TOKEN){vue('vLogin');return}
  vue('vApp');initCartes();charger();
}

/* ---------- Données ---------- */
async function charger(){
  var r=await rpc('voyages_liste');
  if(!TOKEN)return;
  if(r.error){$('etat').textContent='Impossible de charger les voyages. Vérifiez votre connexion.';return}
  $('etat').textContent='';S.rows=r.data||[];render();
}
document.addEventListener('visibilitychange',function(){if(!document.hidden&&!$('vApp').hidden)charger()});

function visibles(type){
  return S.rows.filter(function(r){
    if(r.type!==(type||S.type))return false;
    if(S.profil==='ensemble')return r.profil==='ensemble';
    return r.profil===S.profil||(S.inc&&r.profil==='ensemble');
  });
}

/* ---------- Cartes ---------- */
var W=960,H=500,FW=600,FH=620,M={};
function largest(f){if(f.geometry.type!=='MultiPolygon')return f;var best=null,ba=-1;
  f.geometry.coordinates.forEach(function(c){var g={type:'Polygon',coordinates:c},a=d3.geoArea(g);if(a>ba){ba=a;best=g}});return{type:'Feature',geometry:best}}
function initCartes(){
  if(M.monde)return;
  var feats=topojson.feature(MONDE,MONDE.objects.countries).features.filter(function(f){return f.id!=='010'});
  var pw=d3.geoNaturalEarth1().fitExtent([[6,6],[W-6,H-6]],{type:'FeatureCollection',features:feats});
  var byNum={};feats.forEach(function(f){byNum[f.id]=f;f.c=d3.geoCentroid(largest(f))});
  M.monde={proj:pw,path:d3.geoPath(pw),feats:feats,byNum:byNum,w:W,h:H};
  var pf=d3.geoConicConformal().parallels([44,49]).rotate([-3,0]).fitExtent([[12,12],[FW-12,FH-12]],REGIONS);
  M.france={proj:pf,path:d3.geoPath(pf),feats:REGIONS.features,w:FW,h:FH};
}
var Z={k:1,x:0,y:0};
function lieuCoord(r){
  if(r.lat!=null&&r.lon!=null)return[r.lon,r.lat];
  if(r.type==='monde'){var p=pays(r.lieu);if(p&&M.monde.byNum[p.num])return M.monde.byNum[p.num].c}
  return null;
}
function dessinerCarte(){
  var m=M[S.type],svg=$('svg'),L=visibles();
  $('map').className='map'+(S.type==='france'?' france':'')+(S.placeId?' placing':'');
  svg.setAttribute('viewBox','0 0 '+m.w+' '+m.h);
  /* pays ou régions colorés */
  var fill={};
  if(S.type==='monde'){L.forEach(function(r){var p=pays(r.lieu);if(p){fill[p.num]=fill[p.num]&&fill[p.num]!==r.profil?'ensemble':r.profil}})}
  else{L.forEach(function(r){var c=lieuCoord(r);if(!c)return;m.feats.forEach(function(f,i){if(d3.geoContains(f,c))fill[i]=fill[i]&&fill[i]!==r.profil?'ensemble':r.profil})})}
  var h='<g id="vp" transform="translate('+Z.x+','+Z.y+') scale('+Z.k+')">';
  m.feats.forEach(function(f,i){var key=S.type==='monde'?f.id:i;var p=fill[key];
    h+='<path class="land'+(p?' v':'')+'"'+(p?' style="--c:'+col(p)+'"':'')+' d="'+m.path(f)+'"/>'});
  /* points regroupés par lieu */
  var groups={};
  L.forEach(function(r){var c=lieuCoord(r);if(!c)return;var xy=m.proj(c);if(!xy)return;var k=Math.round(xy[0]/3)+','+Math.round(xy[1]/3);(groups[k]=groups[k]||{xy:xy,rows:[]}).rows.push(r)});
  var rr=(S.type==='monde'?11:9)/Math.sqrt(Z.k);
  Object.keys(groups).forEach(function(k){var g=groups[k],ps={};g.rows.forEach(function(r){ps[r.profil]=1});
    var p=Object.keys(ps).length>1?'ensemble':g.rows[0].profil,n=g.rows.length;
    h+='<g class="pin" data-k="'+k+'" transform="translate('+g.xy[0].toFixed(1)+','+g.xy[1].toFixed(1)+')"><circle r="'+(rr*(n>1?1.35:1)).toFixed(2)+'" fill="'+col(p)+'"/>'+
      (n>1?'<text text-anchor="middle" dy="'+(rr*.45).toFixed(2)+'" font-size="'+(rr*1.25).toFixed(2)+'" font-weight="700" fill="#fff" style="pointer-events:none">'+n+'</text>':'')+'</g>'});
  svg.innerHTML=h+'</g>';
  M.groups=groups;
  if(S.tipKey&&groups[S.tipKey])montrerTip(S.tipKey);else{$('tip').hidden=true;S.tipKey=null}
}
function montrerTip(k){var g=M.groups[k];if(!g)return;S.tipKey=k;
  var rows=g.rows.slice().sort(function(a,b){return cleDate(b)<cleDate(a)?-1:1});
  $('tip').innerHTML='<b>'+esc(rows[0].ville?rows[0].ville+', '+rows[0].lieu:rows[0].lieu)+'</b><br>'+rows.map(function(r){return (periode(r)||r.annee)+' · '+NOMS[r.profil]+(r.raison?' · '+esc(r.raison):'')}).join('<br>');$('tip').hidden=false}

/* zoom et déplacement */
(function(){
  var map=$('map'),pts={},start=null,moved=false;
  function svgPt(e){var r=$('svg').getBoundingClientRect(),m=M[S.type];return[(e.clientX-r.left)*m.w/r.width,(e.clientY-r.top)*m.h/r.height]}
  function zoomAt(f,c){var m=M[S.type];c=c||[m.w/2,m.h/2];var k=Math.max(1,Math.min(14,Z.k*f));Z.x=c[0]-(c[0]-Z.x)*k/Z.k;Z.y=c[1]-(c[1]-Z.y)*k/Z.k;Z.k=k;borne();dessinerCarte()}
  function borne(){var m=M[S.type];if(Z.k<=1){Z.k=1;Z.x=0;Z.y=0;return}Z.x=Math.min(0,Math.max(m.w-m.w*Z.k,Z.x));Z.y=Math.min(0,Math.max(m.h-m.h*Z.k,Z.y))}
  $('zIn').onclick=function(){zoomAt(1.6)};$('zOut').onclick=function(){zoomAt(1/1.6)};$('zR').onclick=function(){Z={k:1,x:0,y:0};dessinerCarte()};
  map.addEventListener('wheel',function(e){e.preventDefault();zoomAt(e.deltaY<0?1.25:0.8,svgPt(e))},{passive:false});
  map.addEventListener('pointerdown',function(e){if(e.target.closest('.zoom,.tip,.place'))return;map.setPointerCapture(e.pointerId);pts[e.pointerId]=svgPt(e);moved=false;start={x:Z.x,y:Z.y,k:Z.k,p:svgPt(e),d:null}});
  map.addEventListener('pointermove',function(e){if(!pts[e.pointerId])return;var p=svgPt(e);pts[e.pointerId]=p;var ids=Object.keys(pts);
    if(ids.length===2){var a=pts[ids[0]],b=pts[ids[1]],d=Math.hypot(a[0]-b[0],a[1]-b[1]),c=[(a[0]+b[0])/2,(a[1]+b[1])/2];
      if(!start.d){start.d=d;start.c=c;start.k=Z.k;start.x=Z.x;start.y=Z.y}
      var k=Math.max(1,Math.min(14,start.k*d/start.d));Z.x=c[0]-(start.c[0]-start.x)*k/start.k;Z.y=c[1]-(start.c[1]-start.y)*k/start.k;Z.k=k;moved=true;borne();dessinerCarte();return}
    var dx=p[0]-start.p[0],dy=p[1]-start.p[1];if(Math.hypot(dx,dy)>4)moved=true;if(moved&&Z.k>1){Z.x=start.x+dx;Z.y=start.y+dy;borne();dessinerCarte()}});
  function fin(e){if(!pts[e.pointerId])return;var p=pts[e.pointerId];delete pts[e.pointerId];if(Object.keys(pts).length)return;start=null;if(moved)return;clic(e,p)}
  map.addEventListener('pointerup',fin);map.addEventListener('pointercancel',function(e){delete pts[e.pointerId]});
  function clic(e,p){
    if(S.placeId){var m=M[S.type],c=m.proj.invert([(p[0]-Z.x)/Z.k,(p[1]-Z.y)/Z.k]);if(c)placer(c);return}
    var pin=document.elementFromPoint(e.clientX,e.clientY);pin=pin&&pin.closest&&pin.closest('.pin');
    if(pin)montrerTip(pin.dataset.k);else{$('tip').hidden=true;S.tipKey=null}
  }
})();

/* placer un lieu à la main */
function commencerPlacement(id){var r=S.rows.find(function(x){return x.id===id});if(!r)return;S.placeId=id;
  if(S.type!==r.type){S.type=r.type;Z={k:1,x:0,y:0}}
  $('placeT').textContent='Touchez la carte pour placer « '+r.lieu+' »';$('place').hidden=false;render();$('map').scrollIntoView({behavior:'smooth',block:'start'})}
$('placeX').onclick=function(){S.placeId=null;$('place').hidden=true;render()};
async function placer(c){var id=S.placeId;S.placeId=null;$('place').hidden=true;
  var r=await rpc('voyages_enregistrer',{p_id:id,p_data:{lon:+c[0].toFixed(4),lat:+c[1].toFixed(4)}});
  if(r.error)alerte('Le point n’a pas pu être enregistré.');await charger()}
function alerte(t){$('etat').textContent=t}

/* ---------- Affichage ---------- */
function render(){
  document.querySelectorAll('.prof').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.p===S.profil)});
  document.querySelectorAll('.bar .seg button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.t===S.type)});
  $('incW').hidden=S.profil==='ensemble';
  if(!M.monde)return;
  dessinerCarte();
  var L=visibles(),u={};L.forEach(function(r){u[S.type==='monde'?(pays(r.lieu)||{}).a2||norm(r.lieu):norm(r.lieu)]=1});
  var ys=L.map(function(r){return r.annee}),mi=Math.min.apply(0,ys),ma=Math.max.apply(0,ys);
  $('s1').textContent=L.length;$('s1l').textContent=S.type==='monde'?(L.length>1?'voyages':'voyage'):(L.length>1?'séjours':'séjour');
  $('s2').textContent=Object.keys(u).length;$('s2l').textContent=S.type==='monde'?'pays':(Object.keys(u).length>1?'lieux':'lieu');
  $('s3').textContent=ys.length?(mi===ma?mi:mi+'–'+String(ma).slice(2)):'—';
  var box=$('liste');
  if(!L.length){box.innerHTML='<div class="vide"><b>'+(S.type==='monde'?'Aucun voyage à l’étranger':'Aucunes vacances en France')+(S.profil==='ensemble'?' à deux':' pour '+NOMS[S.profil])+'</b>Touchez « + Ajouter » pour noter le premier.</div>';return}
  var by={};L.forEach(function(r){(by[r.annee]=by[r.annee]||[]).push(r)});Object.keys(by).forEach(function(y){by[y].sort(function(a,b){return cleDate(b)<cleDate(a)?-1:1})});
  box.innerHTML=Object.keys(by).sort(function(a,b){return b-a}).map(function(y){var g=by[y];
    return '<section class="annee"><h2>'+y+'<small>'+g.length+' '+(S.type==='monde'?(g.length>1?'voyages':'voyage'):(g.length>1?'séjours':'séjour'))+'</small></h2><div class="cards">'+g.map(carte).join('')+'</div></section>'}).join('');
}
function carte(r){
  var p=r.type==='monde'?pays(r.lieu):null,c=lieuCoord(r),sure=S.delAsk===r.id;
  var tags=(S.profil!=='ensemble'&&r.profil==='ensemble'?'<span class="tag">À deux</span> ':'')+(!c?'<span class="tag warn">Pas encore sur la carte</span>':'');
  return '<article class="v"><span class="flag" aria-hidden="true">'+(r.type==='monde'?(flag(p&&p.a2)||'🌍'):'📍')+'</span><div class="txt"><b>'+(r.ville?esc(r.ville)+' <span class="pays">· '+esc(r.lieu)+'</span>':esc(r.lieu))+'</b>'+(r.debut?'<div class="d">'+periode(r)+'</div>':'')+(r.raison?'<div class="r">'+esc(r.raison)+'</div>':'')+tags+
  '<div class="acts"><button data-ed="'+r.id+'">Modifier</button>'+(r.type==='france'?'<button data-pl="'+r.id+'">'+(c?'Déplacer le point':'Placer sur la carte')+'</button>':'')+
  '<button data-del="'+r.id+'" class="'+(sure?'sure':'')+'">'+(sure?'Confirmer la suppression':'Supprimer')+'</button></div></div></article>';
}

document.querySelector('.profils').onclick=function(e){var b=e.target.closest('.prof');if(!b)return;S.profil=b.dataset.p;S.delAsk=null;S.tipKey=null;render()};
document.querySelector('.bar .seg').onclick=function(e){var b=e.target.closest('button');if(!b)return;S.type=b.dataset.t;Z={k:1,x:0,y:0};S.delAsk=null;S.tipKey=null;render()};
$('inc').onchange=function(){S.inc=this.checked;render()};
$('liste').onclick=async function(e){
  var ed=e.target.closest('[data-ed]'),del=e.target.closest('[data-del]'),pl=e.target.closest('[data-pl]');
  if(ed){var r=S.rows.find(function(x){return x.id===ed.dataset.ed});if(r)ouvrir(r);return}
  if(pl){commencerPlacement(pl.dataset.pl);return}
  if(del){if(S.delAsk!==del.dataset.del){S.delAsk=del.dataset.del;render();return}
    S.delAsk=null;var x=await rpc('voyages_supprimer',{p_id:del.dataset.del});if(x.error)alerte('La suppression n’a pas marché.');charger()}
};

/* ---------- Fenêtre d'ajout ---------- */
function ouvrir(r){
  S.edit=r?r.id:null;S.f={who:r?r.profil:S.profil,type:r?r.type:S.type,coord:r&&r.lat!=null?{lat:r.lat,lon:r.lon}:null};
  $('fd').value=r?ecrireDate(r.debut||String(r.annee)):'';$('ff').value=r?ecrireDate(r.fin):'';$('fv').value=r?(r.ville||''):'';$('sugg2').innerHTML='';
  $('fl').value=r?r.lieu:'';$('fr').value=r?(r.raison||''):'';
  $('ft').textContent=r?'Modifier le voyage':'Ajouter un voyage';$('fs').textContent=r?'Enregistrer':'Ajouter';$('fm').textContent='';$('sugg').innerHTML='';
  majForm();$('sheet').hidden=false;setTimeout(function(){$('fl').focus()},50);
}
function fermer(){$('sheet').hidden=true}
function majForm(){
  document.querySelectorAll('#who button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.w===S.f.who)});
  document.querySelectorAll('#ftype button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.t===S.f.type)});
  $('fll').textContent=S.f.type==='monde'?'Pays':'Ville ou région';$('fl').placeholder=S.f.type==='monde'?'Ex. : Italie':'Ex. : Annecy';
  var c=$('fcoord');$('villeW').hidden=S.f.type!=='monde';
  if(S.f.type==='monde'){var p=pays($('fl').value);c.textContent=$('fl').value.trim()?(p?(S.f.coord?'📍 '+$('fv').value.trim()+' placé sur la carte':flag(p.a2)+' '+p.nom+' : point au centre du pays'+($('fv').value.trim()?' (choisissez la ville dans la liste pour la placer)':'')):'Pays non reconnu : choisissez-le dans la liste.'):''}
  else c.textContent=S.f.coord?'📍 Placé sur la carte':($('fl').value.trim()?'Choisissez une suggestion, ou placez le point sur la carte après l’ajout.':'');
}
$('fab').onclick=function(){ouvrir(null)};
$('fc').onclick=fermer;
$('sheet').addEventListener('click',function(e){if(e.target===this)fermer()});
$('who').onclick=function(e){var b=e.target.closest('button');if(!b)return;S.f.who=b.dataset.w;majForm()};
$('ftype').onclick=function(e){var b=e.target.closest('button');if(!b)return;S.f.type=b.dataset.t;S.f.coord=null;$('sugg').innerHTML='';majForm()};

var tmr=null,reqN=0;
$('fl').addEventListener('input',function(){if(S.f.type==='france')S.f.coord=null;majForm();clearTimeout(tmr);var q=this.value.trim();
  if(q.length<2){$('sugg').innerHTML='';return}
  if(S.f.type==='monde'){var n=norm(q),res=PAYS_LISTE.filter(function(p){return norm(p.nom).indexOf(n)===0}).concat(PAYS_LISTE.filter(function(p){var x=norm(p.nom);return x.indexOf(n)>0})).slice(0,6);
    sugg(res.map(function(p){return{label:flag(p.a2)+' '+p.nom,val:p.nom}}));return}
  tmr=setTimeout(async function(){var my=++reqN,n=norm(q);
    var loc=LIEUX_FR.filter(function(l){return norm(l.nom).indexOf(n)===0}).slice(0,3).map(function(l){return{label:l.nom,sub:l.sub,val:l.nom,lat:l.lat,lon:l.lon}});
    var api=[];try{var r=await fetch('https://geo.api.gouv.fr/communes?nom='+encodeURIComponent(q)+'&fields=nom,centre,departement&boost=population&limit=6');
      if(r.ok)api=(await r.json()).filter(function(c){return c.centre}).map(function(c){return{label:c.nom,sub:c.departement?c.departement.nom+' ('+c.departement.code+')':'',val:c.nom,lat:c.centre.coordinates[1],lon:c.centre.coordinates[0]}})}catch(e){}
    if(my===reqN)sugg(loc.concat(api).slice(0,7))},250);
});
function sugg(list){$('sugg').innerHTML=list.map(function(s,i){return '<button type="button" data-i="'+i+'">'+esc(s.label)+(s.sub?' <small>'+esc(s.sub)+'</small>':'')+'</button>'}).join('');$('sugg')._l=list}
$('sugg').onclick=function(e){var b=e.target.closest('button');if(!b)return;var s=this._l[+b.dataset.i];$('fl').value=s.val;if(S.f.type==='france')S.f.coord=s.lat!=null?{lat:s.lat,lon:s.lon}:null;this.innerHTML='';majForm();(S.f.type==='monde'?$('fv'):$('fr')).focus()};

/* Ville à l'étranger (OpenStreetMap) */
var tmr2=null,reqV=0;
$('fv').addEventListener('input',function(){S.f.coord=null;majForm();clearTimeout(tmr2);var q=this.value.trim(),p=pays($('fl').value);
  if(q.length<2){$('sugg2').innerHTML='';return}
  tmr2=setTimeout(async function(){var my=++reqV,res=[];
    try{var u='https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&accept-language=fr&q='+encodeURIComponent(q)+(p?'&countrycodes='+p.a2.toLowerCase():'');
      var r=await fetch(u);if(r.ok)res=(await r.json()).filter(function(x){return x.lat}).map(function(x){var ad=x.address||{};
        return{label:x.name||q,sub:[ad.state||ad.county||'',ad.country||''].filter(Boolean).join(', '),lat:+x.lat,lon:+x.lon}})}catch(e){}
    if(my===reqV){$('sugg2').innerHTML=res.map(function(s,i){return '<button type="button" data-i="'+i+'">'+esc(s.label)+(s.sub?' <small>'+esc(s.sub)+'</small>':'')+'</button>'}).join('');$('sugg2')._l=res}},400);
});
$('sugg2').onclick=function(e){var b=e.target.closest('button');if(!b)return;var s=this._l[+b.dataset.i];$('fv').value=s.label;S.f.coord={lat:s.lat,lon:s.lon};this.innerHTML='';majForm();$('fr').focus()};

$('f').onsubmit=async function(e){e.preventDefault();var m=$('fm');m.textContent='';
  var deb=lireDate($('fd').value),fin=lireDate($('ff').value),l=$('fl').value.trim(),rs=$('fr').value.trim(),vi=S.f.type==='monde'?$('fv').value.trim():'';
  if(!deb){m.textContent=deb===null?'Date de début non reconnue. Écrivez par exemple 12/03/2024, 03/2024 ou 2024.':'Indiquez au moins l’année de début.';return}
  if(fin===null){m.textContent='Date de fin non reconnue. Écrivez par exemple 19/03/2024, 03/2024 ou 2024.';return}
  var n=Math.min(fin.length,deb.length);if(fin&&fin.slice(0,n)<deb.slice(0,n)){m.textContent='La date de fin est avant la date de début.';return}
  var y=+deb.slice(0,4);
  if(!l){m.textContent=S.f.type==='monde'?'Indiquez le pays.':'Indiquez la ville ou la région.';return}
  if(S.f.type==='monde'){var p=pays(l);if(!p){m.textContent='Pays non reconnu : choisissez-le dans la liste des suggestions.';return}l=p.nom}
  if(S.f.type==='monde'&&!vi)S.f.coord=null;
  if(S.f.type==='france'&&!S.f.coord){var k=LIEUX_FR.find(function(x){return norm(x.nom)===norm(l)});if(k)S.f.coord={lat:k.lat,lon:k.lon}}
  var d={profil:S.f.who,type:S.f.type,annee:y,debut:deb,fin:fin||'',ville:vi,lieu:l,raison:rs||null,lat:S.f.coord?S.f.coord.lat:null,lon:S.f.coord?S.f.coord.lon:null};
  $('fs').disabled=true;
  var r=await rpc('voyages_enregistrer',{p_id:S.edit||null,p_data:d});
  $('fs').disabled=false;
  if(r.error){m.textContent='L’enregistrement n’a pas marché. Vérifiez votre connexion et réessayez.';return}
  fermer();S.type=d.type;if(S.profil!==d.profil&&!(d.profil==='ensemble'&&S.inc))S.profil=d.profil;await charger();
};

/* ---------- Application installable ---------- */
if('serviceWorker' in navigator)window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});

/* ---------- Lancement ---------- */
demarrer();

$('f').addEventListener('input',function(){$('fm').textContent=''});
