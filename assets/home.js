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
async function show(d,o={}){
  hitEl.innerHTML='';q.value=d.j;
  const id=String(d.r).padStart(3,'0');
  try{
    const res=await fetch('/d/'+id+'.json');const j=await res.json();
    out.innerHTML=j.html;window.zkShareReady&&zkShareReady(out);
  }catch(e){out.innerHTML='<p class="msg">結果を読み込めませんでした。<a href="/j/'+id+'.html">'+d.j+'のページ</a>を開いてください。</p>';}
  document.title=d.j+'の絶滅リスク(推定)｜絶滅職種図鑑';
  history.replaceState(null,'',location.pathname+'#'+encodeURIComponent(d.j));
  if(o.scroll!==false)requestAnimationFrame(()=>{const r=$('#res');if(r)r.scrollIntoView({behavior:o.instant?'auto':'smooth',block:'start'})});
  ga('job_lookup',{job_name:d.j,job_band:d.b?BS[d.b-1]:''});
}
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
  if(pick&&(ex||r.list.length===1||!composing)){show(pick,{});q.blur()}else{all=false;search(v,true)}
}
q.addEventListener('compositionstart',()=>composing=true);
q.addEventListener('compositionend',()=>{composing=false;search(q.value,true)});
q.addEventListener('input',()=>{all=false;if(out.innerHTML&&q.value!==(out.querySelector('.jn')||{}).textContent){out.innerHTML='';document.title=HOME_TITLE;history.replaceState(null,'',location.pathname)}search(q.value,!composing)});
$('#find').addEventListener('submit',e=>{e.preventDefault();if(composing)return;submit()});
document.addEventListener('click',e=>{
  const b=e.target.closest('button[data-r],a[data-r]');if(b){e.preventDefault();const d=D.find(x=>x.r===+b.dataset.r);if(d){show(d);q.blur()}return}
  const m=e.target.closest('button[data-more]');if(m){all=true;search(q.value,true);return}
  const c=e.target.closest('button[data-q]');if(c){q.value=c.dataset.q;all=false;search(c.dataset.q,true)}});
function fromHash(){
  let h=decodeURIComponent(location.hash.slice(1)||'');const m=/[?&]q=([^&]+)/.exec(location.search);if(!h&&m)h=decodeURIComponent(m[1]);
  if(!h)return;let d=D.find(x=>x.j===h);if(!d){const l=find(norm(h)).list;if(l.length)d=l[0]}
  if(d)show(d,{instant:true})}
window.addEventListener('hashchange',fromHash);
fromHash();
})();
