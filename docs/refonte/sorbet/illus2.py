# Essais du 19 novembre 2026, dans le vocabulaire exact de illus.py : papier kraft en dégradé, filet kraft de 2 px,
# couture brique en pointillés, cachet de cire, brins de sapin, baies, étoiles à quatre branches, ombre au sol.
from illus import star,sprig,berry,wax,ground,DEFS
K='#cdb48a'
def tier(pts,fill='#2f613f',dy=0):
    p=' '.join(f'{x},{y+dy}' for x,y in pts)
    return f'<polygon points="{p}" fill="{fill}" stroke="{fill}" stroke-width="5" stroke-linejoin="round"/>'
def tree(cx=80,orn=True):
    B=[(cx-36,108),(cx+36,108),(cx,58)]; M=[(cx-28,84),(cx+28,84),(cx,42)]; T=[(cx-20,60),(cx+20,60),(cx,26)]
    s=(f'<rect x="{cx-5}" y="106" width="10" height="14" rx="2" fill="#79511d"/>'
       +tier(B)+tier(M,'#274e34',5)+tier(M)+tier(T,'#274e34',5)+tier(T)
       +f'<path d="M{cx-12} 46q5-10 11-16" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.28"/>'
       +f'<path d="M{cx-24} 97q24 10 48-3M{cx-17} 73q17 8 34-3" stroke="#f9eecb" stroke-width="1.500" stroke-linecap="round" stroke-dasharray="4 5" opacity="0.85"/>')
    if orn: s+=berry(cx-14,101,4)+berry(cx+16,99,3.4,'#b8483a')+berry(cx+10,77,3.6,'#d9a93a')+berry(cx-8,54,3,'#b8483a')
    return s+star(cx,17,9,'#e6b94a')
def parcel(x,y,w,h,string='#b8483a',seal=True):
    cx=x+w/2; cy=y+h*0.46
    s=(f'<rect x="{x}" y="{y+2.5}" width="{w}" height="{h}" rx="5" fill="#3c1e0a" opacity="0.1"/>'
       f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="url(#env-paper)" stroke="{K}" stroke-width="2"/>'
       f'<path d="M{x+3} {y+7}h{w-6}" stroke="#fffdf9" stroke-width="3" stroke-linecap="round" opacity="0.7"/>'
       f'<path d="M{cx} {y+1}v{h-2}M{x+1} {cy}h{w-2}" stroke="{string}" stroke-width="2" stroke-linecap="round"/>')
    return s+(wax(cx,cy,8) if seal else berry(cx,cy,4))
def connexion():
    return (ground(0.1,82)+star(160,30,6,'#e6b94a')+star(20,44,4.5,'#e6b94a')+'<circle cx="146" cy="14" r="1.800" fill="#b8483a"/>'
        +tree(84)+parcel(122,76,44,42)+parcel(18,92,32,26,'#2f613f',False)+sprig(132,76,150,58,n=2,L=6)+berry(136,70,3.4))
def empty():
    x,y,w,h=124,78,42,40; cx=x+w/2; cy=y+h*0.46
    return (ground(0.07,80)+star(160,34,5,'#e9dcc5')+star(22,46,4,'#e9dcc5')+tree(80,False)
        +f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="5" fill="#f7f2e9" stroke="{K}" stroke-width="2" stroke-dasharray="7 6"/>'
        +f'<path d="M{cx} {y+2}v{h-4}M{x+2} {cy}h{w-4}" stroke="#dccbad" stroke-width="2" stroke-linecap="round" stroke-dasharray="7 6"/>')
def liste():
    def row(y,done,w):
        box=(f'<rect x="58" y="{y}" width="13" height="13" rx="3.500" fill="#2f613f"/><path d="m61 {y+6.5} 3 3 5-5.500" stroke="#ffffff" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/>'
             if done else f'<rect x="59" y="{y+1}" width="11" height="11" rx="3" fill="#fffdf9" stroke="{K}" stroke-width="2"/>')
        return box+f'<path d="M80 {y+6.5}h{w}" stroke="#dccbad" stroke-width="3" stroke-linecap="round"/>'
    return (ground(0.1,70)+star(24,22,6,'#e6b94a')+star(160,14,4.5,'#e6b94a')+'<circle cx="150" cy="30" r="1.800" fill="#b8483a"/>'
        +'<rect x="44" y="10.500" width="96" height="108" rx="6" fill="#3c1e0a" opacity="0.1"/><rect x="44" y="8" width="96" height="108" rx="6" fill="#fffdf9" stroke="#cdb48a" stroke-width="2"/>'
        +'<rect x="51" y="15" width="82" height="94" rx="3" stroke="#b8483a" stroke-width="1.200" stroke-dasharray="3 4" opacity="0.5"/>'
        +star(92,29,8,'#b8483a')+row(44,True,36)+row(63,False,44)+row(82,False,28)
        +sprig(126,104,150,82)+sprig(126,104,156,98,n=2)+berry(134,95,4)+berry(141,101,3.2,'#d9a93a'))
