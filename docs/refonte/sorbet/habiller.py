# Habille les maquettes en « Sorbet » (décidé par Julien le 19 novembre 2026, README 23.5, lot 23).
# Lit docs/refonte/maquettes/*.html (l'ancien style, qui reste la source) et écrit docs/refonte/maquettes-sorbet/*.html.
# À relancer après tout changement d'une maquette : python3 docs/refonte/sorbet/habiller.py
# Ce fichier est aussi la référence des valeurs : la palette (dictionnaire t), ce que devient chaque ancienne teinte
# (S pour les fonds et les bords, T pour les textes), les coins (t['radius']), les couleurs d'avatar (AV),
# le lilas des alertes (journal), les couleurs du palmarès en images, et l'écran de chaque illustration (essais).
import re,os,sys
HERE=os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0,HERE)
SRC=os.path.join(HERE,'..','maquettes'); OUT=os.path.join(HERE,'..','maquettes-sorbet'); os.makedirs(OUT,exist_ok=True)
import illus,illus2
import json
TH={
'Givre':dict(label='Givre · clair et net',fonts='family=Plus+Jakarta+Sans:wght@400;500;600;700;800',display="'Plus Jakarta Sans', system-ui, sans-serif",body="'Plus Jakarta Sans', system-ui, sans-serif",
  ink='#0f172a',muted='#475569',faint='#64748b',accentText='#c2333a',onAccent='#ffffff',successText='#116149',goldText='#7a4d00',
  page='#f4f6f8',card='#ffffff',soft='#eef1f4',line='#e3e7ec',lineStrong='#cbd2da',primary='#e5484d',primaryDark='#c2333a',accentSoft='#fde8e8',success='#1a7f5a',successSoft='#e3f4ec',gold='#f5b83d',goldSoft='#fdf1d3',dark='#0f172a',
  radius={'16px':'20px','6px':'12px','10px':'12px','12px':'14px'},shadow='0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)'),
'Nuit':dict(label='Nuit de Noël · sombre et doré',fonts='family=Sora:wght@400;600;700&family=Inter:wght@400;500;600;700',display="'Sora', system-ui, sans-serif",body="'Inter', system-ui, sans-serif",
  ink='#f4f1ea',muted='#a9b4c0',faint='#8593a1',accentText='#f0c866',onAccent='#1a1408',successText='#6fd0a1',goldText='#f0c866',
  page='#0f1419',card='#1a2129',soft='#232c36',line='#2c3743',lineStrong='#3d4a59',primary='#e5b84c',primaryDark='#c99a2e',accentSoft='#3a2f14',success='#3fae7c',successSoft='#173326',gold='#e5b84c',goldSoft='#3a2f14',dark='#f4f1ea',
  radius={'16px':'18px','6px':'10px','10px':'10px','12px':'12px'},shadow='0 0 0 1px #2c3743'),
'Sorbet':dict(label='Sorbet · rond et joyeux',fonts='family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700',display="'Outfit', system-ui, sans-serif",body="'DM Sans', system-ui, sans-serif",
  ink='#2b1b3d',muted='#6b5a7a',faint='#8a7a98',accentText='#d93a2b',onAccent='#ffffff',successText='#0b7a5b',goldText='#7a5200',
  page='#fff6f1',card='#ffffff',soft='#ffeae1',line='#ffd9cc',lineStrong='#f5b8a5',primary='#ff5c4d',primaryDark='#d93a2b',accentSoft='#ffe3de',success='#12a37a',successSoft='#dcf7ee',gold='#ffc94a',goldSoft='#fff1c9',dark='#2b1b3d',
  radius={'16px':'28px','6px':'16px','10px':'16px','12px':'18px'},shadow='0 3px 0 #ffd9cc, 0 0 0 1.5px #ffd9cc'),
'Papier':dict(label='Papier · éditorial, noir et blanc',fonts='family=Newsreader:opsz,wght@6..72,500;6..72,600;6..72,700&family=Inter:wght@400;500;600;700',display="'Newsreader', Georgia, serif",body="'Inter', system-ui, sans-serif",
  ink='#111111',muted='#555555',faint='#777777',accentText='#c8321e',onAccent='#ffffff',successText='#1f6b45',goldText='#6b4e00',
  page='#ffffff',card='#ffffff',soft='#f4f4f2',line='#e4e4e0',lineStrong='#bdbdb7',primary='#111111',primaryDark='#000000',accentSoft='#f6e6e2',success='#1f6b45',successSoft='#e6f1ea',gold='#e9c46a',goldSoft='#faf1d6',dark='#111111',
  radius={'16px':'4px','6px':'2px','10px':'4px','12px':'4px'},shadow='0 0 0 1px #d6d6d0'),
'Sapin':dict(label='Sapin · vert profond, moderne',fonts='family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700&family=Inter:wght@400;500;600;700',display="'Bricolage Grotesque', system-ui, sans-serif",body="'Inter', system-ui, sans-serif",
  ink='#14251b',muted='#4a5d50',faint='#6b7d70',accentText='#166534',onAccent='#ffffff',successText='#0f766e',goldText='#6f4e00',
  page='#f3f5f0',card='#ffffff',soft='#e8eee6',line='#d9e2d6',lineStrong='#b3c4b0',primary='#166534',primaryDark='#114d28',accentSoft='#dcefe1',success='#0f766e',successSoft='#d5f1ee',gold='#e9b949',goldSoft='#fbefcf',dark='#14251b',
  radius={'16px':'16px','6px':'10px','10px':'12px','12px':'12px'},shadow='0 1px 2px rgba(20, 37, 27, 0.06), 0 6px 18px rgba(20, 37, 27, 0.06)'),
}
T={'292524':'ink','3c1e0a':'ink','57534e':'muted','78716c':'faint','cdb48a':'faint','dccbad':'faint','a43a2f':'accentText','8a2f27':'accentText','b8483a':'accentText','702a24':'accentText','ffffff':'onAccent','fffdf9':'onAccent','2f613f':'successText','274e34':'successText','223f2d':'successText','79511d':'goldText','66431d':'goldText','e6b94a':'gold'}
S={'f7f2e9':'page','fffdf9':'card','ffffff':'card','f1e8d8':'soft','efe3cd':'soft','efe4cf':'soft','f8f1e3':'soft','ecdfc6':'soft','e9dcc5':'line','dccbad':'line','e2d2b4':'line','d9c7a6':'line','cdb48a':'lineStrong','b8483a':'primary','a43a2f':'primary','e09e92':'primary','8a2f27':'primaryDark','702a24':'primaryDark','f6e2dd':'accentSoft','fbf3f1':'accentSoft','f3d3cc':'accentSoft','2f613f':'success','274e34':'success','223f2d':'success','8db898':'success','dbe9dd':'successSoft','f0f6f1':'successSoft','cfe2d3':'successSoft','e6b94a':'gold','d9a93a':'gold','d9a62e':'gold','f6e3ad':'goldSoft','f9eecb':'goldSoft','fdf8ea':'goldSoft','292524':'dark','3c1e0a':'dark','57534e':'muted','78716c':'faint','79511d':'goldText','66431d':'goldText'}
HEX=re.compile(r'#([0-9a-fA-F]{6})\b')
SH='0 1px 2px rgba(60, 30, 10, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)'
TEXTP={'color','fill','stroke','caret-color','text-decoration-color'}
def skin(html,t):
    html=html.replace(SH,'@@SHADOW@@')
    def col(m,mp): 
        k=m.group(1).lower(); return t[mp[k]] if k in mp else m.group(0)
    def decl(m):
        prop,val=m.group(1),m.group(2)
        if prop=='border-radius':
            v=val.strip(); return f'{prop}: {t["radius"].get(v,v)}'
        mp=T if prop in TEXTP else S
        return prop+':'+HEX.sub(lambda x:col(x,mp),val)
    html=re.sub(r'\b(color|fill|stroke|caret-color|text-decoration-color|background|background-color|border|border-top|border-bottom|border-left|border-right|border-color|box-shadow|accent-color|outline|border-radius)\s*:([^;"{}]+)',decl,html)
    html=re.sub(r'\b(fill|stroke|stop-color)="#([0-9a-fA-F]{6})"',lambda m:f'{m.group(1)}="{t[S[m.group(2).lower()]] if m.group(2).lower() in S else "#"+m.group(2)}"',html)
    html=html.replace('@@SHADOW@@',t['shadow'])
    html=html.replace("'Fraunces', Georgia, serif",t['display']).replace("'Nunito', system-ui, sans-serif",t['body'])
    html=re.sub(r'family=Fraunces[^"]*?(?=&amp;display|&display)',t['fonts'].replace('&','&amp;') if '&amp;display' in html else t['fonts'],html)
    return html
