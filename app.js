const DECKS = {
  "Chapter 13 — Endocrine": [
    {q:"What is homeostasis?",a:"Maintenance of a relatively stable internal environment."},
    {q:"Where is the pituitary gland located?",a:"At the base of the brain, below the hypothalamus."},
    {q:"Which hormone lowers blood glucose?",a:"Insulin."},
    {q:"Which hormone raises blood glucose?",a:"Glucagon."},
    {q:"What is insulin’s main target?",a:"Most body cells, especially liver, muscle and adipose tissue."},
    {q:"What triggers insulin release?",a:"A rise in blood glucose."},
    {q:"What triggers glucagon release?",a:"A fall in blood glucose."},
    {q:"Negative feedback does what?",a:"Reverses a change to return conditions toward a set point."},
    {q:"Give one positive feedback example.",a:"Oxytocin intensifying uterine contractions during labour."},
    {q:"How is body temperature controlled?",a:"Negative feedback via the hypothalamus and effectors."}
  ]
};
const $ = id => document.getElementById(id);
const els = {
  deck:$("deckSelect"), mode:$("modeSelect"), card:$("card"), label:$("cardLabel"), text:$("cardText"),
  counter:$("counter"), known:$("knownCount"), missed:$("missedCount"), progress:$("progressBar"),
  next:$("nextBtn"), prev:$("prevBtn"), knownBtn:$("knownBtn"), missedBtn:$("missedBtn"),
  shuffle:$("shuffleBtn"), reset:$("resetBtn")
};
let deckName = Object.keys(DECKS)[0];
let baseCards = DECKS[deckName].map((c,i)=>({...c,id:`${deckName}-${i}`}));
let cards = [...baseCards], index = 0, flipped = false;
let ratings = JSON.parse(localStorage.getItem("nnz-flashcard-ratings") || "{}");

function save(){localStorage.setItem("nnz-flashcard-ratings",JSON.stringify(ratings))}
function fillDecks(){
  els.deck.innerHTML = Object.keys(DECKS).map(n=>`<option>${n}</option>`).join("");
}
function current(){return cards[index]}
function filtered(){
  const all=baseCards;
  if(els.mode.value==="missed") return all.filter(c=>ratings[c.id]==="missed");
  return all;
}
function rebuild(){
  cards=filtered(); index=0; flipped=false; render();
}
function render(){
  if(!cards.length){
    els.label.textContent="ALL CLEAR";
    els.text.textContent=els.mode.value==="missed"?"No missed cards. Great work!":"No cards in this deck.";
    els.counter.textContent="0 / 0"; els.progress.style.width="0%";
    els.next.disabled=els.prev.disabled=els.knownBtn.disabled=els.missedBtn.disabled=true;
    updateStats(); return;
  }
  els.next.disabled=els.prev.disabled=els.knownBtn.disabled=els.missedBtn.disabled=false;
  const c=current();
  els.label.textContent=flipped?"ANSWER":"QUESTION";
  els.text.textContent=flipped?c.a:c.q;
  els.counter.textContent=`${index+1} / ${cards.length}`;
  els.progress.style.width=`${((index+1)/cards.length)*100}%`;
  updateStats();
}
function updateStats(){
  const known=baseCards.filter(c=>ratings[c.id]==="known").length;
  const missed=baseCards.filter(c=>ratings[c.id]==="missed").length;
  els.known.textContent=`${known} known`; els.missed.textContent=`${missed} missed`;
}
function flip(){if(cards.length){flipped=!flipped;render()}}
function move(step){
  if(!cards.length)return;
  index=(index+step+cards.length)%cards.length; flipped=false; render();
}
function rate(value){
  if(!cards.length)return;
  ratings[current().id]=value; save();
  if(els.mode.value==="missed" && value==="known") rebuild(); else move(1);
}
els.card.onclick=flip;
els.next.onclick=()=>move(1); els.prev.onclick=()=>move(-1);
els.knownBtn.onclick=()=>rate("known"); els.missedBtn.onclick=()=>rate("missed");
els.mode.onchange=rebuild;
els.deck.onchange=()=>{
  deckName=els.deck.value;
  baseCards=DECKS[deckName].map((c,i)=>({...c,id:`${deckName}-${i}`}));
  rebuild();
};
els.shuffle.onclick=()=>{
  cards=[...filtered()].sort(()=>Math.random()-.5); index=0; flipped=false; render();
};
els.reset.onclick=()=>{
  if(confirm("Reset all saved progress on this device?")){ratings={};save();rebuild()}
};
document.addEventListener("keydown",e=>{
  if([" ","Enter","ArrowRight","ArrowLeft","1","2"].includes(e.key)) e.preventDefault();
  if(e.key===" "||e.key==="Enter") flip();
  if(e.key==="ArrowRight") move(1);
  if(e.key==="ArrowLeft") move(-1);
  if(e.key==="1") rate("missed");
  if(e.key==="2") rate("known");
});
fillDecks(); render();