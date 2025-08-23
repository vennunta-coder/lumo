const FEED=[
 {id:'1',url:'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',caption:'Hello world',user:{username:'demo'}},
 {id:'2',url:'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',caption:'Segundo clip',user:{username:'demo'}}
];
const feedEl=document.getElementById('feed'); const tpl=document.getElementById('video-card');
function renderCard(item){
  const node=tpl.content.cloneNode(true);
  const video=node.querySelector('.card-video'); const caption=node.querySelector('.caption'); const user=node.querySelector('.user');
  const likeBtn=node.querySelector('.like'); const commentBtn=node.querySelector('.comment'); const shareBtn=node.querySelector('.share');
  video.src=item.url; video.autoplay=true; video.muted=true; caption.textContent=item.caption||''; user.textContent='@'+(item.user?.username||'user');
  likeBtn.addEventListener('click',()=>{ likeBtn.classList.toggle('liked'); likeBtn.textContent=likeBtn.classList.contains('liked')?'❤️':'🤍'; });
  commentBtn.addEventListener('click',()=>alert('Comentários (preview)')); 
  shareBtn.addEventListener('click',async()=>{ try{ if(navigator.share){ await navigator.share({title:'Minimal Social',text:item.caption,url:item.url}); } else { await navigator.clipboard.writeText(item.url); alert('Link copiado!'); } }catch{} });
  feedEl.appendChild(node);
}
FEED.forEach(renderCard);
const io=new IntersectionObserver(entries=>{ entries.forEach(entry=>{ const v=entry.target.querySelector('video'); if(!v) return; if(entry.isIntersecting){ v.play().catch(()=>{});} else { v.pause(); } }); },{threshold:0.6});
new MutationObserver(()=>{ document.querySelectorAll('.card').forEach(card=>io.observe(card)); }).observe(feedEl,{childList:true});
