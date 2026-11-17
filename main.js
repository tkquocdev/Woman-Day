// ===================== CẤU HÌNH MẶC ĐỊNH =====================
// Thông tin thật đặt trong config.secret.js (đã gitignore)
const CFG = {
  PIN: "100407",
  PIN_HINT: "Sinh nhật mặt trời nhỏ 💕",
  TEN: "Em yêu",
  CAU_HOI: "Em có đồng ý làm người yêu anh IT không dạ bé Duyên mặt trời nhỏ hihi 🥰",
  LOI_NHAN: [
    "Anh thích em không phải vì vẻ ngoài...",
    "Mà vì cái cách em cười khi ngại ngùng 🌸",
    "Vì em luôn ở đó khi anh cần 💫",
    "Và vì em... là em 🥰"
  ],
  LOI_CUOI: "Anh yêu em ♡",
  NGAY_BAT_DAU: "2024-02-14",
  EMAILJS_SERVICE_ID:  "YOUR_SERVICE_ID",
  EMAILJS_TEMPLATE_ID: "YOUR_TEMPLATE_ID",
  EMAILJS_PUBLIC_KEY:  "YOUR_PUBLIC_KEY",
  EMAIL_TO: "your@email.com"
};
// Nạp thông tin bí mật từ config.secret.js (nếu có)
if(typeof CFG_SECRET !== 'undefined') Object.assign(CFG, CFG_SECRET);

// ===================== TIỆN ÍCH =====================
const rnd  = (a,b) => Math.random()*(b-a)+a;
const rndI = (a,b) => Math.floor(rnd(a,b+1));
const lerp = (a,b,t) => a+(b-a)*t;
const clmp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));

function heartPt(t, cx, cy, sc) {
  const x = 16*Math.pow(Math.sin(t),3);
  const y = -(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));
  return {x:cx+x*sc, y:cy+y*sc};
}

function setupCanvas(id) {
  const c = document.getElementById(id);
  if (!c) return null;
  const dpr = Math.min(devicePixelRatio||1,2);
  c.width  = innerWidth*dpr;
  c.height = innerHeight*dpr;
  c.style.cssText += `;position:absolute;top:0;left:0;width:${innerWidth}px;height:${innerHeight}px;`;
  const ctx = c.getContext('2d');
  ctx.scale(dpr,dpr);
  return {c, ctx, W:innerWidth, H:innerHeight, dpr};
}

// ===================== STATE MACHINE =====================
let cur = 0;
const screens = Array.from({length:10},(_,i)=>document.getElementById('s'+i)).filter(Boolean);
const cleanup = {};

function go(n, delay=0) {
  setTimeout(()=>{
    cleanup[cur]?.();
    document.getElementById('s'+cur)?.classList.remove('active');
    cur = n;
    const el = document.getElementById('s'+n);
    if(el) el.classList.add('active');
    enters[n]?.();
  }, delay);
}

// ===================== S0: MỞ ĐẦU =====================
function s0() {
  const cv = setupCanvas('c0');
  if(!cv){ go(1); return; }
  const {ctx,W,H} = cv;

  // Bloom hồng bùng sáng toàn màn — đơn giản, đẹp
  let raf, t0, done=false;
  function draw(ts){
    if(!t0)t0=ts;
    const e=(ts-t0)*.001;
    const D=Math.max(W,H);

    ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);

    // Làn sóng hồng bùng lên theo hình chuông: 0→đỉnh→mờ
    const bloom=Math.sin(clmp(e*.75,0,Math.PI)); // bell curve ~1.33s peak
    const r1=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,D*.55);
    r1.addColorStop(0, `rgba(255,197,210,${bloom*.95})`);
    r1.addColorStop(.35,`rgba(255,143,171,${bloom*.75})`);
    r1.addColorStop(.7, `rgba(212,83,122,${bloom*.35})`);
    r1.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.fillStyle=r1; ctx.fillRect(0,0,W,H);

    // Lớp ngoài phủ toàn màn
    const r2=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,D*.9);
    r2.addColorStop(0, `rgba(255,143,171,${bloom*.30})`);
    r2.addColorStop(.5, `rgba(212,83,122,${bloom*.15})`);
    r2.addColorStop(1,  'rgba(0,0,0,0)');
    ctx.fillStyle=r2; ctx.fillRect(0,0,W,H);

    // Fade-out cuối về màu tối
    if(e>2.4){
      ctx.globalAlpha=clmp((e-2.4)*2.5,0,1);
      ctx.fillStyle='#04000e'; ctx.fillRect(0,0,W,H);
    }
    ctx.globalAlpha=1;
    if(e<3.1&&!done) raf=requestAnimationFrame(draw);
    else if(!done){done=true; go(1);}
  }
  raf=requestAnimationFrame(draw);
  cleanup[0]=()=>cancelAnimationFrame(raf);
}