KINDS={'connexion':connexion,'empty':empty,'liste':liste}
def svg(kind,w,label=None):
    h=round(w*128/184); a=f'role="img" aria-label="{label}"' if label else 'aria-hidden="true"'
    return f'<svg {a} width="{w}" height="{h}" viewBox="0 0 184 128" fill="none">{DEFS}{KINDS[kind]()}</svg>'
if __name__=='__main__':
    import subprocess,re,sys
    src=open('/home/claude/gen/sorbet_all.py').read()
    for k in KINDS:
        open(f'ill/n_{k}.svg','w').write(svg(k,368).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '))
        subprocess.run(['rsvg-convert','-b','#fffdf9',f'ill/n_{k}.svg','-o',f'ill/n_{k}.png'],check=True)
    subprocess.run('cd ill && convert n_connexion.png n_empty.png n_liste.png +append n_all.png',shell=True,check=True)

# ---- suite du 19 novembre 2026 : cinq autres, même vocabulaire
def badge(cx,cy,r=16):
    return (f'<circle cx="{cx}" cy="{cy+2.5}" r="{r}" fill="#3c1e0a" opacity="0.16"/><circle cx="{cx}" cy="{cy}" r="{r}" fill="#2f613f"/>'
        f'<path d="M{cx-r*0.75:.1f} {cy-r*0.3:.1f}a{r*0.8:.1f} {r*0.8:.1f} 0 0 1 {r*0.45:.1f}-{r*0.4:.1f}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.28"/>'
        f'<path d="m{cx-r*0.45:.1f} {cy} {r*0.3:.1f} {r*0.3:.1f} {r*0.6:.1f}-{r*0.6:.1f}" stroke="#ffffff" stroke-width="{r*0.2:.1f}" stroke-linecap="round" stroke-linejoin="round"/>')
def tag():
    def row(y,c,w): return star(82,y,5.5,c)+f'<path d="M94 {y}h{w}" stroke="#dccbad" stroke-width="3" stroke-linecap="round"/>'
    return (ground(0.1,70)+star(160,18,6,'#e6b94a')+star(26,96,4.5,'#e6b94a')+'<circle cx="150" cy="104" r="1.800" fill="#b8483a"/>'
        +sprig(128,34,152,14)+sprig(128,34,158,30,n=2)+berry(136,26,3.8)
        +'<g transform="rotate(-7 92 66)"><rect x="42" y="30.500" width="110" height="76" rx="9" fill="#3c1e0a" opacity="0.1"/>'
        '<rect x="42" y="28" width="110" height="76" rx="9" fill="url(#env-paper)" stroke="#cdb48a" stroke-width="2"/>'
        '<rect x="49" y="35" width="96" height="62" rx="5" stroke="#b8483a" stroke-width="1.200" stroke-dasharray="3 4" opacity="0.5"/>'
        '<path d="M60 66C44 58 34 46 22 30" stroke="#b8483a" stroke-width="2" stroke-linecap="round"/>'
        '<circle cx="60" cy="66" r="6" fill="#f7f2e9" stroke="#cdb48a" stroke-width="2"/>'
        +row(49,'#b8483a',40)+row(66,'#2f613f',46)+row(83,'#e6b94a',30)+'</g>')
def accepted():
    return (ground()+star(20,30,6,'#e6b94a')+star(166,16,4.5,'#e6b94a')+'<circle cx="24" cy="12" r="1.800" fill="#b8483a"/>'
        '<rect x="6" y="46" width="172" height="76" rx="8" fill="#d9c7a6" stroke="#cdb48a" stroke-width="2"/>'
        +sprig(148,54,168,30)+sprig(148,54,174,44,n=2)+berry(154,45,3.6)
        +'<rect x="38" y="6.500" width="108" height="84" rx="6" fill="#3c1e0a" opacity="0.1"/>'
        '<rect x="38" y="4" width="108" height="84" rx="6" fill="#fffdf9" stroke="#cdb48a" stroke-width="2"/>'
        '<rect x="45" y="11" width="94" height="70" rx="3" stroke="#b8483a" stroke-width="1.200" stroke-dasharray="3 4" opacity="0.5"/>'
        +badge(92,34,15)+'<path d="M68 60h48" stroke="#dccbad" stroke-width="3" stroke-linecap="round"/>'
        '<path d="M6 52 92 104 178 52v62a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8z" fill="url(#env-paper)" stroke="#cdb48a" stroke-width="2" stroke-linejoin="round"/>'
        '<path d="M16 66 92 112l76-46" stroke="#b8483a" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 5" opacity="0.65"/>')
def guests():
    def seat(cx,cy,r):
        return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#f7f2e9" stroke="{K}" stroke-width="2" stroke-dasharray="7 6"/>'
            f'<circle cx="{cx}" cy="{cy-r*0.22:.1f}" r="{r*0.3:.1f}" fill="#e9dcc5"/><path d="M{cx-r*0.55:.1f} {cy+r*0.62:.1f}a{r*0.55:.1f} {r*0.5:.1f} 0 0 1 {r*1.1:.1f} 0z" fill="#e9dcc5"/>')
    return (ground(0.08,78)+star(24,24,5,'#e9dcc5')+star(160,22,6,'#e6b94a')+'<circle cx="146" cy="38" r="1.800" fill="#b8483a"/>'
        +seat(40,80,22)+seat(144,80,22)
        +'<circle cx="92" cy="68.500" r="30" fill="#3c1e0a" opacity="0.1"/><circle cx="92" cy="66" r="30" fill="#fffdf9" stroke="#cdb48a" stroke-width="2"/>'
        '<circle cx="92" cy="66" r="23" stroke="#b8483a" stroke-width="1.200" stroke-dasharray="3 4" opacity="0.5"/>'
        '<path d="M92 54v24M80 66h24" stroke="#b8483a" stroke-width="4.500" stroke-linecap="round"/>'
        +sprig(112,98,134,112,n=2,L=6)+berry(116,104,3.4))
