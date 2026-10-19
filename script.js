const sampleVideos = [
 {id:"v1",title:"Minecraft but NOTHING goes according to plan",channel:"Blocky Legends",initial:"B",views:"124K",age:"2 days ago",duration:"12:48",category:"Gaming",emoji:"⛏️",headline:"MINECRAFT\nGONE WRONG",bg:"linear-gradient(135deg,#167c69,#71c98c)",avatar:"#21866c",desc:"The most chaotic Minecraft session ever. Every plan goes wrong in the funniest way."},
 {id:"v2",title:"I tried to cook without reading the recipe",channel:"Kitchen Disaster",initial:"K",views:"86K",age:"1 day ago",duration:"8:21",category:"Comedy",emoji:"🍳",headline:"CHEF MODE:\nFAILED",bg:"linear-gradient(135deg,#e58a43,#f6c96c)",avatar:"#df8b3e",desc:"One kitchen, zero instructions, and a questionable amount of confidence."},
 {id:"v3",title:"An hour of relaxing music for your brain",channel:"Bluewave Audio",initial:"A",views:"2.1M",age:"3 weeks ago",duration:"1:02:15",category:"Music",emoji:"🎧",headline:"TAKE A\nBREATHER",bg:"linear-gradient(135deg,#5368d8,#8bafff)",avatar:"#6578d9",desc:"A relaxing mix for studying, drawing, gaming, or doing absolutely nothing."},
 {id:"v4",title:"Can you learn the solar system in 6 minutes?",channel:"Tiny Big Facts",initial:"T",views:"51K",age:"5 days ago",duration:"6:04",category:"Education",emoji:"🪐",headline:"SPACE IS\nWILD",bg:"linear-gradient(135deg,#252456,#6965c9)",avatar:"#6559b8",desc:"A quick tour of our cosmic neighborhood and the strange worlds beyond Earth."},
 {id:"v5",title:"When the group chat actually meets up",channel:"Certified Chaos",initial:"C",views:"309K",age:"6 hours ago",duration:"0:42",category:"Comedy",emoji:"😂",headline:"THE GROUP\nCHAT IRL",bg:"linear-gradient(135deg,#d64b78,#f49bb0)",avatar:"#d6537e",desc:"We have been talking about this for three years. It finally happened."},
 {id:"v6",title:"Building a tiny city one block at a time",channel:"Pixel Workshop",initial:"P",views:"73K",age:"1 week ago",duration:"18:33",category:"Gaming",emoji:"🏙️",headline:"TINY CITY,\nBIG DREAMS",bg:"linear-gradient(135deg,#258db0,#65d1df)",avatar:"#258db0",desc:"A miniature city build with tiny roads, parks, shops, and an unreasonable number of windows."},
 {id:"v7",title:"The weirdest facts that are actually true",channel:"Tiny Big Facts",initial:"T",views:"204K",age:"4 days ago",duration:"9:12",category:"Education",emoji:"🤯",headline:"WAIT… WHAT?",bg:"linear-gradient(135deg,#d59a28,#f2d96b)",avatar:"#c39129",desc:"Six strange facts that sound made up but are real."},
 {id:"v8",title:"Pixel art animation made from scratch",channel:"Pixel Workshop",initial:"P",views:"39K",age:"2 days ago",duration:"5:57",category:"Animation",emoji:"🎨",headline:"PIXEL BY PIXEL",bg:"linear-gradient(135deg,#8d50bf,#d49bfa)",avatar:"#8c4cb9",desc:"Watch a little animated world come to life one pixel at a time."},
];
let uploadedVideos = [];
let currentFilter = "All";
let searchQuery = "";
let showMine = false;
let currentObjectUrl = null;
const $ = id => document.getElementById(id);
const allVideos = () => [...uploadedVideos,...sampleVideos];
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderVideos(){
 const query=searchQuery.trim().toLowerCase();
 let list=allVideos().filter(v=>{
  const matchesText=(v.title+" "+v.channel+" "+v.category+" "+(v.desc||"")).toLowerCase().includes(query);
  const matchesFilter=currentFilter==="All"||currentFilter==="Trending"||v.category===currentFilter;
  const matchesMine=!showMine||v.userUpload;
  return matchesText&&matchesFilter&&matchesMine;
 });
 if(currentFilter==="Trending") list=list.filter(v=>!v.userUpload).sort((a,b)=>parseViews(b.views)-parseViews(a.views));
 $("feedTitle").textContent=showMine?"Your videos":currentFilter==="All"?"Recommended for you":currentFilter==="Trending"?"Trending on BluTuub":currentFilter+" videos";
 $("feedSubtitle").textContent=showMine?"Videos submitted in this browser session.":"A little bit of everything.";
 $("videoCount").textContent=list.length+" VIDEO"+(list.length===1?"":"S");
 $("videoGrid").innerHTML=list.map(v=>`<article class="video-card" tabindex="0" role="button" aria-label="Watch ${escapeHtml(v.title)}" data-video-id="${escapeHtml(v.id)}">
  <div class="thumbnail" style="background:${v.bg||"linear-gradient(135deg,#168de2,#6fc6ff)"}"><span class="thumb-emoji">${escapeHtml(v.emoji||"▶")}</span><span class="thumb-title">${escapeHtml(v.headline||v.title)}</span><span class="thumb-play">▶</span><span class="thumb-duration">${escapeHtml(v.duration||"NEW")}</span></div>
  <div class="video-info"><div class="channel-avatar" style="background:${v.avatar||"#168de2"}">${escapeHtml(v.initial||"B")}</div><div class="video-text"><h3>${escapeHtml(v.title)}</h3><p>${escapeHtml(v.channel)} <span class="verified">●</span></p><div class="video-meta"><span>${escapeHtml(v.views||"0 views")} views</span><span>·</span><span>${escapeHtml(v.age||"just now")}</span></div>${v.userUpload?'<span class="new-tag">APPROVED · LOCAL DEMO</span>':""}</div></div></article>`).join("");
 $("emptyState").classList.toggle("hidden",list.length>0);
 $("videoGrid").classList.toggle("hidden",list.length===0);
}
function parseViews(s){const m=String(s).match(/[\d.]+/);if(!m)return 0;let n=Number(m[0]);if(/M/i.test(s))n*=1e6;else if(/K/i.test(s))n*=1e3;return n;}
function setFilter(filter){currentFilter=filter;showMine=false;document.querySelectorAll("[data-filter]").forEach(el=>el.classList.toggle("selected",el.dataset.filter===filter));document.querySelectorAll(".nav-item[data-filter]").forEach(el=>el.classList.toggle("active",el.dataset.filter===filter));renderVideos();}
function openModal(id){$(id).classList.remove("hidden");document.body.style.overflow="hidden";}
function closeModal(id){$(id).classList.add("hidden");document.body.style.overflow=($("uploadModal").classList.contains("hidden")&&$("playerModal").classList.contains("hidden"))?"":"hidden";}
function toast(message){$("toast").textContent=message;$("toast").classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("toast").classList.add("hidden"),3200);}
function openPlayer(id){
 const v=allVideos().find(x=>x.id===id);if(!v)return;
 let media="";
 if(v.objectUrl)media=`<video class="player-video" controls autoplay src="${v.objectUrl}"></video>`;
 else if(v.demoUrl)media=`<video class="player-video" controls autoplay src="${v.demoUrl}"></video>`;
 else media=`<div class="player-placeholder">▶</div>`;
 $("playerContent").innerHTML=media+`<div class="player-details"><h2>${escapeHtml(v.title)}</h2><p>${escapeHtml(v.channel)} · ${escapeHtml(v.views||"0 views")} views · ${escapeHtml(v.age||"just now")}</p><p>${escapeHtml(v.desc||"Welcome to BluTuub. This sample card is part of the website demo.")}</p>${v.userUpload?'<span class="new-tag">APPROVED IN LOCAL DEMO ONLY</span>':""}</div>`;
 openModal("playerModal");
}
document.querySelectorAll("[data-filter]").forEach(el=>el.addEventListener("click",()=>{setFilter(el.dataset.filter);}));
$("searchForm").addEventListener("submit",e=>{e.preventDefault();searchQuery=$("searchInput").value;showMine=false;renderVideos();});
$("searchInput").addEventListener("input",()=>{searchQuery=$("searchInput").value;showMine=false;renderVideos();});
$("clearSearch").addEventListener("click",()=>{$("searchInput").value="";searchQuery="";setFilter("All");});
$("myVideos").addEventListener("click",()=>{showMine=true;currentFilter="All";document.querySelectorAll(".nav-item").forEach(el=>el.classList.remove("active"));$("myVideos").classList.add("active");document.querySelectorAll(".chip").forEach(el=>el.classList.toggle("selected",el.dataset.filter==="All"));renderVideos();});
function showUpload(){ $("moderationResult").className="moderation-result hidden";openModal("uploadModal");}
["openUpload","openUploadSide","heroUpload"].forEach(id=>$(id).addEventListener("click",showUpload));
document.querySelectorAll("[data-close]").forEach(el=>el.addEventListener("click",()=>closeModal(el.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(el=>el.addEventListener("click",e=>{if(e.target===el)closeModal(el.id);}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){document.querySelectorAll(".modal-backdrop:not(.hidden)").forEach(m=>closeModal(m.id));}});
$("menuToggle").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("videoGrid").addEventListener("click",e=>{const card=e.target.closest("[data-video-id]");if(card)openPlayer(card.dataset.videoId);});
$("videoGrid").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-video-id]")){e.preventDefault();openPlayer(e.target.dataset.videoId);}});
$("videoFile").addEventListener("change",()=>{$("fileLabel").textContent=$("videoFile").files[0]?.name||"Choose a video file";});
function moderateText(title,description){
 const combined=(title+" "+description).toLowerCase();
 const checks=[
  {name:"credible threats",terms:["i will kill you","i'm going to kill you","bomb threat","shoot up the school"]},
  {name:"targeted harassment",terms:["dox this person","go harass","find their home address"]},
  {name:"spam",terms:["free money click here","guaranteed crypto profit","send me your password","buy followers instantly"]}
 ];
 for(const check of checks){if(check.terms.some(term=>combined.includes(term)))return {approved:false,reason:"Potential "+check.name+" detected in the title or description. This submission is held for review."};}
 if(title.trim().length<3)return {approved:false,reason:"Please use a more descriptive title before submitting."};
 return {approved:true,reason:"The basic text check found no matching demo rules. This is not a real AI safety review."};
}
$("uploadForm").addEventListener("submit",e=>{
 e.preventDefault();
 const file=$("videoFile").files[0],title=$("videoTitle").value.trim(),desc=$("videoDescription").value.trim(),category=$("videoCategory").value;
 if(!file){toast("Choose a video file first.");return;}
 if(!file.type.startsWith("video/")){showModeration(false,"That file does not appear to be a video. Please choose a video file.");return;}
 const result=moderateText(title,desc);
 if(!result.approved){showModeration(false,result.reason);return;}
 if(currentObjectUrl){URL.revokeObjectURL(currentObjectUrl);}
 currentObjectUrl=URL.createObjectURL(file);
 const video={id:"upload-"+Date.now(),title,desc,category,channel:"You",initial:"Y",views:"0",age:"just now",duration:"LOCAL",emoji:"▶",headline:title,bg:"linear-gradient(135deg,#168de2,#72c9ff)",avatar:"#168de2",userUpload:true,objectUrl:currentObjectUrl};
 uploadedVideos.unshift(video);
 showModeration(true,"Passed the basic demo text check. Added to this browser session only; it has not been uploaded to a server or reviewed by a real AI.");
 renderVideos();
 $("moderationResult").scrollIntoView({block:"nearest",behavior:"smooth"});
});
function showModeration(approved,message){const el=$("moderationResult");el.className="moderation-result "+(approved?"ok":"warn");el.textContent=(approved?"✓ DEMO CHECK PASSED — ":"⚠ HELD — ")+message;}
$("videoGrid").addEventListener("click",e=>{const card=e.target.closest("[data-video-id]");if(card){const v=allVideos().find(x=>x.id===card.dataset.videoId);if(v?.objectUrl)openPlayer(v.id);}});
renderVideos();
