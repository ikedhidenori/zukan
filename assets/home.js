/* トップの検索と結果の展開。search-core(職種名の揺れ・別名)は現行 index.html から引き継ぎ。D は window.ZK_INDEX。 */
(function(){
const D=window.ZK_INDEX.map(x=>({r:x.r,j:x.j,b:x.b,f:x.f,v:x.v}));
const BS=window.ZK_BANDS;
const $=s=>document.querySelector(s);
const kata=s=>s.replace(/[ぁ-ゖ]/g,c=>String.fromCharCode(c.charCodeAt(0)+0x60));
const norm=s=>kata(String(s).normalize('NFKC').toLowerCase()).replace(/[\s・、，,。．.()（）\/／「」]/g,'');
const DN=D.map(d=>norm(d.j));
const ALIAS=[['科捜研',['科学捜査研究所']],['se',['システムエンジニア']],['itエンジニア',['システムエンジニア']],['スーパーのレジ',['スーパーレジ']],['レジ打ち',['レジ']],['ホテルのフロント',['フロントホテル']],['看護士',['看護師']],['看護婦',['看護師']],['社労士',['社会保険労務士']],['歯医者',['歯科医師']],['お医者',['科医']],['医者',['科医']],['医師',['科医','医師']],['ドクター',['科医']],['市役所',['地方公務員']],['区役所',['地方公務員']],['役所',['公務員']],['ウェブ',['web']],['ドライバー',['運転手','ドライバー']],['シェフ',['調理人']],['料理人',['調理人']],['テレアポ',['コールセンター']],['介護士',['介護員','ヘルパー']],['介護職員',['介護員','ヘルパー']],['介護職',['介護員','ヘルパー']],['介護福祉士',['介護員','ヘルパー']],['ケアマネージャー',['ケアマネジャー']],['ケアマネ',['ケアマネジャー']],['銀行員',['銀行']],['販売員',['販売','店員']],['事務員',['事務']],['先生',['教員','教師','講師']],['教師',['教師','教員']],['プログラマ',['プログラマー']],['保母',['保育士']],['デザイナ',['デザイナー']],['梱包',['こん包','包装']],['缶詰',['かん詰']],['農家',['農業','栽培','酪農']],['百姓',['農業','栽培']],['自衛隊',['自衛官']],['駅員',['駅務員']],['漁師',['漁業']],['ネイル',['ネイリスト']],['美容室',['美容師']],['美容院',['美容師']],['床屋',['理容師']],['パン屋',['パン']],['管理栄養士',['栄養士']],['現場監督',['施工管理']],['キャビンアテンダント',['客室乗務員']],['スチュワーデス',['客室乗務員']],['ca',['客室乗務員']],['工場',['工場','製造','検査工']],['警備員',['警備員']],['掃除',['清掃']],['かんごし',['看護師']],['かんご',['看護']],['かいご',['介護']],['じむ',['事務']],['うんてん',['運転']],['ほいくし',['保育士']],['ほいく',['保育']],['えいぎょう',['営業']],['けいり',['経理']],['いりょう',['医療']],['やくざいし',['薬剤師']],['ぜいりし',['税理士']],['べんごし',['弁護士']],['きょうし',['教師','教員']],['はんばい',['販売']],['ちょうり',['調理']],['寿司',['すし']],['鮨',['すし']],['塾講師',['学習塾教師']],['塾の先生',['学習塾教師']],['保育園の先生',['保育士']],['保育園',['保育']],['幼稚園の先生',['幼稚園教員']],['管理人',['管理員']],['ガードマン',['警備員']],['守衛',['警備員']],['保険外交員',['保険営業']],['生保レディ',['保険営業']],['生保',['保険営業']],['営業マン',['営業']],['酪農家',['酪農']],['ビル管理',['ビル施設管理']],['鍼灸師',['はり師']],['鍼灸',['はり師']],['庭師',['造園']],['植木屋',['造園']],['町役場',['地方公務員']],['村役場',['地方公務員']],['役場',['地方公務員']],['県庁',['地方公務員']],['看守',['刑務官']],['建築士',['建築設計']],['社長',['会社経営者']],['経営者',['会社経営者']],['オーナー',['会社経営者']],['トラック',['トラック']],['建設',['建設','施工管理','大工','左官','とび']],['美容',['美容','理容師','ネイリスト']],['宅建',['不動産営業']],['工場',['工場','製造','検査工']]].map(([a,b])=>[norm(a),b.map(norm)]);
const WORKSTYLE=['会社員','サラリーマン','ol','パート','パートタイマー','アルバイト','バイト','派遣','派遣社員','正社員','契約社員','社員','フリーター','主婦','主夫','専業主婦','学生','無職','フリーランス','個人事業主','自営業'].map(norm);
const HUMAN_DR=['医者','医師','ドクター','お医者'].map(norm);
const inc=(k,a)=>/^[a-z0-9]{1,2}$/.test(a)?new RegExp('(^|[^a-z])'+a+'([^a-z]|$)').test(k):k.includes(a);
function terms(k){const t=[k];const m=ALIAS.filter(([a])=>inc(k,a));for(const[a,bs]of m){if(m.some(([a2])=>a2!==a&&a2.includes(a)))continue;for(const b of bs)t.push(k===a?b:k.replace(a,b))}return[...new Set(t.filter(Boolean))]}
const hit=(n,t)=>/^[a-z0-9]{1,2}$/.test(t)?new RegExp('(^|[^a-z])'+t+'([^a-z]|$)').test(n):n.includes(t);
function find(k0){let k=k0.replace(/(サン|サマ|チャン|サマ)$/,'')||k0;if(WORKSTYLE.includes(k))return{list:[],how:'',ws:true};
 const ts=terms(k);let idx=D.map((d,i)=>i).filter(i=>ts.some(t=>hit(DN[i],t)));let how='';
 if(!idx.length&&k.includes('ノ')){const ps=k.split('ノ').filter(Boolean);idx=D.map((d,i)=>i).filter(i=>ps.every(p=>terms(p).some(t=>hit(DN[i],t))))}
 if(!idx.length){const s=k.replace(/(職員|員|士|職|者|師|婦|係|屋|家|人|マン|長)$/,'');if(s&&s!==k&&s.length>=2){idx=D.map((d,i)=>i).filter(i=>terms(s).some(t=>hit(DN[i],t)));if(idx.length)how=s}}
 if(!idx.length){const at=ALIAS.filter(([a])=>inc(k,a)).flatMap(([a,bs])=>bs);if(at.length)idx=D.map((d,i)=>i).filter(i=>at.some(t=>hit(DN[i],t)))}
 if(!idx.length){idx=D.map((d,i)=>i).filter(i=>DN[i].length>=2&&k.includes(DN[i]))}
 const dm=i=>HUMAN_DR.includes(k)&&(D[i].j==='獣医師'||D[i].j==='歯科医師')?1:0;
 const sc=i=>ts.some(t=>DN[i]===t)?0:ts.some(t=>DN[i].startsWith(t))?1:2;
 idx.sort((a,b)=>dm(a)-dm(b)||sc(a)-sc(b)||a-b);return{list:idx.map(i=>D[i]),how,ts,via:!how&&idx.length>0&&!idx.some(i=>hit(DN[i],k))}}

const HOME_TITLE=document.title;
const q=$('#q'),hitEl=$('#hit'),out=$('#out');
const esc=v=>v.replace(/[<>&"]/g,'');
const chip=(b,v)=>b?`<span class="bc${b===1?' hot':''}">${v} ${BS[b-1]}</span>`:'';
function ga(n,p){try{if(window.gtag)gtag('event',n,p)}catch(e){}}
const GUESS=['高い','中くらい','低い'];
function ask(d){
  hitEl.innerHTML='';q.value=d.j;
  if(!d.b){show(d,{});return}
  out.innerHTML='<div class="guess" id="guess"><p>'+d.j+'の絶滅リスクは、405職種の中でどのあたり?</p><div class="gb">'+GUESS.map((g,i)=>'<button type="button" data-g="'+(i+1)+'">'+g+'</button>').join('')+'</div><button type="button" class="skip" data-g="0">予想せずに見る</button></div>';
  requestAnimationFrame(()=>{const g=$('#guess');if(g)g.scrollIntoView({behavior:'smooth',block:'center'})});
  window._pending=d;
}
async function show(d,o={}){
  hitEl.innerHTML='';q.value=d.j;
  const id=String(d.r).padStart(3,'0');
  try{
    const res=await fetch('/d/'+id+'.json');const j=await res.json();
    out.innerHTML=j.html;window.zkShareReady&&zkShareReady(out);
    const card=out.querySelector('.card');
    if(card){const im=document.createElement('div');im.textContent='記録';im.setAttribute('aria-hidden','true');im.className='stamp';card.appendChild(im);requestAnimationFrame(()=>im.classList.add('go'))}
    if(o.guess){const ok=o.guess===d.b;const p=document.createElement('p');p.className='guessres';const dir=ok?'(予想どおりでした)':(d.b<o.guess?'(予想より高い結果でした)':'(予想より低い結果でした)');const mk=card&&card.querySelector('details.mk summary');const edge=mk&&/境目あたり|まとめ方で帯が変わる/.test(mk.textContent)?' 境目あたり、または合わせ方で帯が変わる職種なので、隣の帯もありえます。':'';p.textContent='あなたの予想: '+GUESS[o.guess-1]+' / 結果: '+GUESS[d.b-1]+dir+edge;if(card)card.after(p);ga('guess',{job_name:d.j,guess:GUESS[o.guess-1],result:GUESS[d.b-1],match:ok})}
  }catch(e){out.innerHTML='<p class="msg">結果を読み込めませんでした。<a href="/j/'+id+'.html">'+d.j+'のページ</a>を開いてください。</p>';}
  document.title=d.j+'の絶滅リスク(推定)｜絶滅職種図鑑';
  markMap(d);
  history.replaceState(null,'',location.pathname+'#'+encodeURIComponent(d.j));
  if(o.scroll!==false)requestAnimationFrame(()=>{const r=$('#res');if(r)r.scrollIntoView({behavior:o.instant?'auto':'smooth',block:'start'})});
  ga('job_lookup',{job_name:d.j,job_band:d.b?BS[d.b-1]:''});
}
function markMap(d){const svg=document.querySelector('#scat svg');if(!svg)return;
  svg.querySelectorAll('circle.me').forEach(c=>c.classList.remove('me'));svg.querySelectorAll('.melab').forEach(t=>t.remove());
  document.querySelectorAll('.qcards li.mine').forEach(l=>l.classList.remove('mine'));
  const c=svg.querySelector('circle[data-r="'+d.r+'"]');if(!c)return;c.classList.add('me');svg.appendChild(c);
  const li=document.querySelector('.qcards li[data-q="'+c.dataset.q+'"]');if(li)li.classList.add('mine');
  const NS='http://www.w3.org/2000/svg',t=document.createElementNS(NS,'text');t.setAttribute('class','melab');t.textContent='あなた: '+d.j;svg.appendChild(t);
  const x=+c.getAttribute('cx'),y=+c.getAttribute('cy');
  const names=[...svg.querySelectorAll('.qn')].map(n=>{try{return n.getBBox()}catch(e){return null}}).filter(Boolean);
  const cand=[[x+12,y+5,'start'],[x-12,y+5,'end'],[x+12,y+26,'start'],[x-12,y+26,'end'],[x+12,y-12,'start'],[x-12,y-12,'end'],[x,y+34,'middle'],[x,y-18,'middle']];
  let best=cand[0];
  for(const p of cand){t.setAttribute('x',p[0]);t.setAttribute('y',p[1]);t.setAttribute('text-anchor',p[2]);let bb;try{bb=t.getBBox()}catch(e){break}
    const inside=bb.x>=0&&bb.x+bb.width<=640&&bb.y>=0&&bb.y+bb.height<=440;
    const hit=names.some(n=>bb.x<n.x+n.width&&bb.x+bb.width>n.x&&bb.y<n.y+n.height&&bb.y+bb.height>n.y);
    if(inside&&!hit){best=p;break}}
  t.setAttribute('x',best[0]);t.setAttribute('y',best[1]);t.setAttribute('text-anchor',best[2])}
let all=false,composing=false;
const CATS=['事務','販売','運転','介護','看護','医療','調理','製造','建設','教員','エンジニア','営業','公務員','美容','農業'];
function search(v,final){
  const k=norm(v);if(!k){hitEl.innerHTML='';return}
  const r=find(k),list=r.list;
  if(!list.length){
    if(composing&&!final){hitEl.innerHTML='';return}
    const head=r.ws?`<p class="msg">「${esc(v)}」は働き方の呼び名なので、順位は出せません。<small>ふだんの仕事の中身(事務・営業・運転など)で試してください。</small></p>`
      :`<p class="msg">「${esc(v)}」は見つかりませんでした。<small>国の職業データ405職種の名前で探しています。「事務」「営業」のような短い言葉や、近い分野から試してください。</small></p>`;
    hitEl.innerHTML=head+`<div class="alt">${CATS.map(c=>`<button type="button" data-q="${c}">${c}</button>`).join('')}</div><p class="msg"><a href="/j/">405職種の一覧から探す ›</a></p>`;
    return}
  const shown=all?list:list.slice(0,6);
  hitEl.innerHTML=(r.how?`<p class="msg">「${r.how}」で探しました。</p>`:r.via?`<p class="msg">「${esc(v)}」に近い職種名を表示しています。</p>`:'')
   +shown.map(d=>`<button type="button" data-r="${d.r}"><span>${d.j}</span>${chip(d.b,d.v)}</button>`).join('')
   +(list.length>shown.length?`<button type="button" class="more" data-more="1">ほか${list.length-shown.length}件を表示</button>`:'');
}
function submit(){
  const v=q.value,k=norm(v);if(!k)return;
  const r=find(k);const ex=r.list.find(d=>(r.ts||[]).includes(norm(d.j)));
  const pick=ex||(r.list.length>=1?r.list[0]:null);
  if(pick&&(ex||r.list.length===1||!composing)){ask(pick);q.blur()}else{all=false;search(v,true)}
}
q.addEventListener('compositionstart',()=>composing=true);
q.addEventListener('compositionend',()=>{composing=false;search(q.value,true)});
q.addEventListener('input',()=>{all=false;if(out.innerHTML&&q.value!==(out.querySelector('.jn')||{}).textContent){out.innerHTML='';document.title=HOME_TITLE;history.replaceState(null,'',location.pathname)}search(q.value,!composing)});
$('#find').addEventListener('submit',e=>{e.preventDefault();if(composing)return;submit()});
document.addEventListener('click',e=>{
  const gb=e.target.closest('button[data-g]');if(gb){const d=window._pending;if(d){const g=+gb.dataset.g;show(d,{guess:g||0})}return}
  const b=e.target.closest('button[data-r],a[data-r]');if(b){e.preventDefault();const d=D.find(x=>x.r===+b.dataset.r);if(d){ask(d);q.blur()}return}
  const m=e.target.closest('button[data-more]');if(m){all=true;search(q.value,true);return}
  const c=e.target.closest('button[data-q]');if(c){q.value=c.dataset.q;all=false;search(c.dataset.q,true)}});
function fromHash(){
  let h=decodeURIComponent(location.hash.slice(1)||'');const m=/[?&]q=([^&]+)/.exec(location.search);if(!h&&m)h=decodeURIComponent(m[1]);
  if(!h)return;let d=D.find(x=>x.j===h);if(!d){const l=find(norm(h)).list;if(l.length)d=l[0]}
  if(d)show(d,{instant:true})}
window.addEventListener('hashchange',fromHash);
fromHash();
/* 散布図: 押した位置に近い点を選び、職種へのリンクを出す */
const sc=document.getElementById('scat');
if(sc){const svg=sc.querySelector('svg'),tip=document.getElementById('scat-tip');let sel=null;
  const pick=(ev)=>{const r=svg.getBoundingClientRect(),vb=svg.viewBox.baseVal,k=Math.min(r.width/vb.width,r.height/vb.height),ox=(r.width-vb.width*k)/2,oy=(r.height-vb.height*k)/2;
    const x=(ev.clientX-r.left-ox)/k,y=(ev.clientY-r.top-oy)/k;let best=null,bd=1e9;
    svg.querySelectorAll('circle').forEach(c=>{const dx=+c.getAttribute('cx')-x,dy=+c.getAttribute('cy')-y,dd=dx*dx+dy*dy;if(dd<bd){bd=dd;best=c}});
    if(best&&bd<30*30){if(sel)sel.classList.remove('sel');sel=best;best.classList.add('sel');
      document.getElementById('st-n').textContent=best.dataset.n;document.getElementById('st-v').textContent='絶滅リスク(推定) '+best.dataset.v+'/100';
      const a=document.getElementById('st-a');a.href='/j/'+String(best.dataset.r).padStart(3,'0')+'.html';tip.hidden=false;ga('map_pick',{job_name:best.dataset.n})}};
  svg.addEventListener('click',pick);}
})();