def welcome():
    return (ground(0.1,80)+star(22,40,6,'#e6b94a')+star(164,34,4.5,'#e6b94a')+'<circle cx="40" cy="22" r="1.800" fill="#b8483a"/>'
        +sprig(84,70,66,46)+sprig(84,70,98,44,n=2)+berry(78,58,3.8)
        +parcel(66,70,52,48)+parcel(30,88,34,30,'#2f613f',False)+parcel(124,92,32,26,'#b8483a',False)+badge(126,60,17))
KINDS.update({'tag':tag,'accepted':accepted,'guests':guests,'welcome':welcome})

def wreath():
    import math
    cx,cy,R=92,60,34; s=''
    for i in range(14):
        a=2*math.pi*i/14; b=a+0.62
        x0,y0=cx+R*math.cos(a),cy+R*math.sin(a); x1,y1=cx+(R+7)*math.cos(b),cy+(R+7)*math.sin(b)
        s+=sprig(round(x0,1),round(y0,1),round(x1,1),round(y1,1),n=2,L=6,color='#2f613f' if i%2 else '#274e34')
    for i in range(9):
        a=2*math.pi*(i+0.5)/9; b=a+0.7
        s+=sprig(round(cx+R*math.cos(a),1),round(cy+R*math.sin(a),1),round(cx+(R-6)*math.cos(b),1),round(cy+(R-6)*math.sin(b),1),n=1,L=5,color='#2f613f')
    for i,(c,r) in enumerate([('#e6b94a',3.8),('#b8483a',3.2),('#d9a93a',3.4),('#b8483a',3.6),('#e6b94a',3.2)]):
        a=-2.6+i*1.05; s+=berry(round(cx+(R+1)*math.cos(a),1),round(cy+(R+1)*math.sin(a),1),r,c)
    bow=(f'<path d="M92 {cy+R}c-10-12-24-12-24-2s14 10 24 2z" fill="#b8483a" stroke="#8a2f27" stroke-width="1.200"/><path d="M92 {cy+R}c10-12 24-12 24-2s-14 10-24 2z" fill="#b8483a" stroke="#8a2f27" stroke-width="1.200"/>'
         f'<path d="M90 {cy+R+2}l-8 18 7-3 3 6 3-18zM94 {cy+R+2}l8 18-7-3-3 6-3-18z" fill="#a43a2f"/>')
    return (ground(0.1,60)+star(26,26,6,'#e6b94a')+star(160,34,4.5,'#e6b94a')+'<circle cx="150" cy="16" r="1.800" fill="#b8483a"/>'
        +f'<circle cx="{cx}" cy="{cy}" r="{R}" stroke="#274e34" stroke-width="5"/>'+s+bow+wax(92,cy+R+1,7))
KINDS['wreath']=wreath