// ===================== S1: PIN =====================
function s1() {
  const cv = setupCanvas('c1');
  if (!cv) return;
  const {ctx,W,H} = cv;
  const stars = Array.from({length:120},()=>({
    x:rnd(0,W),y:rnd(0,H),r:rnd(.5,2),a:rnd(.3,1),ph:rnd(0,Math.PI*2),sp:rnd(.005,.02)
  }));
  let raf;
  function draw(ts) {
    const t=ts*.001;
    ctx.fillStyle='#0d0015'; ctx.fillRect(0,0,W,H);
    stars.forEach(s=>{
      const a=s.a*(.4+.6*Math.abs(Math.sin(t*s.sp*60+s.ph)));
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,179,217,${a})`; ctx.fill();
    });
    raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);

  const boxes = document.getElementById('pin-boxes');
  const errEl  = document.getElementById('pin-err');
  const hintBtn= document.getElementById('pin-hint-btn');
  const hintTxt= document.getElementById('pin-hint-txt');
  hintTxt.textContent = CFG.PIN_HINT;
  let pinVal='', wrong=0, locked=false;

  function updateBoxes(val) {
    for(let i=0;i<6;i++){
      const b=document.getElementById('pb'+i);
      if(!b)continue;
      b.textContent=val[i]?'●':'';
      b.classList.toggle('filled',i<val.length);
      b.classList.remove('ok');
    }
  }

  function check(v) {
    if(v===CFG.PIN) {
      for(let i=0;i<6;i++) document.getElementById('pb'+i)?.classList.add('ok');
      locked=true;
      setTimeout(()=>go(2), 850);
    } else {
      wrong++;
      boxes.classList.add('shake');
      errEl.classList.add('show');
      if(wrong>=2&&CFG.PIN_HINT) hintBtn.classList.add('show');
      locked=true;
      setTimeout(()=>{
        boxes.classList.remove('shake');
        pinVal=''; updateBoxes('');
        locked=false;
      },420);
      setTimeout(()=>errEl.classList.remove('show'),1800);
    }
  }

  // Bàn phím custom
  function keyHandler(e) {
    if(locked) return;
    const val = e.currentTarget.dataset.val;
    if(pinVal.length>=6) return;
    pinVal += val;
    updateBoxes(pinVal);
    // Hiệu ứng nhấn
    e.currentTarget.classList.add('pressed');
    setTimeout(()=>e.currentTarget.classList.remove('pressed'),150);
    if(pinVal.length===6) check(pinVal);
  }

  function delHandler() {
    if(locked) return;
    pinVal = pinVal.slice(0,-1);
    updateBoxes(pinVal);
  }

  document.querySelectorAll('.key[data-val]').forEach(btn=>{
    btn.addEventListener('click', keyHandler);
  });
  document.getElementById('key-del')?.addEventListener('click', delHandler);

  hintBtn?.addEventListener('click',()=>{ hintTxt.classList.add('show'); hintBtn.classList.remove('show'); });

  cleanup[1]=()=>{
    cancelAnimationFrame(raf);
    document.querySelectorAll('.key[data-val]').forEach(btn=>btn.removeEventListener('click',keyHandler));
    document.getElementById('key-del')?.removeEventListener('click',delHandler);
  };
}

// ===================== S2: MATRIX + ĐẾM NGƯỢC =====================
function s2() {
  const cv = setupCanvas('c2');
  if (!cv) return;
  const {ctx,W,H} = cv;
  const fs=14, cols=Math.floor(W/(fs*.7));
  const drops=Array.from({length:cols},()=>rnd(-H/fs,0));
  const spds=Array.from({length:cols},()=>rnd(.5,1.5));
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789LOVE';
  const ph=document.getElementById('matrix-phrase');
  if(ph){ ph.style.opacity='0'; ph.style.display='none'; }
  let raf, t0, done=false;
  function draw(ts) {
    if(!t0)t0=ts;
    const e=(ts-t0)*.001;
    // Matrix mưa rơi liên tục suốt màn hình
    ctx.fillStyle='rgba(13,0,21,.12)'; ctx.fillRect(0,0,W,H);
    ctx.font=`${fs}px monospace`;
    for(let i=0;i<cols;i++){
      const ch=chars[Math.floor(rnd(0,chars.length))];
      ctx.fillStyle='rgba(255,143,171,.75)';
      ctx.fillText(ch,i*fs*.7,drops[i]*fs);
      drops[i]+=spds[i];
      if(drops[i]*fs>H&&Math.random()>.975) drops[i]=-rnd(0,20);
    }
    // Đếm ngược hiện ĐỒNG THỜI trên nền matrix từ 0.6s
    if(e>=.6){
      const cdE=e-.6;
      const num=3-Math.floor(cdE);
      if(num>0){
        const pulse=Math.sin((cdE%1)*Math.PI);
        ctx.save();
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.font=`bold ${88+pulse*28}px Nunito,sans-serif`;
        ctx.shadowBlur=55+pulse*30; ctx.shadowColor='rgba(255,143,171,1)';
        ctx.fillStyle=`hsl(345,100%,${72+pulse*18}%)`;
        ctx.globalAlpha=.6+pulse*.4;
        ctx.fillText(num,W/2,H/2);
        ctx.restore(); ctx.globalAlpha=1;
      }
      if(cdE>=3.5&&!done){done=true; go(4); return;}
    }
    if(!done) raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);
  cleanup[2]=()=>cancelAnimationFrame(raf);
}

// ===================== S3: PASSTHROUGH =====================
function s3() { go(4); }

// ===================== HELPER: TỌA ĐỘ TỪNG KÝ TỰ CHỮ =====================
function getCharTargets(text, W, H) {
  const oc=document.createElement('canvas');
  oc.width=2; oc.height=2;
  const ox=oc.getContext('2d');

  const fsize=text.length>50?25:text.length>35?28:32;
  ox.font=`bold ${fsize}px 'Dancing Script',cursive`;
  const maxW=W*.86;
  const spW=ox.measureText(' ').width;
  const words=text.split(/\s+/).filter(Boolean);
  const wws=words.map(w=>ox.measureText(w).width);
  const totalMW=wws.reduce((a,b)=>a+b,0)+spW*(words.length-1);

  // Diamond / heart shape: line widths go narrow→wide→wide→narrow→tip
  // Choose fracs based on total text length
  let fracs;
  if(totalMW<maxW*1.6)      fracs=[.65,1.0,.62];            // 3 lines
  else if(totalMW<maxW*2.6) fracs=[.58,1.0,.88,.44];        // 4 lines
  else                       fracs=[.50,.80,1.0,.74,.38];    // 5 lines

  const tgts=fracs.map(f=>maxW*f);
  const nL=fracs.length;

  // Greedy: pack words into each line targeting its width
  const lineWords=Array.from({length:nL},()=>[]);
  let wi=0;
  for(let li=0;li<nL-1&&wi<words.length;li++){
    const tw=tgts[li]; let lw=0;
    while(wi<words.length){
      const added=lw>0?lw+spW+wws[wi]:wws[wi];
      if(added>tw*1.08&&lineWords[li].length>0) break;
      lineWords[li].push(words[wi++]); lw=added;
      if(lw>=tw*.82) break;
    }
  }
  while(wi<words.length) lineWords[nL-1].push(words[wi++]);

  // Vertical: start near top, tight spacing
  const lineH=fsize*1.5;
  const y0=H*.07+fsize;

  const targets=[];
  lineWords.forEach((lw,li)=>{
    const line=lw.join(' ');
    if(!line) return;
    const lmW=ox.measureText(line).width;
    const scale=Math.min(1,maxW/lmW);
    let x=(W-lmW*scale)/2;
    const y=y0+li*lineH;
    for(const char of line){
      const cw=ox.measureText(char).width*scale;
      if(char===' '){x+=cw;continue;}
      targets.push({char,x:x+cw/2,y,fs:fsize*scale});
      x+=cw;
    }
  });
  return targets;
}

// ===================== S4: MÈO BẮN CHỮ GHÉP CÂU HỎI =====================
function s4() {
  const cv=setupCanvas('c4');
  if(!cv) return;
  const {ctx,W,H,dpr}=cv;
  const tgts=getCharTargets(CFG.CAU_HOI,W,H);
  const N=tgts.length;
  // Dùng ảnh thật — tính vị trí miệng Lotso (~63% X, ~56% Y của ảnh)
  const imgW=W*.56, imgH=imgW*.75;
  const imgLeft=0, imgTop=H-imgH*1.06;
  const catX=imgLeft+imgW*.63, catY=imgTop+imgH*.56, catSz=W*.13;
  const bearImgObj=new Image(); bearImgObj.src='images/Imoji.webp';
  let letters=[], arrived=0, hOn=Array(N).fill(false);
  const bgStars=Array.from({length:80},()=>({x:rnd(0,W),y:rnd(0,H),r:rnd(.5,1.5),a:rnd(.2,.8),ph:rnd(0,Math.PI*2)}));
  // Orbs nổi nhẹ trong khoảng giữa màn sau khi chữ về xong
  const orbs=Array.from({length:22},()=>({
    x:rnd(W*.08,W*.92), y:rnd(H*.32,H*.72),
    vy:rnd(.15,.4), vx:rnd(-.12,.12),
    r:rnd(2,5.5), h:rnd(310,350), a:rnd(.18,.45), ph:rnd(0,Math.PI*2)
  }));
  let raf, t0, btnShown=false, si=0;
  const iv=setInterval(()=>{
    if(si>=N){clearInterval(iv);return;}
    const tg=tgts[si];
    letters.push({
      sx:catX+rnd(-catSz*.04,catSz*.04), sy:catY+catSz*.12+rnd(-catSz*.03,catSz*.03),
      x:catX, y:catY,
      tx:tg.x, ty:tg.y, ti:si,
      char:tg.char, fs:tg.fs,
      prog:0, spd:rnd(.014,.026),
      h:rnd(320,360),
      cpx:catX+(tg.x-catX)*.3+rnd(-W*.07,W*.07),
      cpy:catY-H*rnd(.15,.35),
      rot:rnd(-Math.PI*.5,Math.PI*.5)
    });
    si++;
  },140);

  function drawBearImg(e){
    if(!bearImgObj.complete||!bearImgObj.naturalWidth) return;
    const iw=imgW;
    const ih=iw*(bearImgObj.naturalHeight/bearImgObj.naturalWidth);
    const bob=Math.sin(e*2.3)*3;
    ctx.save();
    ctx.globalCompositeOperation='screen';
    ctx.drawImage(bearImgObj,imgLeft,H-ih*1.03+bob,iw,ih);
    ctx.restore();
  }

  function draw(ts){
    if(!t0)t0=ts; const e=(ts-t0)*.001;
    ctx.fillStyle='#0d0015'; ctx.fillRect(0,0,W,H);
    bgStars.forEach(s=>{
      const a=s.a*(.3+.5*Math.abs(Math.sin(e*1.2+s.ph)));
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,200,230,${a})`;ctx.fill();
    });

    // Orbs nổi nhẹ — chỉ hiện sau khi chữ về xong
    if(arrived>=N){
      const showF=clmp((arrived-N+1)*.05,0,1); // fade-in ngay khi done
      // Soft glow sau text
      const tgY0=tgts.length?tgts[0].y:H*.12;
      const gw=ctx.createRadialGradient(W/2,tgY0+20,0,W/2,tgY0+20,W*.45);
      gw.addColorStop(0,`rgba(255,143,171,${showF*.07})`);
      gw.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gw; ctx.fillRect(0,0,W,H);

      orbs.forEach(o=>{
        o.y-=o.vy; o.x+=o.vx+Math.sin(e*.6+o.ph)*.25;
        if(o.y<H*.28){o.y=H*.72+rnd(0,H*.05);o.x=rnd(W*.08,W*.92);}
        const oa=o.a*showF*(.5+.5*Math.sin(e*1.4+o.ph));
        ctx.globalAlpha=oa;
        ctx.beginPath();ctx.arc(o.x,o.y,o.r,0,Math.PI*2);
        ctx.fillStyle=`hsl(${o.h},100%,80%)`;
        ctx.shadowBlur=10; ctx.shadowColor=`hsl(${o.h},100%,88%)`;
        ctx.fill();
      });
      ctx.globalAlpha=1; ctx.shadowBlur=0;
    }

    letters=letters.filter(h=>{
      h.prog=Math.min(1,h.prog+h.spd);
      const mt=1-h.prog,t=h.prog;
      h.x=mt*mt*h.sx+2*mt*t*h.cpx+t*t*h.tx;
      h.y=mt*mt*h.sy+2*mt*t*h.cpy+t*t*h.ty;
      if(h.prog>=1){hOn[h.ti]=true;arrived++;return false;}
      const rot=h.rot*(1-h.prog);
      ctx.save();
      ctx.translate(h.x,h.y); ctx.rotate(rot);
      ctx.font=`bold ${h.fs}px 'Dancing Script',cursive`;
      ctx.fillStyle=`hsl(${h.h},100%,70%)`;
      ctx.globalAlpha=0.75+0.25*h.prog;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.shadowBlur=8; ctx.shadowColor=`hsl(${h.h},100%,85%)`;
      ctx.fillText(h.char,0,0);
      ctx.restore(); ctx.globalAlpha=1; ctx.shadowBlur=0;
      return true;
    });
    hOn.forEach((on,i)=>{
      if(on){
        const tg=tgts[i];
        const pulse=1+.04*Math.sin(e*2.5+i*.4);
        ctx.save();
        ctx.font=`bold ${tg.fs*pulse}px 'Dancing Script',cursive`;
        ctx.fillStyle=`hsl(${345+10*Math.sin(e*1.5+i*.3)},100%,72%)`;
        ctx.globalAlpha=1;
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.shadowBlur=5; ctx.shadowColor='rgba(255,143,171,.7)';
        ctx.fillText(tg.char,tg.x,tg.y);
        ctx.restore(); ctx.globalAlpha=1; ctx.shadowBlur=0;
      }
    });
    drawBearImg(e);
    if(arrived>=N*.88&&!btnShown){
      btnShown=true;
      setTimeout(()=>{
        const bn=document.getElementById('btn-no-4');
        bn.style.left='20px'; bn.style.top='20px';
        document.getElementById('btn-yes-4').classList.add('show');
        bn.classList.add('show');
      },400);
    }
    raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);

  const btnY=document.getElementById('btn-yes-4');
  const btnN=document.getElementById('btn-no-4');
  const dMsg=document.getElementById('dodge-msg-4');
  const area=document.getElementById('btn-area-4');
  const dMsgs=["Ấn nhầm hả?","Thử lại nào~","Chắc chưa? 🤔","Không cho đâu nè!","Nghĩ kỹ chưa? 💕"];
  let dodges=0, yscale=1;

  function dodge(ev){
    ev&&ev.preventDefault(); dodges++;
    if(dodges>=5){
      btnN.textContent='Chấp nhận 💕';
      btnN.style.background='linear-gradient(135deg,#ff8fab,#d4537a)';
      btnN.style.border='none';
      btnN.removeEventListener('pointerdown',dodgeH);
      btnN.removeEventListener('pointerenter',hoverH);
      btnN.addEventListener('click',accept);
      return;
    }
    const rect=area.getBoundingClientRect();
    for(let i=0;i<20;i++){
      const nx=rnd(16,rect.width-120-16),ny=rnd(16,rect.height-50-16);
      const ax=btnY.getBoundingClientRect().left-rect.left;
      const ay=btnY.getBoundingClientRect().top-rect.top;
      if(Math.hypot(nx-ax,ny-ay)>100){btnN.style.left=nx+'px';btnN.style.top=ny+'px';break;}
    }
    yscale=Math.min(1.4,yscale+.08);
    btnY.style.transform=`translateX(-50%) scale(${yscale})`;
    dMsg.textContent=dMsgs[(dodges-1)%dMsgs.length];
    dMsg.classList.add('show');
    setTimeout(()=>dMsg.classList.remove('show'),1200);
  }
  function dodgeH(ev){dodge(ev);}
  function hoverH(ev){if(ev.pointerType!=='touch')dodge(ev);}
  function accept(){go(5);}

  btnN.addEventListener('pointerdown',dodgeH);
  btnN.addEventListener('pointerenter',hoverH);
  btnY.addEventListener('click',accept);

  cleanup[4]=()=>{
    cancelAnimationFrame(raf); clearInterval(iv);
    btnY.classList.remove('show'); btnN.classList.remove('show');
    btnN.style.left='20px'; btnN.style.top='20px';
    btnY.style.transform=''; yscale=1;
    btnN.style.background=''; btnN.style.border=''; btnN.textContent='Từ chối';
    btnY.removeEventListener('click',accept);
    btnN.removeEventListener('pointerdown',dodgeH);
    btnN.removeEventListener('pointerenter',hoverH);
    btnN.removeEventListener('click',accept);
  };
}