t=dict(TH['Sorbet']); t.update(primary='#d93a2b',primaryDark='#b92d1f',accentText='#c93425',success='#0b7a5b',successText='#0b7a5b',faint='#796987',
  radius={'16px':'28px','6px':'16px','10px':'16px','12px':'18px','8px':'14px','5px':'8px','11px':'14px','7px':'10px','18px':'24px','14px':'18px','20px 20px 0 0':'32px 32px 0 0','16px 16px 16px 4px':'24px 24px 24px 6px'})
t.update(backdrop='#a8959d',backdropText='#6b5661')
# plus de jaune : tout ce qui signale passe au lilas (19 novembre 2026)
t.update(gold='#b993dd',goldSoft='#f1e8fc',goldText='#6a3db3',goldLine='#cbb2ee')
S.update({'a8a29e':'lineStrong','3d2c08':'ink','8f877b':'backdrop','ebc762':'goldLine','d99a1c':'gold','ecd38a':'gold','fbf0cf':'goldSoft','e3d5bb':'line','efe6d6':'soft','f8f1e5':'soft','fbf6ec':'soft','b89a63':'lineStrong','a8916a':'lineStrong','a9cdb2':'success','fbeeea':'accentSoft','e0b4ab':'lineStrong','5b430f':'goldText','1f3d29':'successText'})
T.update({'a8a29e':'faint','3d2c08':'ink','5c554c':'backdropText','5b430f':'goldText','3a240c':'goldText','94651c':'goldText','1f3d29':'successText','a8916a':'faint','b89a63':'faint','ebc762':'gold'})
# les six couleurs d'avatar, refaites pour Sorbet : (fond, bord) d'origine -> (fond, bord)
AV={('f3d3cc','e09e92'):('ffd0c8','ff8478'),('cfe2d3','8db898'):('c6f1e2','4fcaa3'),('f6e3ad','e6b94a'):('ffe9a8','f4b82e'),('ecdfc6','cdb48a'):('ffe2c4','f2a65a'),('d6e6ef','94bbd0'):('cfe6ff','6eb0f2'),('ead2e2','c493b4'):('e6d6f8','b993dd')}
def avatars(h):
    def one(m):
        st=m.group(0)
        if 'border-radius: 50%' not in st: return st
        for (bg,bd),(nbg,nbd) in AV.items():
            if 'background: #'+bg in st: st=st.replace('#'+bg,'#'+nbg).replace('#'+bd,'#'+nbd)
        return st
    return re.sub(r'style="[^"]*"',one,h)
