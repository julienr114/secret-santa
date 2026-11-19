import math
def seal_path(cx,cy,r,amp=1.5,n=10):
    pts=[]
    for i in range(120):
        t=2*math.pi*i/120; rr=r+amp*math.cos(n*t)
        pts.append(f'{cx+rr*math.cos(t):.1f} {cy+rr*math.sin(t):.1f}')
    return 'M'+'L'.join(pts)+'z'
def star(cx,cy,R,fill):
    k=R*0.23
    return f'<path d="M{cx} {cy-R}l{k:.1f} {R-k:.1f} {R-k:.1f} {k:.1f}-{R-k:.1f} {k:.1f}-{k:.1f} {R-k:.1f}-{k:.1f}-{R-k:.1f}-{R-k:.1f}-{k:.1f} {R-k:.1f}-{k:.1f}z" fill="{fill}"/>'
def sprig(x0,y0,x1,y1,n=3,L=7,color='#2f613f',w=2.2):
    dx,dy=x1-x0,y1-y0; ln=math.hypot(dx,dy); ux,uy=dx/ln,dy/ln; px,py=-uy,ux
    d=f'M{x0:.1f} {y0:.1f}L{x1:.1f} {y1:.1f}'
    for i in range(n):
        t=(i+1)/(n+1.3); bx,by=x0+dx*t,y0+dy*t
        for s in (1,-1):
            ex,ey=bx+(ux*0.6+px*s*0.8)*L,by+(uy*0.6+py*s*0.8)*L
            d+=f'M{bx:.1f} {by:.1f}L{ex:.1f} {ey:.1f}'
    return f'<path d="{d}" stroke="{color}" stroke-width="{w}" stroke-linecap="round"/>'
def berry(cx,cy,r,fill='#e6b94a'):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}"/><circle cx="{cx-r*0.3:.1f}" cy="{cy-r*0.3:.1f}" r="{r*0.28:.1f}" fill="#ffffff" opacity="0.6"/>'
DEFS='''<defs><linearGradient id="env-paper" x1="0" y1="14" x2="0" y2="120" gradientUnits="userSpaceOnUse"><stop stop-color="#efe3cd"/><stop offset="1" stop-color="#e2d2b4"/></linearGradient><linearGradient id="env-flap" x1="0" y1="18" x2="0" y2="78" gradientUnits="userSpaceOnUse"><stop stop-color="#f8f1e3"/><stop offset="1" stop-color="#efe4cf"/></linearGradient></defs>'''
def ground(op=0.1,rx=76): return f'<ellipse cx="92" cy="123" rx="{rx}" ry="4" fill="#3c1e0a" opacity="{op}"/>'
BODY='''<rect x="6" y="14" width="172" height="106" rx="8" fill="url(#env-paper)" stroke="#cdb48a" stroke-width="2"/>
<path d="M8 117 70 66q22 17 44 0l62 51z" fill="#d9c7a6" opacity="0.35"/>
<path d="M7 116 70 66M177 116 114 66" stroke="#cdb48a" stroke-width="2" stroke-linecap="round"/>
<path d="M8 21 84 77a13 13 0 0 0 16 0l76-56" fill="#3c1e0a" opacity="0.08"/>
<path d="M8 18 84 74a13 13 0 0 0 16 0l76-56" fill="url(#env-flap)" stroke="#cdb48a" stroke-width="2" stroke-linejoin="round"/>
<path d="M24 23 86 68.500a10 10 0 0 0 12 0L160 23" stroke="#b8483a" stroke-width="1.500" stroke-linecap="round" stroke-dasharray="4 5" opacity="0.65"/>'''
def wax(cx,cy,r=22):
    s=seal_path(cx,cy,r,amp=r*0.07)
    return (f'<path d="{s}" fill="#3c1e0a" opacity="0.16" transform="translate(0 2.500)"/><path d="{s}" fill="#b8483a"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r*0.7:.1f}" fill="#a43a2f" stroke="#8a2f27" stroke-width="1.200"/>'
            f'<path d="M{cx-r*0.77:.1f} {cy-r*0.36:.1f}a{r*0.86:.1f} {r*0.86:.1f} 0 0 1 {r*0.5:.1f}-{r*0.45:.1f}" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.28"/>'
            +star(cx,cy,r*0.5,'#f9eecb'))
def closed():
    return (ground()+star(20,7,6,'#e6b94a')+star(164,6,4.5,'#e6b94a')+'<circle cx="150" cy="8" r="1.800" fill="#b8483a"/>'+BODY
        +sprig(104,68,134,47)+sprig(104,68,141,65)+wax(92,78)+berry(110,58,4.2)+berry(117.5,63.5,3.4,'#d9a93a'))
def waiting():
    t=''.join(f'<path d="M{92+15.5*math.cos(a):.1f} {78+15.5*math.sin(a):.1f}L{92+18*math.cos(a):.1f} {78+18*math.sin(a):.1f}"/>' for a in [i*math.pi/2 for i in range(4)])
    return (ground(0.06)+'<rect x="6" y="14" width="172" height="106" rx="8" fill="#f7f2e9" stroke="#cdb48a" stroke-width="2" stroke-dasharray="7 6"/>'
        '<path d="M7 116 70 66M177 116 114 66" stroke="#dccbad" stroke-width="2" stroke-linecap="round" stroke-dasharray="7 6"/>'
        '<path d="M8 18 84 74a13 13 0 0 0 16 0l76-56" stroke="#cdb48a" stroke-width="2" stroke-linejoin="round" stroke-dasharray="7 6"/>'
        '<circle cx="92" cy="80.500" r="23" fill="#3c1e0a" opacity="0.1"/><circle cx="92" cy="78" r="23" fill="#fffdf9" stroke="#cdb48a" stroke-width="2"/>'
        f'<g stroke="#cdb48a" stroke-width="2" stroke-linecap="round">{t}</g>'
        '<path d="M92 67v11l7.500 4.500" stroke="#94651c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="92" cy="78" r="2" fill="#94651c"/>'
        +star(22,7,5,'#e9dcc5')+star(162,7,4,'#e9dcc5'))
