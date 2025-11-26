const assets=[
{name:"Apel",url:"https://images.icon-icons.com/16/PNG/96/fruit_apple_food_1815.png",isBomb:false},
{name:"Pir Hijau",url:"https://images.icon-icons.com/53/PNG/96/fruits_vegetables_10762.png",isBomb:false},
{name:"Kiwi",url:"https://images.icon-icons.com/16/PNG/96/fruit_food_Chinesegoosebeery_goosebeery_1810.png",isBomb:false},
{name:"Persik",url:"https://images.icon-icons.com/1158/PNG/96/1487086632-fruit-peach_81589.png",isBomb:false},
{name:"Lemon",url:"https://images.icon-icons.com/2451/PNG/96/lemon_fruit_food_icon_148902.png",isBomb:true}
]
let score=0
let lives=3
let gameRunning=false
let isMouseDown=false
let lastMousePosition={x:0,y:0}
let bladeEl
let fruits=[]
let pieces=[]
let rafId=null
let fruitInterval=null
const container=document.getElementById("game-container")
const scoreEl=document.getElementById("score")
const livesEl=document.getElementById("lives")
const startBtn=document.getElementById("start-button")
function pickAsset(){
const bomb=assets.find(a=>a.isBomb)
const nonBombs=assets.filter(a=>!a.isBomb)
if(Math.random()<0.1)return bomb
return nonBombs[Math.floor(Math.random()*nonBombs.length)]
}
function createFruit(){
const a=pickAsset()
const img=document.createElement("img")
img.src=a.url
img.className=a.isBomb?"bomb":"fruit"
const w=80,h=80
const startX=container.clientWidth/2+(Math.random()*120-60)
const startY=container.clientHeight-h-2
const vx=(Math.random()*6-3)
const vy=-(12+Math.random()*6)
const f={el:img,x:startX,y:startY,vx,vy,w,h,isBomb:a.isBomb,sliced:false}
img.style.transform=`translate(${f.x}px,${f.y}px)`
container.appendChild(img)
fruits.push(f)
}
function updateGame(){
const g=0.5
fruits=fruits.filter(f=>{
f.vy+=g
f.x+=f.vx
f.y+=f.vy
f.el.style.transform=`translate(${f.x}px,${f.y}px)`
const offTop=f.y+f.h<0
const offBottom=f.y>container.clientHeight+120
const offSide=f.x<-120||f.x>container.clientWidth+120
if(offTop){
if(!f.isBomb)loseLife()
removeEl(f.el)
return false
}
if(offBottom||offSide){
removeEl(f.el)
return false
}
return true
})
pieces=pieces.filter(p=>{
p.vy+=g
p.x+=p.vx
p.y+=p.vy
p.rotation+=p.rotv
p.opacity-=0.02
p.el.style.transform=`translate(${p.x}px,${p.y}px) rotate(${p.rotation}deg)`
p.el.style.opacity=String(p.opacity)
const done=p.opacity<=0||p.y>container.clientHeight+120
if(done){removeEl(p.el);return false}
return true
})
rafId=requestAnimationFrame(updateGame)
}
function lineCircleHit(x1,y1,x2,y2,cx,cy,r){
const dx=x2-x1,dy=y2-y1
const fx=cx-x1,fy=cy-y1
const t=(fx*dx+fy*dy)/(dx*dx+dy*dy)
const tt=Math.max(0,Math.min(1,t))
const px=x1+dx*tt,py=y1+dy*tt
const ddx=cx-px,ddy=cy-py
return ddx*ddx+ddy*ddy<=r*r
}
function sliceFruit(f){
if(f.sliced)return
f.sliced=true
if(f.isBomb){
loseLife()
spawnExplosion(f.x+f.w/2,f.y+f.h/2)
removeEl(f.el)
fruits=fruits.filter(x=>x!==f)
return
}
score+=1
scoreEl.textContent=`Skor: ${score}`
removeEl(f.el)
fruits=fruits.filter(x=>x!==f)
spawnPieces(f)
}
function spawnPieces(f){
for(let i=0;i<2;i++){
const el=document.createElement("img")
el.src=f.el.src
el.className="piece"
const w=64,h=64
const vx=i===0?-(2+Math.random()*2):(2+Math.random()*2)
const vy=f.vy*0.5
const p={el,x:f.x+(i===0?-10:10),y:f.y+10,vx,vy,w,h,rotation:Math.random()*40*(i===0?-1:1),rotv:(Math.random()*6+2)*(i===0?-1:1),opacity:1}
el.style.transform=`translate(${p.x}px,${p.y}px) rotate(${p.rotation}deg)`
container.appendChild(el)
pieces.push(p)
}
}
function spawnExplosion(x,y){
const e=document.createElement("div")
e.className="explosion"
e.style.left="0"
e.style.top="0"
e.style.transform=`translate(${x-60}px,${y-60}px)`
container.appendChild(e)
setTimeout(()=>removeEl(e),450)
}
function loseLife(){
if(!gameRunning)return
lives-=1
livesEl.textContent=`Nyawa: ${lives}`
if(lives<=0)endGame()
}
function startGame(){
score=0
lives=3
gameRunning=true
isMouseDown=false
scoreEl.textContent=`Skor: ${score}`
livesEl.textContent=`Nyawa: ${lives}`
clearAll()
for(let i=0;i<3;i++)setTimeout(createFruit,200*i)
fruitInterval=setInterval(()=>createFruit(),1000+Math.floor(Math.random()*500))
cancelAnimationFrame(rafId)
rafId=requestAnimationFrame(updateGame)
startBtn.textContent="Reset"
}
function endGame(){
gameRunning=false
clearInterval(fruitInterval)
fruitInterval=null
cancelAnimationFrame(rafId)
rafId=null
alert("Game Over")
startBtn.textContent="Mulai"
}
function clearAll(){
fruits.forEach(f=>removeEl(f.el))
pieces.forEach(p=>removeEl(p.el))
fruits=[]
pieces=[]
}
function removeEl(el){
if(el&&el.parentNode)el.parentNode.removeChild(el)
}
function handleMouseMove(e){
const rect=container.getBoundingClientRect()
const x=e.clientX-rect.left
const y=e.clientY-rect.top
if(bladeEl){bladeEl.style.transform=`translate(${x-7}px,${y-7}px)`}
if(isMouseDown){
spawnTrail(lastMousePosition.x,lastMousePosition.y,x,y)
fruits.forEach(f=>{
const cx=f.x+f.w/2,cy=f.y+f.h/2
const hit=lineCircleHit(lastMousePosition.x,lastMousePosition.y,x,y,cx,cy,Math.min(f.w,f.h)*0.45)
if(hit)sliceFruit(f)
})
}
lastMousePosition={x,y}
}
function spawnTrail(x1,y1,x2,y2){
const dx=x2-x1,dy=y2-y1
const dist=Math.hypot(dx,dy)
if(dist<6)return
const n=Math.min(6,Math.floor(dist/10))
for(let i=1;i<=n;i++){
const t=i/n
const x=x1+dx*t
const y=y1+dy*t
const el=document.createElement("div")
el.className="slice-trail"
const ang=Math.atan2(dy,dx)*180/Math.PI
el.style.transform=`translate(${x}px,${y}px) rotate(${ang}deg)`
container.appendChild(el)
setTimeout(()=>removeEl(el),180)
}
}
function handleMouseDown(){
isMouseDown=true
if(!bladeEl){
bladeEl=document.createElement("div")
bladeEl.className="blade"
container.appendChild(bladeEl)
}
}
function handleMouseUp(){
isMouseDown=false
}
container.addEventListener("mousemove",handleMouseMove)
container.addEventListener("mousedown",handleMouseDown)
container.addEventListener("mouseup",handleMouseUp)
startBtn.addEventListener("click",()=>{
if(!gameRunning)startGame();else startGame()
})
