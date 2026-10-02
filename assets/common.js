/* 共有・コピー・広告クリック計測・一覧の絞り込み。依存なし。 */
(function(){
var T=document.getElementById('toast');
function toast(m){if(!T)return;T.textContent=m;T.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){T.hidden=true},2200)}
function src(){var m=/[?&]utm_source=([^&]+)/.exec(location.search);return m?decodeURIComponent(m[1]):(/Instagram/i.test(navigator.userAgent)?'ig-inapp':'direct')}
function adp(a){return {ad_program:a.dataset.ad,ad_rule:a.dataset.rule||'',job_name:a.dataset.job||'',placement:a.dataset.placement||'',seat_type:a.dataset.seat||'',source:src()}}
function ga(n,p){try{if(window.gtag)gtag('event',n,p)}catch(e){}}
function copy(t){
  if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(t).then(function(){toast('URLをコピーしました')},function(){fb(t)})}
  fb(t)}
function fb(t){var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');toast('URLをコピーしました')}catch(e){toast('コピーできませんでした')}document.body.removeChild(a)}
function saveImg(img,name){
  return fetch(img).then(function(r){return r.blob()}).then(function(b){
    var f=new File([b],name,{type:b.type||'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){return navigator.share({files:[f]}).catch(function(){})}
    var u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();document.body.removeChild(a);setTimeout(function(){URL.revokeObjectURL(u)},4000);toast('画像を保存しました');
  }).catch(function(){toast('画像を保存できませんでした')})}
document.addEventListener('click',function(e){
  var ad=e.target.closest('a[data-ad]');if(ad){ga('ad_click',adp(ad));return}
  var sn=e.target.closest('a[data-sns]');if(sn){ga('sns_click',{platform:sn.dataset.sns,place:sn.dataset.place||''});return}
  var st=e.target.closest('a[data-seat]');if(st){ga('seat_click',{seat_kind:st.dataset.seat,to:st.querySelector('b')?st.querySelector('b').textContent:''})}
  var b=e.target.closest('[data-act]');if(!b)return;
  var s=b.closest('.share');if(!s)return;
  var url=s.dataset.url,text=s.dataset.text,job=s.dataset.job||'',act=b.dataset.act;
  ga('share',{method:act,job_name:job});
  if(act==='native'){navigator.share({title:text,text:text,url:url}).catch(function(){})}
  else if(act==='copy'){copy(url)}
  else if(act==='save'){saveImg(s.dataset.img,'zukan-'+(s.dataset.id||'result')+'.png')}
});
/* Web Share API が使える端末では「共有する」を先頭に出す */
function ready(root){if(navigator.share){[].forEach.call((root||document).querySelectorAll('.share'),function(s){s.classList.add('native');var n=s.querySelector('[data-act=native]');if(n)n.hidden=false})}}
ready();window.zkShareReady=ready;
/* 広告の表示計測(枠が画面に入ったとき1回) */
try{var ads=document.querySelectorAll('.ad a[data-ad]');if(ads.length&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){ga('ad_view',adp(en.target));io.unobserve(en.target)}})},{threshold:.5});[].forEach.call(ads,function(a){io.observe(a)})}}catch(e){}
/* 一覧ページ */
var f=document.getElementById('flt');
if(f){
  var L=[].slice.call(document.querySelectorAll('.rows li[data-n]')),H=[].slice.call(document.querySelectorAll('.bandh')),c=document.getElementById('cnt'),
      B=[].slice.call(document.querySelectorAll('.fchips button')),field='';
  function nz(s){return s.normalize('NFKC').toLowerCase().replace(/\s/g,'')}
  function go(){var v=nz(f.value),n=0;
    L.forEach(function(li){var ok=(!v||nz(li.dataset.n).indexOf(v)>=0)&&(!field||li.dataset.f===field);li.hidden=!ok;if(ok)n++});
    H.forEach(function(h){var u=h.nextElementSibling,any=u&&[].some.call(u.children,function(x){return !x.hidden});h.hidden=!any;if(u)u.hidden=!any});
    c.textContent=n+'職種を表示中'}
  f.addEventListener('input',go);
  B.forEach(function(b){b.addEventListener('click',function(){field=field===b.dataset.f?'':b.dataset.f;B.forEach(function(x){x.setAttribute('aria-pressed',x.dataset.f===field&&field?'true':'false')});go()})});
  var m=/[?&]f=([a-z]+)/.exec(location.search);if(m){var t=B.filter(function(x){return x.dataset.f===m[1]})[0];if(t)t.click()}
}
/* Instagram の内蔵ブラウザ(または utm_source=ig)で開いたときだけ、「ブラウザで開く」を案内する */
try{
  var igq=/[?&]utm_source=ig(&|$)/.test(location.search),igua=/Instagram/i.test(navigator.userAgent);
  var off=false;try{off=sessionStorage.getItem('zk-igbar-off')}catch(e){}
  if((igq||igua)&&!off){
    var bar=document.createElement('div');bar.className='igbar';bar.setAttribute('role','note');
    var sp=document.createElement('span');sp.innerHTML='Instagramの画面で開いています。共有や広告のリンクがうまく動かないことがあります。右上(または右下)の「…」から<b>「ブラウザで開く」</b>を選ぶと確実です。';
    bar.appendChild(sp);
    var x=document.createElement('button');x.type='button';x.textContent='閉じる';x.onclick=function(){bar.remove();try{sessionStorage.setItem('zk-igbar-off','1')}catch(e){}};bar.appendChild(x);
    document.body.insertBefore(bar,document.body.firstChild);
    ga('ig_inapp',{via:igua?'ua':'utm'});
  }
}catch(e){}
})();