def opened():
    return (ground()+star(20,30,6,'#e6b94a')+star(166,16,4.5,'#e6b94a')+'<circle cx="24" cy="12" r="1.800" fill="#b8483a"/>'
        '<rect x="6" y="46" width="172" height="76" rx="8" fill="#d9c7a6" stroke="#cdb48a" stroke-width="2"/>'
        +sprig(148,54,168,30)+sprig(148,54,174,44,n=2)+berry(154,45,3.6)
        +'<rect x="38" y="6.500" width="108" height="84" rx="6" fill="#3c1e0a" opacity="0.1"/>'
        '<rect x="38" y="4" width="108" height="84" rx="6" fill="#fffdf9" stroke="#cdb48a" stroke-width="2"/>'
        '<rect x="45" y="11" width="94" height="70" rx="3" stroke="#b8483a" stroke-width="1.200" stroke-dasharray="3 4" opacity="0.5"/>'
        +star(92,26,10,'#b8483a')+'<path d="M64 44h56M74 53h36" stroke="#dccbad" stroke-width="3" stroke-linecap="round"/>'
        '<path d="M6 52 92 104 178 52v62a8 8 0 0 1-8 8H14a8 8 0 0 1-8-8z" fill="url(#env-paper)" stroke="#cdb48a" stroke-width="2" stroke-linejoin="round"/>'
        '<path d="M16 66 92 112l76-46" stroke="#b8483a" stroke-width="1.500" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 5" opacity="0.65"/>')
def locked():
    return (ground()+BODY+'<circle cx="92" cy="80.500" r="24" fill="#3c1e0a" opacity="0.12"/><circle cx="92" cy="78" r="24" fill="#fffdf9" stroke="#cdb48a" stroke-width="2"/>'
        '<path d="M85.500 76v-5a6.500 6.500 0 0 1 13 0v5" stroke="#57534e" stroke-width="3" stroke-linecap="round"/>'
        '<rect x="81" y="75" width="22" height="16.500" rx="3.500" fill="#57534e"/><circle cx="92" cy="81.500" r="2.200" fill="#fffdf9"/><path d="M92 82.500v4" stroke="#fffdf9" stroke-width="1.800" stroke-linecap="round"/>')
def sent():
    return (ground()+star(20,7,6,'#e6b94a')+star(118,7,4,'#e6b94a')+BODY
        +'<circle cx="150" cy="28.500" r="20" fill="#3c1e0a" opacity="0.16"/><circle cx="150" cy="26" r="20" fill="#2f613f"/>'
        '<path d="M135 20a16 16 0 0 1 9-8" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.28"/>'
        '<path d="m141 26 6 6 12-12" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>')
def podium():
    def block(x,y,w,h,fill): return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{fill}" stroke="#cdb48a" stroke-width="2"/>'
        f'<path d="M{x+3} {y+7}h{w-6}" stroke="#fffdf9" stroke-width="3" stroke-linecap="round" opacity="0.7"/>')
    return (ground(0.1,80)+block(22,76,46,46,'url(#env-flap)')+block(116,88,46,34,'url(#env-flap)')+block(68,54,48,68,'url(#env-paper)')
        +'<path d="M88.500 84l5-4v20M88 100h11" stroke="#b8483a" stroke-width="3.500" stroke-linecap="round" stroke-linejoin="round"/>'
        '<path d="M40 97a5 5 0 1 1 9 3l-9 9.500h10.500" stroke="#94651c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
        '<path d="M134.500 100h9l-5 5.500a4.300 4.300 0 1 1-4.500 5.500" stroke="#2f613f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'
        +sprig(80,40,62,24,n=3,L=6)+sprig(104,40,122,24,n=3,L=6)+wax(92,28,18)
        +star(45,60,8,'#e6b94a')+star(139,74,6.5,'#2f613f')
        +'<circle cx="54" cy="16" r="3" fill="#2f613f"/><circle cx="132" cy="12" r="3" fill="#e6b94a"/><circle cx="154" cy="42" r="2.500" fill="#b8483a"/><circle cx="28" cy="42" r="2.500" fill="#b8483a"/>'
        '<path d="M20 22l4 3M162 24l-4 3M150 60l3-4" stroke="#e6b94a" stroke-width="2.500" stroke-linecap="round"/>')
KINDS={'closed':closed,'waiting':waiting,'opened':opened,'locked':locked,'sent':sent,'podium':podium}
def svg(kind,w,indent='        '):
    h=round(w*128/184)
    body=(DEFS+'\n'+KINDS[kind]()).replace('\n','\n'+indent+'  ')
    return f'<svg aria-hidden="true" width="{w}" height="{h}" viewBox="0 0 184 128" fill="none">\n{indent}  {body}\n{indent}</svg>'
if __name__=='__main__':
    import subprocess
    for k in KINDS:
        open(f'/tmp/il_{k}.svg','w').write(svg(k,368).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" '))
        subprocess.run(['rsvg-convert','-b','#fffdf9',f'/tmp/il_{k}.svg','-o',f'/tmp/il_{k}.png'],check=True)
    subprocess.run('cd /tmp && convert il_closed.png il_waiting.png il_opened.png +append r1.png && convert il_locked.png il_sent.png il_podium.png +append r2.png && convert r1.png r2.png -append illus.png',shell=True,check=True)