// ===================== S5: TRANSITION — IRIS MỞ RA =====================
function s5() {
  const cv=setupCanvas('c5');
  if(!cv){go(7);return;}
  const {ctx,W,H}=cv;

  // Ẩn HTML overlay (cursor nhấp nháy từ màn hình cũ)
  const qwrap=document.querySelector('#s5 .q-wrap');
  if(qwrap) qwrap.style.display='none';

  const img=new Image();
  img.src='images/GauDauFlower.jpg';

  function getImgRect(){
    const iw=img.naturalWidth||1, ih=img.naturalHeight||1;
    const scale=Math.max(W/iw, H/ih);
    const dw=iw*scale, dh=ih*scale;
    return {dx:(W-dw)/2, dy:(H-dh)/2, dw, dh};
  }

  // Hạt lấp lánh
  const sparks=Array.from({length:50},()=>({
    x:rnd(W*.05,W*.95), y:rnd(H*.05,H*.95),
    r:rnd(1,2.8), h:rnd(315,360),
    ph:rnd(0,Math.PI*2), sp:rnd(.7,1.8)
  }));
  // Tim nhỏ bay lên
  const floatHts=Array.from({length:14},()=>({
    x:rnd(W*.08,W*.92), y:rnd(H*.3,H*1.05),
    vy:rnd(.25,.65), sz:rnd(7,17),
    hue:rnd(320,360), ph:rnd(0,Math.PI*2), wb:rnd(.4,.9)
  }));
  function drawMiniHeart(hx,hy,sz,alpha,hue){
    ctx.save(); ctx.globalAlpha=alpha;
    ctx.translate(hx,hy); ctx.scale(sz/14,sz/14);
    ctx.beginPath();
    ctx.moveTo(0,3);
    ctx.bezierCurveTo(-14,-6,-14,-18,0,-12);
    ctx.bezierCurveTo(14,-18,14,-6,0,3);
    ctx.fillStyle=`hsl(${hue},100%,72%)`;
    ctx.shadowBlur=sz*.9; ctx.shadowColor=`hsl(${hue},100%,85%)`;
    ctx.fill(); ctx.restore();
  }

  // T_OPEN: 0→3.8s — iris mở ra chậm (ease-out)
  // T_HOLD: 3.8→7.2s — giữ ảnh (3.4s)
  // T_FADE: 7.2→8.2s — fade out đen
  const T_OPEN=3.8, T_HOLD=7.2, T_FADE=8.2;
  const maxR=Math.hypot(W,H)*.55; // bán kính tối đa phủ hết màn

  let raf,t0,done=false;
  function draw(ts){
    if(!t0)t0=ts;
    const e=(ts-t0)*.001;
    ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);

    if(img.complete && img.naturalWidth){
      const {dx,dy,dw,dh}=getImgRect();

      // Ease-out cubic cho iris: t → 1-(1-t)³
      const rawP=clmp(e/T_OPEN,0,1);
      const irisP=1-Math.pow(1-rawP,3); // ease-out
      const radius=irisP*maxR;

      // Clip hình tròn mở ra
      ctx.save();
      ctx.beginPath();
      ctx.arc(W/2, H/2, radius, 0, Math.PI*2);
      ctx.clip();
      ctx.drawImage(img,dx,dy,dw,dh);

      // Lớp hồng nhẹ
      ctx.fillStyle='rgba(255,143,171,.12)';
      ctx.fillRect(dx,dy,dw,dh);
      ctx.restore();

      // Vignette mờ viền (ngoài clip, phủ toàn màn)
      if(irisP>0.05){
        const vigA=clmp(irisP,0,1);
        const vig=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.28,W/2,H/2,Math.max(W,H)*.72);
        vig.addColorStop(0,'rgba(0,0,0,0)');
        vig.addColorStop(.6,'rgba(0,0,0,0)');
        vig.addColorStop(1,`rgba(0,0,0,${vigA*.62})`);
        ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
      }

      // Viền sáng chạy theo biên iris (chỉ khi đang mở)
      if(rawP<1){
        ctx.save();
        ctx.beginPath();
        ctx.arc(W/2,H/2,radius,0,Math.PI*2);
        const edgeGlow=ctx.createRadialGradient(W/2,H/2,Math.max(0,radius-18),W/2,H/2,radius+6);
        edgeGlow.addColorStop(0,'rgba(255,200,220,0)');
        edgeGlow.addColorStop(.6,`rgba(255,143,171,${.6*(1-rawP)})`);
        edgeGlow.addColorStop(1,'rgba(255,143,171,0)');
        ctx.fillStyle=edgeGlow; ctx.fill();
        ctx.restore();
      }

      // Hiệu ứng — bắt đầu từ 60% iris mở
      if(e>T_OPEN*.6){
        const fxAge=e-T_OPEN*.6;
        const fadeIn=clmp(fxAge*.55,0,1);
        const fadeOut=clmp(1-(e-T_HOLD)/(T_FADE-T_HOLD),0,1);
        const fxA=fadeIn*fadeOut;

        // Sparkle lấp lánh
        sparks.forEach(sp=>{
          const a=fxA*(.35+.65*Math.abs(Math.sin(e*sp.sp+sp.ph)));
          ctx.beginPath(); ctx.arc(sp.x,sp.y,sp.r,0,Math.PI*2);
          ctx.fillStyle=`hsla(${sp.h},100%,90%,${a})`;
          ctx.shadowBlur=4; ctx.shadowColor=`hsla(${sp.h},100%,95%,${a*.8})`;
          ctx.fill();
        });
        ctx.shadowBlur=0;

        // Tim nhỏ bay lên chậm
        floatHts.forEach(h=>{
          h.y-=h.vy;
          if(h.y<-h.sz*2){h.y=H+h.sz*2; h.x=rnd(W*.08,W*.92);}
          const a=fxA*(.4+.4*Math.abs(Math.sin(e*.9+h.ph)));
          drawMiniHeart(h.x+Math.sin(e*h.wb+h.ph)*6, h.y, h.sz, a, h.hue);
        });
      }

      // Fade out về đen
      if(e>T_HOLD){
        const fo=clmp((e-T_HOLD)/(T_FADE-T_HOLD),0,1);
        ctx.globalAlpha=fo;
        ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
        ctx.globalAlpha=1;
      }
    }

    if(e<T_FADE&&!done) raf=requestAnimationFrame(draw);
    else if(!done){done=true; go(7);}
  }
  raf=requestAnimationFrame(draw);
  cleanup[5]=()=>{
    cancelAnimationFrame(raf);
    if(qwrap) qwrap.style.display='';
  };
}