def journal(h):
    # l'entrée « le palmarès est arrivé » : vert plein, texte blanc
    def pal(m):
        b=m.group(0)
        if 'background: #f0f6f1; box-shadow: 0 0 0 1px #a9cdb2' not in b: return b
        return b.replace('background: #f0f6f1; box-shadow: 0 0 0 1px #a9cdb2','background: #0b7a5b; box-shadow: 0 3px 0 #075a43').replace('color: #223f2d','color: #ffffff').replace('color: #274e34','color: #ffffff').replace('color: #57534e','color: #d3f3e8')
    h=re.sub(r'<li style="display: flex; align-items: flex-start; gap: 12px">.*?</li>',pal,h,flags=re.S)
    # les alertes du journal : lilas au lieu du jaune
    if '#3a240c' in h:
        h=h.replace('background: #e6b94a; color: #3a240c','background: #7b4bc4; color: #ffffff')
        for x,y in [('#3a240c','#3b2463'),('background: #fdf8ea','background: #f1e8fc'),('#ebc762','#cbb2ee'),('#66431d','#6a3db3'),('#94651c','#6a3db3')]: h=h.replace(x,y)
    # le bandeau « Le tirage n'est plus secret » : même lilas
    if 'plus secret' in h:
        for x,y in [('background: #fbf0cf; color: #5b430f','background: #f1e8fc; color: #3b2463'),('background: #e6b94a; color: #3d2c08','background: #7b4bc4; color: #ffffff'),('color: #5b430f','color: #6a3db3')]: h=h.replace(x,y)
    return h
