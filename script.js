let uploadedVideos=[];let currentFilter="All";let searchQuery="";let showMine=false;let viewedIds=[];let currentView="home";
const $=id=>document.getElementById(id);
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderVideos(){
 const query=searchQuery.trim().toLowerCase();
 const list=uploadedVideos.filter(v=>{
  const text=(v.title+" "+v.channel+" "+v.category+" "+(v.desc||"")).toLowerCase();
  return text.includes(query)&&(currentFilter==="All"||v.category===currentFilter)&&(!showMine||v.userUpload);
 });
 $("videoGrid").innerHTML=list.map(v=>`<article class="video-card" tabindex="0" role="button" data-video-id="${escapeHtml(v.id)}" aria-label="Play ${escapeHtml(v.title)}">
  <div class="thumbnail"><video src="${v.objectUrl}" preload="metadata"></video></div>
  <div class="video-info"><div class="channel-avatar">B</div><div class="video-text"><h3>${escapeHtml(v.title)}</h3><p>${escapeHtml(v.channel)}</p><div class="video-meta">${v.views} views · just now</div></div></div></article>`).join("");
 const empty=list.length===0;
 $("emptyState").classList.toggle("hidden",!empty);$("videoGrid").classList.toggle("hidden",empty);
 if(currentView==="history"){$("emptyTitle").textContent="Your watch history is empty";$("emptyText").textContent="Videos you watch on BluTuub will appear here.";$("emptyUpload").classList.add("hidden");}
 else if(currentView==="shorts"||currentView==="subscriptions"){$("emptyTitle").textContent=currentView==="shorts"?"No Shorts yet":"No subscriptions yet";$("emptyText").textContent="This section is empty until BluTuub has content.";$("emptyUpload").classList.add("hidden");}
 else if(showMine){$("emptyTitle").textContent="You haven't uploaded any videos";$("emptyText").textContent="Videos you add in this browser will show up here.";$("emptyUpload").classList.remove("hidden");}
 else if(searchQuery){$("emptyTitle").textContent="No videos found";$("emptyText").textContent="Try a different search. There are no sample videos on BluTuub.";$("emptyUpload").classList.add("hidden");}
 else if(currentFilter!=="All"){$("emptyTitle").textContent="No "+currentFilter.toLowerCase()+" videos yet";$("emptyText").textContent="Videos in this category will appear here when you upload them.";$("emptyUpload").classList.remove("hidden");}
 else{$("emptyTitle").textContent="Nothing to watch… yet";$("emptyText").textContent="BluTuub is waiting for its first video. Upload one to get started.";$("emptyUpload").classList.remove("hidden");}
}
function setFilter(filter){currentFilter=filter;currentView="home";showMine=false;document.querySelectorAll(".chip").forEach(el=>el.classList.toggle("selected",el.dataset.filter===filter));document.querySelectorAll(".nav-item[data-filter]").forEach(el=>el.classList.toggle("active",el.dataset.filter===filter));document.querySelectorAll(".nav-item[data-view]").forEach(el=>el.classList.toggle("active",el.dataset.view==="home"&&filter==="All"));renderVideos();}
function openModal(id){$(id).classList.remove("hidden");document.body.style.overflow="hidden";}
function closeModal(id){$(id).classList.add("hidden");document.body.style.overflow=($("uploadModal").classList.contains("hidden")&&$("playerModal").classList.contains("hidden"))?"":"hidden";}
function toast(message){$("toast").textContent=message;$("toast").classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("toast").classList.add("hidden"),3000);}
function showUpload(){$("moderationResult").className="moderation-result hidden";openModal("uploadModal");}
function moderateText(title,description){const combined=(title+" "+description).toLowerCase();const terms=["i will kill you","i'm going to kill you","bomb threat","shoot up the school","dox this person","go harass","find their home address","free money click here","guaranteed crypto profit","send me your password","buy followers instantly"];if(terms.some(term=>combined.includes(term)))return {ok:false,message:"Held for review by the basic demo text filter."};if(title.trim().length<3)return {ok:false,message:"Please enter a longer title."};return {ok:true,message:"The basic demo text check passed. This is not real AI moderation."};}
function showModeration(ok,message){const el=$("moderationResult");el.className="moderation-result";el.textContent=(ok?"✓ ":"⚠ ")+message;}
function openPlayer(id){const v=uploadedVideos.find(x=>x.id===id);if(!v)return;viewedIds.push(id);$("playerContent").innerHTML=`<video class="player-video" controls autoplay src="${v.objectUrl}"></video><div class="player-details"><h2>${escapeHtml(v.title)}</h2><p>${escapeHtml(v.channel)} · ${v.views} views</p><p>${escapeHtml(v.desc||"")}</p></div>`;openModal("playerModal");}
document.querySelectorAll(".chip").forEach(el=>el.addEventListener("click",()=>setFilter(el.dataset.filter)));
document.querySelectorAll(".nav-item[data-filter]").forEach(el=>el.addEventListener("click",()=>setFilter(el.dataset.filter)));
document.querySelectorAll("[data-view]").forEach(el=>el.addEventListener("click",()=>{currentView=el.dataset.view;showMine=false;currentFilter="All";searchQuery="";$("searchInput").value="";document.querySelectorAll(".nav-item").forEach(n=>n.classList.toggle("active",n===el));document.querySelectorAll(".chip").forEach(n=>n.classList.toggle("selected",n.dataset.filter==="All"));renderVideos();if(currentView==="home")renderVideos();}));
$("searchForm").addEventListener("submit",e=>{e.preventDefault();searchQuery=$("searchInput").value;showMine=false;currentView="home";renderVideos();});
$("searchInput").addEventListener("input",()=>{searchQuery=$("searchInput").value;showMine=false;currentView="home";renderVideos();});
function showMineVideos(){showMine=true;currentView="home";currentFilter="All";searchQuery="";$("searchInput").value="";document.querySelectorAll(".nav-item").forEach(el=>el.classList.remove("active"));$("myVideos").classList.add("active");document.querySelectorAll(".chip").forEach(el=>el.classList.toggle("selected",el.dataset.filter==="All"));renderVideos();}
$("myVideos").addEventListener("click",showMineVideos);$("yourUploads").addEventListener("click",showMineVideos);
$("historyButton").addEventListener("click",()=>{currentView="history";showMine=false;renderVideos();});
["openUpload","openUploadSide","emptyUpload"].forEach(id=>$(id).addEventListener("click",showUpload));
document.querySelectorAll("[data-close]").forEach(el=>el.addEventListener("click",()=>closeModal(el.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(el=>el.addEventListener("click",e=>{if(e.target===el)closeModal(el.id);}));
document.addEventListener("keydown",e=>{if(e.key==="Escape")document.querySelectorAll(".modal-backdrop:not(.hidden)").forEach(m=>closeModal(m.id));if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-video-id]")){e.preventDefault();openPlayer(e.target.dataset.videoId);}});
$("menuToggle").addEventListener("click",()=>$("sidebar").classList.toggle("open"));
$("videoGrid").addEventListener("click",e=>{const card=e.target.closest("[data-video-id]");if(card)openPlayer(card.dataset.videoId);});
$("videoFile").addEventListener("change",()=>{$("fileLabel").textContent=$("videoFile").files[0]?.name||"Select video files";});
$("uploadForm").addEventListener("submit",e=>{e.preventDefault();const file=$("videoFile").files[0],title=$("videoTitle").value.trim(),desc=$("videoDescription").value.trim(),category=$("videoCategory").value;if(!file){toast("Choose a video first.");return;}if(!file.type.startsWith("video/")){showModeration(false,"Please choose a video file.");return;}const result=moderateText(title,desc);if(!result.ok){showModeration(false,result.message);return;}const objectUrl=URL.createObjectURL(file);uploadedVideos.unshift({id:"upload-"+Date.now(),title,desc,category,channel:"You",views:0,userUpload:true,objectUrl});showModeration(true,"Passed the basic demo text check. Added to this browser session only; it is not uploaded to a server or reviewed by real AI.");currentView="home";showMine=false;currentFilter="All";searchQuery="";$("searchInput").value="";renderVideos();});
renderVideos();