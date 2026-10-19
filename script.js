let uploadedVideos=[];let currentFilter="All";let searchQuery="";let showMine=false;let viewedIds=[];let currentView="home";
const PROFILE_KEY="blutuub_profiles_v1";
let profiles=[];let activeProfileId="";
function makeProfile(name="BluTuub User",handle="blutuubuser",color="#1769e0"){return {id:"profile-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),name,handle:handle.replace(/^@/,"").replace(/[^a-zA-Z0-9_.]/g,"").slice(0,24)||"blutuubuser",color};}
function loadProfiles(){try{profiles=JSON.parse(localStorage.getItem(PROFILE_KEY)||"[]");}catch{profiles=[];}if(!Array.isArray(profiles))profiles=[];if(!profiles.length){profiles=[makeProfile("BluTuub User","blutuubuser")];}activeProfileId=localStorage.getItem(PROFILE_KEY+"_active")||profiles[0].id;if(!profiles.some(p=>p.id===activeProfileId))activeProfileId=profiles[0].id;saveProfiles();syncProfileUI();}
function saveProfiles(){localStorage.setItem(PROFILE_KEY,JSON.stringify(profiles));localStorage.setItem(PROFILE_KEY+"_active",activeProfileId);}
function activeProfile(){return profiles.find(p=>p.id===activeProfileId)||profiles[0]||makeProfile();}
function syncProfileUI(){const p=activeProfile();if(!p)return;const initial=(p.name.trim()[0]||"B").toUpperCase();["profileAvatar","menuAvatar","profilePreviewAvatar"].forEach(id=>{const el=$(id);if(el){el.textContent=initial;el.style.background=p.color;}});$("menuDisplayName").textContent=p.name;$("menuHandle").textContent="@"+p.handle;$("profilePreviewName").textContent=p.name;$("displayNameInput").value=p.name;$("handleInput").value=p.handle;$("avatarColorInput").value=p.color;document.querySelectorAll(".channel-avatar").forEach(el=>{el.textContent=initial;el.style.background=p.color;});}
function showProfileEditor(switching=false){$("profileForm").classList.toggle("hidden",switching);$("switchList").classList.toggle("hidden",!switching);$("profileTitle").textContent=switching?"Switch account":"Edit your profile";if(switching)renderSavedProfiles();openModal("profileModal");}
function renderSavedProfiles(){$("savedProfiles").innerHTML=profiles.map(p=>'<button class="saved-profile" type="button" data-profile-id="'+escapeHtml(p.id)+'"><span class="profile-avatar" style="background:'+escapeHtml(p.color)+'">'+escapeHtml((p.name.trim()[0]||"B").toUpperCase())+'</span><span><strong>'+escapeHtml(p.name)+'</strong><small>@'+escapeHtml(p.handle)+(p.id===activeProfileId?" · Current account":"")+'</small></span></button>').join("");}

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
  <div class="video-info"><div class="channel-avatar" style="background:${escapeHtml(activeProfile().color)}">${escapeHtml((activeProfile().name.trim()[0]||"B").toUpperCase())}</div><div class="video-text"><h3>${escapeHtml(v.title)}</h3><p>${escapeHtml(v.channel)}</p><div class="video-meta">${v.views} views · just now</div></div></div></article>`).join("");
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
function closeModal(id){$(id).classList.add("hidden");document.body.style.overflow=(["uploadModal","playerModal","profileModal","authModal"].every(mid=>$(mid).classList.contains("hidden")))?"":"hidden";}
function toast(message){$("toast").textContent=message;$("toast").classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>$("toast").classList.add("hidden"),3000);}
function showUpload(){$("moderationResult").className="moderation-result hidden";openModal("uploadModal");}
const MODERATION_ENDPOINT="https://us-central1-blutuub-1831a.cloudfunctions.net/moderateUpload";
function imageFileToJpeg(file){
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{try{const canvas=document.createElement("canvas"),scale=Math.min(1,320/img.naturalWidth,320/img.naturalHeight);canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));canvas.getContext("2d",{alpha:false}).drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL("image/jpeg",0.42));}catch(e){reject(e);}finally{URL.revokeObjectURL(url);}};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Could not read the thumbnail image."));};
  img.src=url;
 });
}
function sampleVideoFrames(file){
 return new Promise((resolve,reject)=>{
  const video=document.createElement("video"),url=URL.createObjectURL(file),frames=[];
  video.preload="metadata";video.muted=true;video.playsInline=true;
  const cleanup=()=>{video.removeAttribute("src");video.load();URL.revokeObjectURL(url);};
  video.onerror=()=>{cleanup();reject(new Error("Could not read this video to check its frames."));};
  video.onloadedmetadata=async()=>{
   try{
    if(!Number.isFinite(video.duration)||video.duration<=0)throw new Error("This video has no readable duration.");
    const canvas=document.createElement("canvas"),ctx=canvas.getContext("2d",{alpha:false});
    const scale=Math.min(1,320/video.videoWidth,320/video.videoHeight);
    canvas.width=Math.max(1,Math.round(video.videoWidth*scale));canvas.height=Math.max(1,Math.round(video.videoHeight*scale));
    const positions=[0.1,0.35,0.6,0.85].map(p=>Math.min(Math.max(0,video.duration-0.08),video.duration*p));
    for(const time of positions){
     await new Promise((res,rej)=>{const fail=()=>{video.removeEventListener("seeked",done);rej(new Error("Could not sample a frame from the video."));};const done=()=>{video.removeEventListener("error",fail);res();};video.addEventListener("seeked",done,{once:true});video.addEventListener("error",fail,{once:true});video.currentTime=time;});
     ctx.drawImage(video,0,0,canvas.width,canvas.height);frames.push(canvas.toDataURL("image/jpeg",0.38));
    }
    cleanup();resolve(frames);
   }catch(e){cleanup();reject(e);}
  };
  video.src=url;
 });
}
async function moderateText(title,description,thumbnailFile,videoFile){
 if(title.trim().length<3)return {ok:false,message:"Please enter a longer title."};
 if(title.length>100||description.length>1000)return {ok:false,message:"Title must be 100 characters or fewer and description 1,000 characters or fewer."};
 if(!firebaseAuth||!firebaseAuth.currentUser)return {ok:false,message:"Sign in to BluTuub first to use AI moderation."};
 try{
  const frames=await sampleVideoFrames(videoFile);
  const thumbnail=thumbnailFile?await imageFileToJpeg(thumbnailFile):frames[0];
  const token=await firebaseAuth.currentUser.getIdToken();
  const response=await fetch(MODERATION_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},body:JSON.stringify({title,description,thumbnail,frames})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)return {ok:false,message:data.error||"AI moderation is not set up yet. Your upload was not added."};
  return {ok:!!data.ok,message:data.message||"AI moderation returned no explanation.",flagged:!!data.flagged,categories:Array.isArray(data.categories)?data.categories:[]};
 }catch(error){
  console.error("AI moderation request failed:",error);
  return {ok:false,message:error.message||"Couldn't check this video. Your upload was not added."};
 }
}
function showModeration(ok,message){const el=$("moderationResult");el.className="moderation-result";el.textContent=(ok?"✓ ":"⚠ ")+message;}
function openPlayer(id){const v=uploadedVideos.find(x=>x.id===id);if(!v)return;viewedIds.push(id);$("playerContent").innerHTML=`<video class="player-video" controls autoplay src="${v.objectUrl}"></video><div class="player-details"><h2>${escapeHtml(v.title)}</h2><p>${escapeHtml(v.channel)} · ${v.views} views</p><p>${escapeHtml(v.desc||"")}</p></div>`;openModal("playerModal");}

let firebaseAuth=null, firebaseDb=null, onlineUser=null, authMode="login";
function firebaseConfigured(){const c=window.BluTuubConfig||{};return !!(c.apiKey&&c.authDomain&&c.projectId&&c.appId&&!Object.values(c).some(v=>typeof v==="string"&&v.includes("PASTE_")));}
function showAuthMessage(message,isError=false){const el=$("authMessage");el.textContent=message;el.classList.remove("hidden","error");if(isError)el.classList.add("error");}
function setAuthMode(mode){authMode=mode;const signup=mode==="signup";$("loginTab").classList.toggle("active",!signup);$("signupTab").classList.toggle("active",signup);$("authTitle").textContent=signup?"Create your BluTuub account":"Sign in to BluTuub";$("authSubmit").textContent=signup?"Create account":"Sign in";$("authPassword").autocomplete=signup?"new-password":"current-password";$("signupNameField").classList.toggle("hidden",!signup);$("authMessage").classList.add("hidden");}
function openAuth(){setAuthMode("login");openModal("authModal");if(!firebaseConfigured())showAuthMessage("Connect Firebase first using the setup steps in the GitHub README.",true);}
async function refreshOnlineProfile(user){onlineUser=user;if(!user){const p=activeProfile();if(p&&String(p.id).startsWith("online-"))activeProfileId=profiles.find(x=>!String(x.id).startsWith("online-"))?.id||profiles[0]?.id;saveProfiles();syncProfileUI();$("onlineAccountAction").textContent="Sign in / Create account";return;}let row=null;try{const snap=await firebaseDb.collection("profiles").doc(user.uid).get();if(snap.exists)row=snap.data();}catch(e){console.error(e);}const id="online-"+user.uid;let p=profiles.find(x=>x.id===id);if(!p){p={id,name:row?.displayName||user.displayName||(user.email||"user").split("@")[0],handle:row?.username||(user.email||"user").split("@")[0],color:row?.avatarColor||"#1769e0"};profiles.unshift(p);}else if(row){p.name=row.displayName||p.name;p.handle=row.username||p.handle;p.color=row.avatarColor||p.color;}activeProfileId=id;saveProfiles();syncProfileUI();$("onlineAccountAction").textContent="Online account: "+p.name;if(!row){try{await firebaseDb.collection("profiles").doc(user.uid).set({displayName:p.name,username:p.handle,avatarColor:p.color,createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});}catch(e){console.error(e);}}}
function initFirebaseAuth(){if(!firebaseConfigured()){$("onlineAccountAction").textContent="Connect online account";return;}try{if(!firebase.apps.length)firebase.initializeApp(window.BluTuubConfig);firebaseAuth=firebase.auth();firebaseDb=firebase.firestore();firebaseAuth.onAuthStateChanged(refreshOnlineProfile);}catch(e){console.error(e);}}
async function handleAuthSubmit(event){event.preventDefault();if(!firebaseConfigured()||!firebaseAuth){showAuthMessage("Firebase is not connected. Fill in firebase-config.js first.",true);return;}const email=$("authEmail").value.trim(),password=$("authPassword").value,button=$("authSubmit");button.disabled=true;button.textContent=authMode==="signup"?"Creating…":"Signing in…";try{if(authMode==="signup"){const cred=await firebaseAuth.createUserWithEmailAndPassword(email,password);const name=$("authName").value.trim()||email.split("@")[0];await cred.user.updateProfile({displayName:name});const username=email.split("@")[0].toLowerCase().replace(/[^a-z0-9_.]/g,"").slice(0,20)||"user";await firebaseDb.collection("profiles").doc(cred.user.uid).set({displayName:name,username,avatarColor:"#1769e0",createdAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});showAuthMessage("Account created! You are signed in.");}else{await firebaseAuth.signInWithEmailAndPassword(email,password);showAuthMessage("You are signed in!");}setTimeout(()=>closeModal("authModal"),650);}catch(e){showAuthMessage(e.message||"Authentication failed.",true);}finally{button.disabled=false;button.textContent=authMode==="signup"?"Create account":"Sign in";}}

loadProfiles();
initFirebaseAuth();
$("editProfile").addEventListener("click",()=>{$("profileMenu").classList.add("hidden");if(onlineUser&&firebaseAuth){const p=activeProfile();$("displayNameInput").value=p.name;$("handleInput").value=p.handle;$("avatarColorInput").value=p.color;showProfileEditor(false);}else{showProfileEditor(false);}});
$("switchProfile").addEventListener("click",()=>{$("profileMenu").classList.add("hidden");if(firebaseAuth){openAuth();}else{showProfileEditor(true);}});
$("onlineAccountAction").addEventListener("click",()=>{$("profileMenu").classList.add("hidden");openAuth();});
$("loginTab").addEventListener("click",()=>setAuthMode("login"));
$("signupTab").addEventListener("click",()=>setAuthMode("signup"));
$("authForm").addEventListener("submit",handleAuthSubmit);
const signOutButton=$("signOutProfile");if(signOutButton)signOutButton.addEventListener("click",async()=>{if(onlineUser&&firebaseAuth){try{await firebaseAuth.signOut();onlineUser=null;$("profileMenu").classList.add("hidden");toast("Signed out.");}catch(e){toast(e.message);}}else{showProfileEditor(false);$("profileMenu").classList.add("hidden");}});
$("profileForm").addEventListener("submit",async e=>{e.preventDefault();const name=$("displayNameInput").value.trim(),handle=$("handleInput").value.trim().replace(/^@/,"").replace(/[^a-zA-Z0-9_.]/g,"").slice(0,24);if(!name||!handle){toast("Enter a display name and username.");return;}const p=activeProfile();p.name=name;p.handle=handle;p.color=$("avatarColorInput").value;if(onlineUser&&firebaseDb){try{await firebaseDb.collection("profiles").doc(onlineUser.uid).set({displayName:name,username:handle,avatarColor:p.color},{merge:true});await onlineUser.updateProfile({displayName:name});}catch(e){toast(e.message);return;}}saveProfiles();syncProfileUI();renderVideos();closeModal("profileModal");toast("Profile updated!");});
$("savedProfiles").addEventListener("click",e=>{const b=e.target.closest("[data-profile-id]");if(!b)return;activeProfileId=b.dataset.profileId;saveProfiles();syncProfileUI();renderVideos();closeModal("profileModal");toast("Switched to "+activeProfile().name+".");});
$("addProfile").addEventListener("click",()=>{const p=makeProfile("New User","newuser");profiles.push(p);activeProfileId=p.id;saveProfiles();syncProfileUI();$("profileForm").classList.remove("hidden");$("switchList").classList.add("hidden");$("profileTitle").textContent="Create profile";$("displayNameInput").value=p.name;$("handleInput").value=p.handle;$("avatarColorInput").value=p.color;});
$("avatarColorInput").addEventListener("input",()=>{$("profilePreviewAvatar").style.background=$("avatarColorInput").value;});
$("displayNameInput").addEventListener("input",()=>{$("profilePreviewName").textContent=$("displayNameInput").value||"Your name";$("profilePreviewAvatar").textContent=(($("displayNameInput").value.trim()[0]||"B").toUpperCase());});
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
$("videoFile").addEventListener("change",()=>{$("fileLabel").textContent=$("videoFile").files[0]?.name||"Select a video";});
$("uploadForm").addEventListener("submit",async e=>{e.preventDefault();const file=$("videoFile").files[0],title=$("videoTitle").value.trim(),desc=$("videoDescription").value.trim(),category=$("videoCategory").value,submitButton=$("uploadForm").querySelector('button[type="submit"]');if(!file){toast("Choose a video first.");return;}if(!file.type.startsWith("video/")){showModeration(false,"Please choose a video file.");return;}submitButton.disabled=true;submitButton.textContent="Checking with AI…";showModeration(true,"Checking title, thumbnail, and sampled video frames with AI…");try{const result=await moderateText(title,desc,$("thumbnailFile").files[0]||null,file);if(!result.ok){showModeration(false,result.message+(result.categories?.length?" Categories: "+result.categories.join(", "):""));return;}const objectUrl=URL.createObjectURL(file);uploadedVideos.unshift({id:"upload-"+Date.now(),title,desc,category,channel:activeProfile().name,views:0,userUpload:true,objectUrl});showModeration(true,result.message+" Title, thumbnail, and 4 sampled frames passed. The video is still local to this browser session.");currentView="home";showMine=false;currentFilter="All";searchQuery="";$("searchInput").value="";renderVideos();}finally{submitButton.disabled=false;submitButton.textContent="Check and add video";}});
renderVideos();