/* The exact orbital canvas drawing restored from shefooo-site-preview.zip. */
(()=>{
const canvas=document.getElementById('universe'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let w,h,dpr;
function resize(){dpr=Math.min(devicePixelRatio||1,2);w=canvas.clientWidth;h=canvas.clientHeight;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw(0);}
function draw(time){ctx.clearRect(0,0,w,h);const cx=w*.78,cy=h*.71,unit=Math.min(w,h);const t=time*.00018;
  const glow=ctx.createRadialGradient(cx,cy,3,cx,cy,unit*.7);glow.addColorStop(0,'rgba(128,88,202,.19)');glow.addColorStop(1,'rgba(16,8,27,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
  for(let i=0;i<5;i++){const rx=unit*(.33+i*.19),ry=rx*.48;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,-.42,0,Math.PI*2);ctx.strokeStyle=i===1?'rgba(195,159,255,.43)':'rgba(160,137,203,.17)';ctx.lineWidth=i===1?1.3:1;ctx.setLineDash(i%2===0?[3,8]:[]);ctx.stroke();}
  ctx.setLineDash([]);const nodes=[[-.75,-.48],[.28,-.92],[.89,.25],[-.18,.99],[.91,-.74]];
  nodes.forEach(([nx,ny],i)=>{const r=unit*(.33+i*.19),angle=Math.atan2(ny,nx)+t*(i%2?-.8:.65),x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*.48;ctx.beginPath();ctx.arc(x,y,i===1?4:2.5,0,Math.PI*2);ctx.fillStyle='#cba9ff';ctx.fill();ctx.strokeStyle='rgba(193,153,255,.32)';ctx.strokeRect(x-10,y-10,20,20);});
  if(!reduced)requestAnimationFrame(draw);
}
addEventListener('resize',resize,{passive:true});resize();
})();
