# Une « capture d'écran » de la page de présentation (lot 32) : une maquette déjà habillée, réduite dans un téléphone dessiné en CSS.
# Dans la source d'une maquette : @@SHOT:Nom:largeur:hauteur:inclinaison@@. habiller.py règle OUT puis appelle capture().
import re,os
OUT=''
# l'inclinaison : R = en perspective, tournée vers la droite ; L = vers la gauche ; r, l = à peine penchée ; 0 = droite
TILT={'R':('rotateY(16deg) rotateX(5deg) rotateZ(-2deg)',-20),'L':('rotateY(-16deg) rotateX(5deg) rotateZ(2deg)',20),'r':('rotate(3deg)',0),'l':('rotate(-3deg)',0),'0':('none',0)}
def capture(m):
    # un vrai téléphone plutôt qu'un cadre : tranche en métal, boutons, bord noir, barre d'état, encoche, reflet, ombres en couches
    n,w,hh=m.group(1),int(m.group(2)),int(m.group(3)); tr,dx=TILT[m.group(4) or '0']; src=open(os.path.join(OUT,n+'.html'),encoding='utf-8').read()
    body=src[src.index('<div style="width: 390px'):src.index('</x-dc>')]; k=w/390
    bg=re.search(r'background: (#[0-9a-f]{6})',body).group(1); r_,g_,b_=(int(bg[i:i+2],16) for i in (1,3,5)); dark=(0.299*r_+0.587*g_+0.114*b_)<128
    ink='#ffffff' if dark else '#2b1b3d'
    R=round(w*0.19); sb=round(w*0.118); fs=round(w*0.05)
    bars=f'<svg width="{round(fs*1.5)}" height="{fs}" viewBox="0 0 18 12" fill="{ink}"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.500" width="3" height="6.500" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>'
    batt=f'<svg width="{round(fs*2.1)}" height="{fs}" viewBox="0 0 26 12" fill="none"><rect x="0.500" y="0.500" width="22" height="11" rx="3.500" stroke="{ink}" opacity="0.45"/><rect x="2" y="2" width="16" height="8" rx="2" fill="{ink}"/><rect x="23.500" y="4" width="2" height="4" rx="1" fill="{ink}" opacity="0.45"/></svg>'
    btn=lambda side,top,h: f'<span style="position: absolute; {side}: -3px; top: {top}%; width: 3px; height: {h}px; border-radius: {"2px 0 0 2px" if side=="left" else "0 2px 2px 0"}; background: linear-gradient({"90deg" if side=="left" else "270deg"}, #1a1026, #5d4b70)"></span>'
    return (f'<div aria-hidden="true" inert style="flex-shrink: 0; perspective: 1600px">'
      f'<div style="position: relative; padding: 3px; border-radius: {R}px; background: linear-gradient(140deg, #8c7a9e 0%, #3a2a4c 22%, #1a1026 55%, #6d5b80 100%); '
      f'box-shadow: 0 1px 2px rgba(43, 27, 61, 0.3), {dx}px 34px 60px -18px rgba(90, 40, 60, 0.45), {dx//2}px 14px 24px -10px rgba(43, 27, 61, 0.28); transform: {tr}">'
      f'{btn("left",17,round(w*0.07))}{btn("left",26,round(w*0.12))}{btn("left",37,round(w*0.12))}{btn("right",29,round(w*0.19))}'
      f'<div style="padding: {round(w*0.028)}px; border-radius: {R-3}px; background: #0d0614; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08)">'
      f'<div style="position: relative; width: {w}px; height: {hh}px; overflow: hidden; border-radius: {R-3-round(w*0.028)}px; background: {bg}">'
      f'<div style="height: {sb}px; box-sizing: border-box; padding: {round(sb*0.18)}px {round(w*0.085)}px 0; display: flex; align-items: center; justify-content: space-between; font-family: \'DM Sans\', system-ui, sans-serif; font-weight: 700; font-size: {fs}px; line-height: 1; color: {ink}"><span>9:41</span><span style="display: flex; align-items: center; gap: {round(fs*0.4)}px">{bars}{batt}</span></div>'
      f'<div style="width: 390px; transform: scale({k:.4f}); transform-origin: 0 0; text-align: left">{body}</div>'
      f'<span style="position: absolute; top: {round(sb*0.26)}px; left: 50%; width: {round(w*0.3)}px; height: {round(sb*0.62)}px; margin-left: -{round(w*0.15)}px; border-radius: 999px; background: #0d0614"></span>'
      f'<span style="position: absolute; bottom: {round(w*0.025)}px; left: 50%; width: {round(w*0.36)}px; height: {max(3,round(w*0.016))}px; margin-left: -{round(w*0.18)}px; border-radius: 999px; background: {ink}; opacity: 0.35"></span>'
      f'<span style="position: absolute; inset: 0; background: linear-gradient(118deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 22%, rgba(255, 255, 255, 0) 38%); pointer-events: none"></span>'
      f'</div></div></div></div>')