def essais(n,h):
    # illustrations dans le style des anciennes (19 novembre 2026), posées avant l'habillage : elles en prennent les couleurs
    def top(h,title,kind,w=184):
        k=h.index(title); a=h.rfind('<section',0,k); b=h.index('>',a)+1
        return h[:b]+'<div style="display: flex; justify-content: center; margin: -4px 0 0">'+illus2.svg(kind,w)+'</div>'+h[b:]
    def taller(h,d):
        m=re.search(r'width: 390px; height: (\d+)px',h); return h.replace(m.group(0),f'width: 390px; height: {int(m.group(1))+d}px',1)
    m=re.search(r'<svg role="img" aria-label="Under the Tree" width="64" height="64".*?</svg>',h,flags=re.S) if n.startswith('Connexion') else None
    if m:
        h=taller(h.replace(m.group(0),illus2.svg('connexion',200,'Under the Tree')),76)
    if n in ('Rejoindre.dc.html','RejoindreConnecte.dc.html'):
        m=re.search(r'<svg role="img" aria-label="Under the Tree" width="56" height="56".*?</svg>',h,flags=re.S); assert m,n
        h=h.replace(m.group(0),illus2.svg('wreath',168,'Under the Tree'))
    if n=='AccueilVide.dc.html':
        m=re.search(r'<h2 [^>]*>Aucun tirage pour l\'instant</h2>',h); assert m
        h=h.replace(m.group(0),'<div style="display: flex; justify-content: center; margin: -4px 0 4px">'+illus2.svg('empty',184)+'</div>'+m.group(0))
    if n=='ListesVide.dc.html':
        m=re.search(r'<span aria-hidden="true" style="width: 72px; height: 72px; border-radius: 18px;[^>]*>🎁</span>',h); assert m
        h=h.replace(m.group(0),illus2.svg('liste',184))
    if n=='PistesVide.dc.html': h=taller(top(h,'Six questions, trente secondes','tag'),150)
    if n=='AccueilDemandeAcceptee.dc.html': h=taller(top(h,'Ta demande est acceptée','accepted'),116)
    if n=='PreparerVide.dc.html': h=taller(top(h,'Ajoute les participants','guests'),150)
    if n=='RejoindreFait.dc.html':
        m=re.search(r'<span aria-hidden="true" style="width: 64px; height: 64px; border-radius: 50%; background: #dbe9dd;.*?</span>',h,flags=re.S); assert m
        h=h.replace(m.group(0),illus2.svg('welcome',184))
    # pas d'image dans les emails (Julien, 19 novembre 2026)
    return h
# les icônes en autocollant dégradé (lot 23 bis) : voir autocollant.py
from autocollant import tuiles,autocollant
done=0; soucis=[]
# les captures d'écran de la page de présentation (lot 32) : voir capture.py
import capture as _cap; _cap.OUT=OUT; capture=_cap.capture
avec=lambda f: '@@SHOT' in open(os.path.join(SRC,f),encoding='utf-8').read()
for f in sorted((x for x in os.listdir(SRC) if x.endswith('.html')),key=lambda x:(avec(x),x)):
    n=f[:-5]+'.dc.html'; h=open(os.path.join(SRC,f),encoding='utf-8').read()
    try:
        if n.startswith('DevineStory'):
            # le palmarès en images reste foncé : corail foncé, menthe foncée, violet, prune nuit
            _S,_T=dict(S),dict(T); S.clear(); T.clear()
            h=avatars(h)
            for x,y in [('#e6b94a','#5f37a6'),('#3d2c08','#ffffff'),('#66431d','#e6d6f8'),('#a43a2f','#b92d1f'),('#8a2f27','#c93425'),('#b8483a','#d93a2b'),
                        ('#274e34','#085a43'),('#cfe2d3','#c6f1e2'),('#5b3a55','#2b1b3d'),('#ead2e2','#e6d6f8'),('#fffdf9','#ffffff'),('#f7f2e9','#fff6f1'),
                        ('#dccbad','#ffd9cc'),('#292524','#2b1b3d'),('#57534e','#6b5a7a')]: h=h.replace(x,y)
            h=autocollant(skin(h,t)); S.update(_S); T.update(_T)
        else:
            h=autocollant(skin(tuiles(avatars(journal(essais(n,h)))),t).replace('rgba(60, 30, 10,','rgba(90, 40, 60,'))
        h=re.sub(r'@@SHOT:(\w+):(\d+):(\d+)(?::(\w))?@@',capture,h)
    except Exception as e:
        soucis.append((f,repr(e))); continue
    open(os.path.join(OUT,f),'w',encoding='utf-8').write(h); done+=1
print(done,'maquettes habillées dans',os.path.normpath(OUT))
for f,e in soucis: print('non habillée :',f,e)
