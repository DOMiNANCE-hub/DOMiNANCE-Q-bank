"use strict";
(function(){
const root=document.getElementById("app");
const LS="dominance-cvs-qbank-v2",TS="dominance-cvs-theme";
const S={page:"home",tab:"past",theme:localStorage.getItem(TS)==="light"?"light":"dark",sets:{past:[],mock:[]},selected:null,attempt:null,filter:"all",loadError:""};
const LABEL={past:"Past Questions",mock:"Mock Questions"};
const SOURCE={past:"Compiled from the Net",mock:"Curated by DOMiNANCE"};
const abc="ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const x=v=>String(v===undefined||v===null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt=n=>Number(n||0).toLocaleString("en-US");
const plural=(n,s)=>n+" "+s+(n===1?"":"s");
function put(){try{if(S.attempt)localStorage.setItem(LS,JSON.stringify(S.attempt));else localStorage.removeItem(LS)}catch(e){console.warn("Save unavailable",e)}}
function getSet(c,id){return S.sets[c].find(v=>v.id===id)}
function selected(){return S.selected&&getSet(S.selected.cat,S.selected.id)}
function header(){
 return '<header class="topbar"><div class="shell bar"><button class="wordmark" data-act="home">DOM<span class="smalli">i</span>NANCE<small>CVS QUESTION BANK</small></button><div class="headtools">'+
 (S.attempt&&S.page!=="quiz"?'<button class="btn outline small" data-act="resume">Resume</button>':"")+
 '<button class="btn outline icon" data-act="theme" aria-label="Switch light or dark theme" title="Switch theme">'+(S.theme==="dark"?"☀":"☾")+'</button></div></div></header>';
}
function footer(){return '<footer class="footer"><div class="shell footrow"><span>DOM<span style="color:var(--gold)">i</span>NANCE · CVS Question Bank</span><span>Past Questions: Compiled from the Net · Mock Questions: Curated by DOMiNANCE</span></div></footer>'}
function home(){
 const total=S.sets.past.reduce((n,s)=>n+s.questions.length,0);
 const mocks=S.sets.mock.filter(z=>z.ready).reduce((n,s)=>n+s.questions.length,0);
 const cards=S.sets[S.tab].map(z=>{
  const available=z.ready!==false;
  return '<article class="set"><div class="top"><div class="symbol">'+(S.tab==="past"?"▤":"✦")+'</div><span class="label '+(available?"on":"")+'">'+(available?"Available":"Not imported")+'</span></div>'+
    '<h3>'+x(z.title)+'</h3><p>'+x(z.subtitle)+'</p><p>'+SOURCE[S.tab]+'</p>'+
    '<div class="setfoot"><div><div class="count">'+(available?plural(z.questions.length,"question"):"—")+'</div><div class="detail">'+(available?(S.tab==="past"?"Original question order retained":"60 questions · 90 minutes"):"Awaiting verified source")+'</div></div>'+
    '<button class="btn small" data-act="pick" data-cat="'+S.tab+'" data-id="'+x(z.id)+'"'+(available?"":" disabled")+'>Select set</button></div></article>';
 }).join("");
 return '<section class="hero"><div class="shell"><p class="eyebrow">Learn it. Test it. Master it.</p><h1>Cardiovascular Physiology, <span>made testable.</span></h1><p>Original past-question sets and DOMiNANCE-curated exam mocks, in one focused examination hub.</p>'+
  '<div class="chips"><span class="chip"><strong>'+fmt(total)+'</strong> past-question stems</span><span class="chip"><strong>'+fmt(mocks)+'</strong> loaded mock questions</span><span class="chip">Practice + Exam modes</span><span class="chip">Light + Dark themes</span></div></div></section>'+
  '<main class="shell" id="main"><div class="section-title"><h2>Choose your question collection</h2><p>Choose a category, select a set, configure your quiz, then start.</p></div>'+
  '<div class="tabs" role="tablist" aria-label="Question collections">'+
  ['past','mock'].map(t=>'<button class="tab" role="tab" aria-selected="'+(S.tab===t)+'" data-act="tab" data-tab="'+t+'">'+LABEL[t]+' '+(t==="past"?"▤":"✦")+'</button>').join("")+'</div>'+
  (S.loadError?'<div class="notice warn">'+x(S.loadError)+'</div>':"")+
  '<div class="cards">'+cards+'</div><div class="notice">'+(S.tab==="past"?"Original question wording, option order and numbering are preserved. Defective or ambiguous keys are flagged and excluded from automatic scoring.":"Mock questions are curated by DOMiNANCE. Each comprehensive mock consists of 60 questions with a 90-minute exam timer. Only complete verified sets appear as available.")+'</div></main>';
}
function setup(){
 const z=selected();if(!z)return home();
 const mixed=S.selected.cat==="past"&&z.questions.some(q=>q.type==="true-false");
 const n=z.questions.length;
 return '<main class="shell" id="main"><div class="bread"><button class="btn outline small" data-act="home">← All sets</button><span>/ '+LABEL[S.selected.cat]+' / '+x(z.title)+'</span></div>'+
 '<section class="paper setup"><p class="eyebrow">Quiz setup</p><h1>'+x(z.title)+'</h1><p class="sub">'+SOURCE[S.selected.cat]+' · '+plural(n,"question")+'</p>'+
 '<div class="settings"><div class="field"><label for="mode">Quiz mode</label><select id="mode"><option value="exam">Exam — answers after submission</option><option value="practice">Practice — check as you go</option></select></div>'+
 '<div class="field"><label for="section">Question type</label><select id="section"><option value="all">Full paper</option>'+(mixed?'<option value="true-false">True / False only</option><option value="single-best">MCQs only</option>':"")+'</select></div>'+
 '<div class="field"><label for="count">Questions</label><select id="count"><option value="all">All available questions</option>'+
 [10,20,40,60].filter(c=>c<n).map(c=>'<option value="'+c+'">'+c+' questions</option>').join("")+'</select></div>'+
 '<div class="field"><label for="timer">Timer</label><select id="timer"><option value="0">Untimed</option><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="60">60 minutes</option><option value="90"'+(S.selected.cat==="mock"?' selected':"")+'>90 minutes</option></select></div></div>'+
 '<label class="setting"><input type="checkbox" id="shuffle"> Randomize question order (original numbering stays visible)</label>'+
 '<div class="notice">Practice mode allows answer checks during the quiz. Exam mode keeps the answer key hidden until final submission. Your current attempt is saved in this browser.</div>'+
 '<div class="actions"><button class="btn" data-act="start">Start quiz →</button><button class="btn outline" data-act="home">Cancel</button></div></section></main>';
}
function reply(q){return S.attempt.answers[q.id]}
function done(q){const r=reply(q);return q.type==="true-false"?r&&Object.keys(r).length===q.options.length:Number.isInteger(r)}
function started(q){const r=reply(q);return q.type==="true-false"?!!(r&&Object.keys(r).length):Number.isInteger(r)}
function numDone(){return S.attempt.questions.filter(started).length}
function seconds(v){const n=Math.max(0,Math.ceil(v/1000));return String(Math.floor(n/60)).padStart(2,"0")+":"+String(n%60).padStart(2,"0")}
function ansText(q){
 if(q.type==="true-false"){return q.options.map(o=>o.label+": "+(q.answerByOption[o.label]==="T"?"True":q.answerByOption[o.label]==="F"?"False":"Disputed")).join(" · ")}
 const i=q.options.find(o=>o.label===q.correctAnswer);
 return i?i.label+". "+i.text:"No unique correct answer established";
}
function mine(q){
 const r=reply(q);
 if(q.type==="true-false")return q.options.map(o=>o.label+": "+(r&&r[o.label]?r[o.label]==="T"?"True":"False":"Unanswered")).join(" · ");
 if(!Number.isInteger(r))return "Unanswered";
 const o=q.options[r];return o?o.label+". "+o.text:"Unanswered";
}
function evalItem(q){
 const r=reply(q);if(q.type==="true-false"){
  let e=0,c=0,w=0,sk=0;
  q.options.forEach(o=>{const key=q.answerByOption[o.label];if(key!=="T"&&key!=="F"){sk++;return}e++;if(r&&r[o.label]===key)c++;else w++});
  return {eligible:e,correct:c,wrong:w,unscored:sk,status:w===0?"correct":c===0?"incorrect":"partial"};
 }
 if(!q.scoreable||!q.correctAnswer)return {eligible:0,correct:0,wrong:0,unscored:1,status:"review"};
 const valid=Number.isInteger(r)&&q.options[r]&&q.options[r].label===q.correctAnswer;
 return {eligible:1,correct:valid?1:0,wrong:valid?0:1,unscored:0,status:valid?"correct":"incorrect"};
}
function totals(){const t={eligible:0,correct:0,wrong:0,unscored:0,answered:0,statuses:{}};S.attempt.questions.forEach(q=>{const a=evalItem(q);for(const k of ["eligible","correct","wrong","unscored"])t[k]+=a[k];if(started(q))t.answered++;t.statuses[q.id]=a.status});t.percent=t.eligible?Math.round(100*t.correct/t.eligible):0;return t}
function feedback(q,full){
 const g=evalItem(q),label=g.status==="correct"?"Correct":g.status==="partial"?"Partially correct":g.status==="incorrect"?"Incorrect":"Review required";
 return '<div class="'+(full?"reviewitem":"feedback")+'">'+
  '<div class="mark">'+label+(q.flagged?" · Source note":"")+'</div>'+
  (full?'<h3>Original question '+q.number+(q.section?" · Section "+q.section:"")+'</h3><p>'+x(q.stem)+'</p>':"")+
  '<p><strong>Your answer:</strong> '+x(mine(q))+'</p><p><strong>Answer key:</strong> '+x(ansText(q))+'</p>'+
  (q.explanation?'<p><strong>Explanation:</strong> '+x(q.explanation)+'</p>':"")+
  (q.issueNotes||[]).map(note=>'<p><strong>Source-key note:</strong> '+x(note)+'</p>').join("")+
  (g.unscored?'<p>Unscorable parts are excluded from the percentage.</p>':"")+'</div>';
}
function quiz(){
 const a=S.attempt,q=a.questions[a.index],lock=a.mode==="practice"&&a.checked[q.id];
 const progress=Math.round(numDone()/a.questions.length*100);
 let opts="";
 if(q.type==="true-false"){opts='<div class="tfgroup">'+q.options.map(o=>'<div class="tfrow"><p><strong>'+o.label+'.</strong> '+x(o.text)+'</p><div class="opts">'+["T","F"].map(v=>'<label><input type="radio" data-tf="'+o.label+'" name="tf-'+o.label+'" value="'+v+'"'+((reply(q)||{})[o.label]===v?' checked':"")+(lock?" disabled":"")+'> '+(v==="T"?"True":"False")+'</label>').join("")+'</div></div>').join("")+'</div>'}
 else{opts='<div class="options">'+q.options.map((o,i)=>'<label class="choice"><input type="radio" name="choice" value="'+i+'"'+(reply(q)===i?" checked":"")+(lock?" disabled":"")+'> <span class="letter">'+o.label+'</span><span>'+x(o.text)+'</span></label>').join("")+'</div>'}
 const nav=a.questions.map((t,i)=>'<button class="num'+(i===a.index?" active":"")+(started(t)?" answered":"")+(a.flags[t.id]?" flagged":"")+'" data-act="jump" data-index="'+i+'" title="Question '+t.number+(a.flags[t.id]?" · Flagged":"")+'">'+(i+1)+'</button>').join("");
 return '<main class="shell" id="main"><div class="quizhead"><div><h1>'+x(a.title)+'</h1><p>'+LABEL[a.selected.cat]+' · '+(a.mode==="practice"?"Practice":"Exam")+' mode · '+x(SOURCE[a.selected.cat])+'</p></div><div><span class="chip">'+numDone()+' / '+a.questions.length+' answered</span></div></div>'+
 '<div class="progress"><span style="width:'+progress+'%"></span></div>'+
 '<div class="quizgrid"><section class="paper question"><div class="qtop"><span class="qnumber">Question '+(a.index+1)+' of '+a.questions.length+' · Original Q'+q.number+(q.section?" · Section "+q.section:"")+'</span><button class="btn outline small" data-act="flag">'+(a.flags[q.id]?"★ Flagged":"☆ Flag for review")+'</button></div>'+
 '<p class="qstem">'+x(q.stem)+'</p>'+opts+
 (q.flagged?'<div class="notice warn">This original item has an answer-key qualification. Its disputed parts will not be counted against your score.</div>':"")+
 (lock?feedback(q,false):"")+
 '<div class="qfoot"><div class="grp"><button class="btn outline" data-act="prev"'+(a.index===0?" disabled":"")+'>← Previous</button><button class="btn outline" data-act="next"'+(a.index===a.questions.length-1?" disabled":"")+'>Next →</button></div>'+
 (a.mode==="practice"?'<button class="btn" data-act="check"'+(!done(q)||lock?" disabled":"")+'>Check answer</button>':"")+'</div></section>'+
 '<aside class="paper side"><h3>Question navigator</h3><p>Select any question to jump to it.</p><div class="navgrid">'+nav+'</div><div class="sidebuttons">'+
 (a.deadline?'<div><span class="sub">Time remaining</span><div class="time" id="time">'+seconds(a.deadline-Date.now())+'</div></div>':"")+
 '<button class="btn" data-act="submit">Submit quiz</button><button class="btn outline" data-act="exit">Save and exit</button></div></aside></div></main>';
}
function results(){
 const a=S.attempt,g=totals();
 const qs=a.questions.filter(q=>S.filter==="all"||(S.filter==="flagged"?q.flagged:S.filter==="missed"?["incorrect","partial"].includes(g.statuses[q.id]):g.statuses[q.id]==="correct"));
 return '<main class="shell" id="main"><div class="bread"><button class="btn outline small" data-act="home">← All sets</button> / Results</div>'+
 '<section class="paper result"><p class="eyebrow">Quiz complete</p><h1>'+x(a.title)+' — Results</h1><p class="sub">Your score excludes defective or ambiguous source answers.</p>'+
 '<div class="metrics"><div class="metric"><span class="v" style="color:var(--gold)">'+g.percent+'%</span><small>Scorable marks</small></div><div class="metric"><span class="v">'+g.correct+' / '+g.eligible+'</span><small>Correct marks</small></div><div class="metric"><span class="v">'+g.answered+' / '+a.questions.length+'</span><small>Question stems attempted</small></div><div class="metric"><span class="v">'+g.unscored+'</span><small>Excluded marks</small></div></div>'+
 '<div class="actions"><button class="btn" data-act="retry">Try again</button><button class="btn outline" data-act="home">Back to collections</button></div></section>'+
 '<div class="section-title"><h2>Detailed answer review</h2><p>Check your choices, correct answers and source-quality notes.</p></div>'+
 '<div class="filter">'+[["all","All questions"],["missed","Missed"],["correct","Correct"],["flagged","Source notes"]].map(([k,v])=>'<button data-act="filter" data-filter="'+k+'" class="'+(S.filter===k?"active":"")+'">'+v+'</button>').join("")+'</div>'+
 (qs.length?'<div class="reviewlist">'+qs.map(q=>feedback(q,true)).join("")+'</div>':'<div class="empty">No questions in this filter.</div>')+'</main>';
}
function render(){document.documentElement.dataset.theme=S.theme;root.innerHTML=header()+(S.page==="home"?home():S.page==="setup"?setup():S.page==="quiz"&&S.attempt?quiz():S.page==="results"&&S.attempt?results():home())+footer();tick()}
function jump(){window.scrollTo({top:0,behavior:"instant"})}
function newAttempt(){
 const z=selected();if(!z)return;
 if(S.attempt&&!S.attempt.finished&&!confirm("Replace your saved quiz with this new attempt?"))return;
 let qs=[...z.questions],section=document.getElementById("section")?.value||"all";
 if(section!=="all")qs=qs.filter(q=>q.type===section);
 if(document.getElementById("shuffle")?.checked){for(let i=qs.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[qs[i],qs[j]]=[qs[j],qs[i]]}}
 const c=document.getElementById("count")?.value||"all";if(c!=="all")qs=qs.slice(0,Number(c));if(!qs.length)return;
 let minutes=Number(document.getElementById("timer")?.value||0),now=Date.now();
 S.attempt={version:2,selected:{...S.selected},title:z.title,questions:qs,mode:document.getElementById("mode")?.value||"exam",index:0,answers:{},flags:{},checked:{},startedAt:now,deadline:minutes?now+60000*minutes:null,finished:false};
 S.page="quiz";S.filter="all";put();render();jump();
}
function submit(forced){const a=S.attempt;if(!a||a.finished)return;if(!forced&&!confirm("Submit this quiz? Unanswered questions will count as incorrect, and your answers will be locked."))return;a.finished=true;a.completedAt=Date.now();S.page="results";S.filter="all";put();render();jump();}
function tick(){const a=S.attempt;if(S.page!=="quiz"||!a||a.finished||!a.deadline)return;const t=a.deadline-Date.now();if(t<=0){submit(true);return}const el=document.getElementById("time");if(el){el.textContent=seconds(t);el.classList.toggle("urgent",t<300000)}}
root.addEventListener("click",event=>{
 const b=event.target.closest("[data-act]");if(!b||b.disabled)return;const act=b.dataset.act,a=S.attempt;
 if(act==="home"){S.page="home";render();jump()}
 else if(act==="theme"){S.theme=S.theme==="dark"?"light":"dark";try{localStorage.setItem(TS,S.theme)}catch(e){}render()}
 else if(act==="tab"){S.tab=b.dataset.tab;render()}
 else if(act==="pick"){S.selected={cat:b.dataset.cat,id:b.dataset.id};S.page="setup";render();jump()}
 else if(act==="start")newAttempt();
 else if(act==="resume"&&a){S.page=a.finished?"results":"quiz";render();jump()}
 else if(act==="prev"&&a){a.index=Math.max(0,a.index-1);put();render()}
 else if(act==="next"&&a){a.index=Math.min(a.questions.length-1,a.index+1);put();render()}
 else if(act==="jump"&&a){a.index=Number(b.dataset.index);put();render()}
 else if(act==="flag"&&a){const q=a.questions[a.index];a.flags[q.id]=!a.flags[q.id];put();render()}
 else if(act==="check"&&a){const q=a.questions[a.index];if(done(q)){a.checked[q.id]=true;put();render()}}
 else if(act==="submit"&&a)submit(false);
 else if(act==="exit"&&a){put();S.page="home";render();jump()}
 else if(act==="filter"){S.filter=b.dataset.filter;render()}
 else if(act==="retry"&&a){const s={...a.selected};S.attempt=null;put();S.selected=s;S.page="setup";render();jump()}
});
root.addEventListener("change",event=>{
 const el=event.target,a=S.attempt;if(!a||S.page!=="quiz"||a.finished)return;
 const q=a.questions[a.index];if(a.mode==="practice"&&a.checked[q.id])return;
 if(el.name==="choice"){a.answers[q.id]=Number(el.value)}
 else if(el.dataset.tf){if(!a.answers[q.id])a.answers[q.id]={};a.answers[q.id][el.dataset.tf]=el.value}
 else return;put();render();
});
function mockSets(j){const arr=[];for(let i=1;i<=3;i++){const qs=j&&j.mocks?j.mocks[String(i)]||[]:[];arr.push({id:"mock-"+String(i).padStart(2,"0"),title:"Mock "+String(i).padStart(2,"0"),subtitle:qs.length?qs.length+" questions · 90 minutes":"Awaiting verified mock source",ready:qs.length===60,questions:qs.map((q,k)=>({id:"M"+String(i).padStart(2,"0")+"-Q"+(k+1),number:k+1,section:"",type:"single-best",stem:q.stem,options:q.options.map((t,n)=>({label:abc[n],text:t})),correctAnswer:q.answer,scoreable:/^[A-D]$/.test(q.answer),explanation:q.explanation||"",flagged:false,issueNotes:[]}))})}return arr}
async function boot(){
 document.documentElement.dataset.theme=S.theme;
 try{const a=JSON.parse(localStorage.getItem(LS)||"null");if(a&&a.version===2&&a.questions&&a.questions.length){S.attempt=a;S.selected=a.selected;S.page=a.finished?"results":"quiz"}}catch(e){}
 S.sets.mock=mockSets(null);render();
 const rs=await Promise.allSettled([fetch("./data/past-questions.json").then(r=>{if(!r.ok)throw Error(r.status);return r.json()}),fetch("./data/mocks-01-to-03-60q.json").then(r=>{if(!r.ok)throw Error(r.status);return r.json()})]);
 if(rs[0].status==="fulfilled"&&Array.isArray(rs[0].value.sets)){S.sets.past=rs[0].value.sets.map(q=>({...q,ready:true}));}
 else S.loadError="Past questions could not be loaded. Please refresh or check your connection.";
 if(rs[1].status==="fulfilled"&&rs[1].value.mocks){const m=mockSets(rs[1].value);S.sets.mock=m;if(m.filter(z=>z.ready).length!==3)S.loadError="Some complete 60-question mock papers have not yet been imported."}
 else{S.sets.mock=mockSets(null);S.loadError="The 60-question mock collection could not be loaded. Please refresh or check your connection."}
 render();
}
setInterval(tick,1000);boot();
})();