// ===================== S6: PASSTHROUGH =====================
function s6() { go(7); }

// ===================== S7: TRÁI TIM 3D BAY LÊN GHÉP HÌNH =====================
function s7() {
  const cv=setupCanvas('c7');
  if(!cv) return;
  const {ctx,W,H}=cv;
  // cy shifted slightly down so text has room below
  const cx=W/2, cy=H*.47;
  // hs: pixels per normalised unit. Heart x ∈ [-1.3,1.3], y ∈ [-1.0,1.25]
  // After rotation ±22° and perspective the effective screen spread ≈ 1.45×hs each side
  const hs=Math.min(W*.29, H*.27);
  const FOV=5.5;

  // 2D heart implicit (normalised): bumps at +y (top), tip at -y (bottom)
  // (x²+y²-1)³ - x²y³ ≤ 0
  function inHeart2D(x,y){
    const a=x*x+y*y-1;
    return a*a*a-x*x*y*y*y<=0;
  }

  const N=W<600?750:1050;
  const pts=[];
  let tries=0;
  while(pts.length<N&&tries<500000){
    tries++;
    const x=rnd(-1.3,1.3), y=rnd(-1.05,1.28);
    if(!inHeart2D(x,y)) continue;
    // Pillow z: thicker in centre (dome), zero at edge — gives 3-D depth cue on rotation
    const r=Math.sqrt(x*x+(y-.08)*(y-.08));
    const mz=.40*Math.max(0,1-r/1.45);
    pts.push({x, y, z:rnd(-mz*.6, mz)});
  }

  // Pre-compute flat arrival pos (no rotation yet) for the assembly Bezier
  const particles=pts.map(p=>{
    const pv=FOV/(FOV+p.z);
    return {
      tx3:p.x, ty3:p.y, tz3:p.z,
      flatX:cx+p.x*hs*pv, flatY:cy-p.y*hs*pv,
      sx:rnd(W*.12,W*.88), sy:H*.97+rnd(0,H*.05),
      cpx:rnd(W*.05,W*.95), cpy:H*rnd(.3,.72),
      prog:rnd(-1.8,0), spd:rnd(.0038,.0072),
      r:rnd(1.1,2.7), hue:rnd(10,50), ph:rnd(0,Math.PI*2)
    };
  });

  const bgStars=Array.from({length:120},()=>({x:rnd(0,W),y:rnd(0,H),r:rnd(.5,1.8),a:rnd(.2,.8),ph:rnd(0,Math.PI*2)}));
  let raf,t0,txtDone=false,btnDone=false,assembled=false,tAssembled=0;
  const N_total=particles.length; // used to detect assembly completion
  const btnWrite=document.getElementById('btn-write-note');

  function draw(ts){
    if(!t0)t0=ts; const e=(ts-t0)*.001;
    ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
    bgStars.forEach(s=>{
      const a=s.a*(.3+.7*Math.abs(Math.sin(e*1.2+s.ph)));
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,220,240,${a})`;ctx.fill();
    });

    // Rotation and heartbeat only START after all particles arrive
    const ea=assembled?e-tAssembled:0; // time since assembly finished
    const rt=Math.max(0,ea-0.8);       // rotation starts 0.8s after assembly
    const ry=Math.sin(rt*.38)*.40, rx=Math.sin(rt*.23+1.)*.14;
    const cy_=Math.cos(ry),sy_=Math.sin(ry),cx_=Math.cos(rx),sx_=Math.sin(rx);

    // Heartbeat: only after assembly
    const bt=assembled?(ea%1.8)/1.8:0;
    const bs=assembled?(bt<.1?lerp(1,1.06,bt/.1):bt<.2?lerp(1.06,1,(bt-.1)/.1):bt<.3?lerp(1,1.03,(bt-.2)/.1):bt<.4?lerp(1.03,1,(bt-.3)/.1):1):1;

    // Glow halo
    const gHue=345+10*Math.sin(e*.4);
    ctx.save();
    const gr=ctx.createRadialGradient(cx,cy,0,cx,cy,hs*1.9);
    gr.addColorStop(0,`hsla(${gHue},100%,62%,.30)`);
    gr.addColorStop(.5,`hsla(${gHue},100%,50%,.12)`);
    gr.addColorStop(1,'transparent');
    ctx.fillStyle=gr; ctx.fillRect(0,0,W,H);
    ctx.restore();

    // Collect arrived particles for depth sort
    const arrived=[];

    particles.forEach(p=>{
      p.prog=Math.min(1,p.prog+p.spd);
      if(p.prog<=0) return;

      if(p.prog<1){
        // In-flight: bezier → flat target
        const mt=1-p.prog,t=p.prog;
        const bx=mt*mt*p.sx+2*mt*t*p.cpx+t*t*p.flatX;
        const by=mt*mt*p.sy+2*mt*t*p.cpy+t*t*p.flatY;
        const ph=lerp(p.hue+15,345,p.prog);
        ctx.save();
        ctx.globalAlpha=clmp(p.prog*3,0,1);
        ctx.fillStyle=`hsl(${ph},100%,76%)`;
        ctx.beginPath();ctx.arc(bx,by,p.r*.7,0,Math.PI*2);ctx.fill();
        ctx.restore();
      } else {
        // Arrived: vortex spiral (slow whirlwind) after assembly
        const spiralAge=assembled?Math.max(0,ea-2.0):0;
        const spiralA=clmp(spiralAge*.10,0,.75);  // ramp very slowly
        const orbitW=.032*spiralA;
        const orbitAng=e*.22+p.ph*2.1;            // slow angular velocity
        const upDrift=spiralAge*.0045*spiralA;     // gentle upward rise
        const fx=p.tx3+Math.sin(orbitAng)*orbitW+Math.sin(e*.5+p.ph)*.006;
        const fy=p.ty3+upDrift+Math.cos(e*.4+p.ph*1.1)*.006;
        const fz=p.tz3+Math.cos(orbitAng)*orbitW+Math.sin(e*.6+p.ph*.9)*.006;
        // Rotate Y then X
        const x1=fx*cy_+fz*sy_, z1=-fx*sy_+fz*cy_;
        const y1=fy*cx_-z1*sx_, z2=fy*sx_+z1*cx_;
        const persp=FOV/(FOV+z2);
        arrived.push({
          px:cx+x1*hs*bs*persp, py:cy-y1*hs*bs*persp,
          z:z2, r:p.r, hue:p.hue, ph:p.ph
        });
      }
    });

    // Painter's algorithm: back → front
    arrived.sort((a,b)=>a.z-b.z);
    arrived.forEach(p=>{
      // z after rotation ≈ [-1.1, 1.1]; map to depth 0=back 1=front
      const d=clmp((p.z+1.1)/2.2,0,1);
      const hue=lerp(335,348,d);
      const lum=lerp(45,82,d);
      const alpha=lerp(.38,1.0,d);
      const r=p.r*lerp(.45,1.25,d);
      const twinkle=.55+.45*Math.abs(Math.sin(e*2+p.ph));
      ctx.save();
      ctx.globalAlpha=alpha*twinkle;
      if(d>.5){ctx.shadowBlur=8*d; ctx.shadowColor=`hsl(${hue},100%,88%)`;}
      ctx.fillStyle=`hsl(${hue},100%,${lum}%)`;
      ctx.beginPath();ctx.arc(p.px,p.py,r,0,Math.PI*2);ctx.fill();
      ctx.restore();
    });
    ctx.globalAlpha=1; ctx.shadowBlur=0;

    // Mark assembly complete when all particles have arrived
    if(!assembled && arrived.length>=N_total){
      assembled=true; tAssembled=e;
    }

    if(assembled&&ea>0.8&&!txtDone){
      txtDone=true;
      document.getElementById('final-main').textContent=CFG.LOI_CUOI;
      document.getElementById('final-main').classList.add('show');
    }
    if(assembled&&ea>3&&!btnDone){btnDone=true; btnWrite.classList.add('show');}
    raf=requestAnimationFrame(draw);
  }
  raf=requestAnimationFrame(draw);

  function goNote(){go(8);}
  btnWrite.addEventListener('click',goNote);
  cleanup[7]=()=>{
    cancelAnimationFrame(raf);
    document.getElementById('final-main').classList.remove('show');
    document.getElementById('final-days').classList.remove('show');
    btnWrite.classList.remove('show');
    btnWrite.removeEventListener('click',goNote);
  };
}

// ===================== S8: VIẾT LỜI NHẮN =====================
function s8() {
  const cv = setupCanvas('c8');
  if (!cv) return;
  const {ctx,W,H} = cv;
  const stars=Array.from({length:80},()=>({x:rnd(0,W),y:rnd(0,H),r:rnd(.5,1.5),a:rnd(.3,.8),ph:rnd(0,Math.PI*2)}));
  let raf,t0;
  function drawBg(ts){
    if(!t0)t0=ts; const e=(ts-t0)*.001;
    ctx.fillStyle='rgba(13,0,21,.35)'; ctx.fillRect(0,0,W,H);
    stars.forEach(s=>{
      const a=s.a*(.3+.7*Math.abs(Math.sin(e*1.2+s.ph)));
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,200,230,${a})`;ctx.fill();
    });
    raf=requestAnimationFrame(drawBg);
  }
  // Vẽ nền một lần rồi chạy loop
  ctx.fillStyle='#0d0015'; ctx.fillRect(0,0,W,H);
  raf=requestAnimationFrame(drawBg);

  const backBtn8 = document.getElementById('btn-back-s8');
  function goBack8(){ go(7); }
  backBtn8?.addEventListener('click', goBack8);

  const noteInput = document.getElementById('note-input');
  const noteCount = document.getElementById('note-count');
  const previewBtn = document.getElementById('note-preview-btn');

  noteInput.value='';
  noteCount.textContent='0';

  function onNoteInput(){
    const v=noteInput.value.slice(0,500);
    noteInput.value=v;
    noteCount.textContent=v.length;
  }
  noteInput.addEventListener('input',onNoteInput);

  function goPreview(){
    const txt=noteInput.value.trim();
    if(!txt){ noteInput.focus(); return; }
    go(9);
  }
  previewBtn.addEventListener('click',goPreview);

  // Cho phép chạm vào textarea
  noteInput.style.userSelect='text';
  noteInput.style.webkitUserSelect='text';
  setTimeout(()=>{ try{noteInput.focus()}catch(e){} },400);

  cleanup[8]=()=>{
    cancelAnimationFrame(raf);
    noteInput.removeEventListener('input',onNoteInput);
    previewBtn.removeEventListener('click',goPreview);
    backBtn8?.removeEventListener('click',goBack8);
  };
}

