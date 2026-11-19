# Les icônes en autocollant dégradé (Julien, 19 novembre 2026 ; README 23.5, lot 23 bis du plan).
# Appelé par habiller.py : tuiles() avant l'habillage, autocollant() après.
import re
# Personne : rond, dégradé doux (blanc en haut à gauche, pastel, teinte soutenue en bas à droite), liseré blanc, ombre portée.
# Liste : carré arrondi, dégradé du pastel à la teinte soutenue, même liseré, même ombre, penché de 3 degrés.
TON={'corail':('#ffd0c8','#ff8478'),'menthe':('#c6f1e2','#4fcaa3'),'citron':('#ffe9a8','#f4b82e'),'peche':('#ffe2c4','#f2a65a'),'ciel':('#cfe6ff','#6eb0f2'),'lilas':('#e6d6f8','#b993dd')}
RING={bg:rg for bg,rg in TON.values()}
# les six couleurs de liste d'origine -> les six teintes
LTON={'274e34':'menthe','a43a2f':'corail','e6b94a':'citron','5b3a55':'lilas','2c4a63':'ciel','b89565':'peche'}
def lisere(sz): return max(2,round(sz*0.05))
def ombre(sz): return '0 3px 8px rgba(90, 40, 60, 0.22)' if sz>=36 else '0 2px 5px rgba(90, 40, 60, 0.2)'
def tuiles(h):
    # avant l'habillage : on marque les tuiles de liste, l'habillage ne doit pas toucher à leurs coins ni à leurs couleurs
    LCX='|'.join(LTON)
    h=re.sub(r'width: (\d+)px; height: \1px; border-radius: \d+px; background: #(%s); box-shadow: 0 2px 6px rgba\(60, 30, 10, 0\.18\)'%LCX,
             lambda m:f'width: {m.group(1)}px; height: {m.group(1)}px; @@TILE:{m.group(1)}:{LTON[m.group(2)]}@@',h)
    # le panneau d'icône : la tuile choisie et les pastilles de couleur, à plat (dégradé seul)
    h=re.sub(r'(width: (\d+)px; height: \2px;(?: padding: 0; border: 0;)?) border-radius: \d+px; background: #(%s); box-shadow: (none|0 0 0 2px #fffdf9, 0 0 0 4px #b8483a)'%LCX,
             lambda m:f'{m.group(1)} @@SW:{m.group(2)}:{LTON[m.group(3)]}@@; box-shadow: {m.group(4)}',h)
    return h
def autocollant(h):
    def tl(m):
        sz=int(m.group(2)); bg,rg=TON[m.group(3)]; g=f'border-radius: {round(sz*0.3)}px; background: linear-gradient(150deg, {bg} 0%, {rg} 110%)'
        return g if m.group(1)=='SW' else g+f'; box-shadow: 0 0 0 {lisere(sz)}px #ffffff, {ombre(sz)}; transform: rotate(-3deg)'
    h=re.sub(r'@@(TILE|SW):(\d+):(\w+)@@',tl,h)
    def one(m):
        st=m.group(1)
        if 'border-radius: 50%' not in st: return m.group(0)
        b=re.search(r'background: (#[0-9a-f]{6})\b',st); w=re.search(r'(?:^|; )width: (\d+)px',st)
        if not b or b.group(1) not in RING or not w or int(w.group(1))<20: return m.group(0)
        bg=b.group(1); rg=RING[bg]; sz=int(w.group(1))
        st=st.replace('background: '+bg,f'background: linear-gradient(150deg, #ffffff 0%, {bg} 42%, {rg} 135%)',1)
        a=f'box-shadow: 0 0 0 1px {rg}'
        if 'font-size' not in st and sz<=32: st=st.replace(a,'box-shadow: none',1)                     # une pastille de couleur : le dégradé seul
        elif a+',' in st: st=st.replace(a+',',f'box-shadow: 0 0 0 {lisere(sz)}px #ffffff,',1)           # une ombre est déjà là
        else: st=st.replace(a,f'box-shadow: 0 0 0 {lisere(sz)}px #ffffff, {ombre(sz)}',1)
        st=re.sub(r'(0 0 0 2px #ffffff), 0 0 0 3px %s'%rg,r'\1',st)                                  # les icônes qui se chevauchent : le liseré seul
        return 'style="'+st+'"'
    return re.sub(r'style="([^"]*)"',one,h)