// ===================== S9: LÁ THƯ XEM TRƯỚC + GỬI =====================
function s9() {
  const cv = setupCanvas('c9');
  if (!cv) return;
  const {ctx,W,H} = cv;
  const stars=Array.from({length:80},()=>({x:rnd(0,W),y:rnd(0,H),r:rnd(.5,1.5),a:rnd(.3,.8),ph:rnd(0,Math.PI*2)}));
  let raf,t0;
  function drawBg(ts){
    if(!t0)t0=ts; const e=(ts-t0)*.001;
    ctx.fillStyle='rgba(13,0,21,.3)'; ctx.fillRect(0,0,W,H);
    stars.forEach(s=>{
      const a=s.a*(.3+.7*Math.abs(Math.sin(e*1.3+s.ph)));
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,200,230,${a})`;ctx.fill();
    });
    raf=requestAnimationFrame(drawBg);
  }
  ctx.fillStyle='#0d0015'; ctx.fillRect(0,0,W,H);
  raf=requestAnimationFrame(drawBg);

  // Điền nội dung lá thư
  const msg = document.getElementById('note-input').value.trim();
  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});
  const timeStr = now.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});

  document.getElementById('letter-date').textContent = `${dateStr} · ${timeStr}`;
  document.getElementById('letter-body-text').textContent = msg;

  const statusEl = document.getElementById('send-status');
  const sendBtn  = document.getElementById('btn-send-letter');
  const backBtn  = document.getElementById('btn-back-note');

  function goBack(){ go(8); }
  backBtn.addEventListener('click',goBack);

  async function sendLetter() {
    if(!msg){ statusEl.textContent='Chưa có nội dung để gửi!'; statusEl.className='send-status show error'; return; }

    sendBtn.disabled=true;
    sendBtn.textContent='Đang gửi... 💌';
    statusEl.className='send-status';

    const isConfigured = CFG.EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID';

    if(isConfigured && typeof emailjs !== 'undefined') {
      try {
        await emailjs.send(CFG.EMAILJS_SERVICE_ID, CFG.EMAILJS_TEMPLATE_ID, {
          to_email: CFG.EMAIL_TO,
          name: 'Người đặc biệt 🌸',   // khớp {{name}} trong template
          message: msg,                   // khớp {{message}} trong template
          time: `${dateStr} ${timeStr}`,  // khớp {{time}} trong template
          sent_date: `${dateStr} ${timeStr}`
        }, CFG.EMAILJS_PUBLIC_KEY);

        sendBtn.textContent='Đã gửi! 💕';
        statusEl.textContent='Lá thư đã bay đến anh rồi nhé! 🌸';
        statusEl.className='send-status show success';
        spawnSuccessHearts();
      } catch(err) {
        sendBtn.disabled=false;
        sendBtn.textContent='Gửi đi 💌';
        statusEl.textContent='Gửi thất bại, thử lại nhé!';
        statusEl.className='send-status show error';
      }
    } else {
      // Fallback: mailto
      const subject=encodeURIComponent('💌 Lá thư từ người đặc biệt');
      const body=encodeURIComponent(`Lời nhắn:\n\n${msg}\n\nGửi lúc: ${dateStr} ${timeStr}`);
      window.location.href=`mailto:${CFG.EMAIL_TO}?subject=${subject}&body=${body}`;
      sendBtn.textContent='Đã mở ứng dụng mail 💕';
      statusEl.textContent='Vui lòng gửi từ ứng dụng email trên máy 🌸';
      statusEl.className='send-status show success';
    }
  }

  sendBtn.addEventListener('click',sendLetter);

  // Pháo hoa thành công
  function spawnSuccessHearts(){
    let p=[];
    const sc=document.getElementById('c9');
    const c2=sc.getContext('2d');
    function burst2(){
      for(let i=0;i<60;i++){
        const a=rnd(0,Math.PI*2),sp=rnd(2,8);
        p.push({x:W/2,y:H/2,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:1,dec:rnd(.015,.03),r:rnd(3,7),h:rnd(310,360)});
      }
    }
    burst2(); setTimeout(burst2,400); setTimeout(burst2,800);
    function draw2(){
      p=p.filter(pt=>{
        pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=.1;pt.life-=pt.dec;
        if(pt.life<=0)return false;
        c2.globalAlpha=pt.life;c2.beginPath();
        c2.arc(pt.x*(devicePixelRatio||1),pt.y*(devicePixelRatio||1),pt.r,0,Math.PI*2);
        c2.fillStyle=`hsl(${pt.h},100%,65%)`;c2.fill();
        return true;
      });
      c2.globalAlpha=1;
      if(p.length>0)requestAnimationFrame(draw2);
    }
    requestAnimationFrame(draw2);
  }

  cleanup[9]=()=>{
    cancelAnimationFrame(raf);
    backBtn.removeEventListener('click',goBack);
    sendBtn.removeEventListener('click',sendLetter);
    sendBtn.disabled=false;
    sendBtn.textContent='Gửi đi 💌';
    statusEl.className='send-status';
  };
}

const enters={1:s1,2:s2,3:s3,4:s4,5:s5,6:s6,7:s7,8:s8,9:s9};


// ===================== KHỞI ĐỘNG =====================
s0();
