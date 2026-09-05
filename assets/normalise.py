"""
Normalisation des illustrations de la landing page.

Trois corrections, dans cet ordre :
  1. le fond opaque devient transparent (fill par composante connexe depuis les
     bords : un simple color-key aurait mangé les faces crème de l'objet, qui
     sont de la même couleur que le papier) ;
  2. les rouges et les verts sont recentrés sur les tokens du site en HSV — on
     déplace la TEINTE et on met la saturation/valeur à l'échelle, ce qui garde
     le grain riso au lieu de l'aplatir comme le ferait un remplacement ;
  3. l'encre est ramenée sur #1A1A18, avec un fondu vers 0 au-dessus de V=0.45
     pour ne pas toucher le papier.
Puis recadrage sur le contenu et remarge symétrique.
"""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
import os, sys

# Deux jeux de cibles : un par thème du site. Les illustrations sont de
# l'encre sombre sur fond transparent — sur le fond anthracite du mode sombre
# il ne resterait que le rouge flottant dans le noir. Chaque source produit
# donc DEUX fichiers, et les composants les permutent en `dark:`.
TARGET_RED   = (0xCE, 0x11, 0x26)
TARGET_GREEN = (0x00, 0x94, 0x60)
TARGET_INK   = (0x1A, 0x1A, 0x18)

# Tokens du bloc `.dark` de globals.css : --brand, --flag-green-ink, --text.
DARK_RED     = (0xF2, 0x45, 0x5A)
DARK_GREEN   = (0x4E, 0xC9, 0x8D)
DARK_INK     = (0xF5, 0xF4, 0xF0)

def to_hsv(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = a.max(-1); mn = a.min(-1); d = mx - mn
    h = np.zeros_like(mx); m = d > 1e-6
    i = (mx == r) & m; h[i] = ((g[i] - b[i]) / d[i]) % 6
    i = (mx == g) & m; h[i] = ((b[i] - r[i]) / d[i]) + 2
    i = (mx == b) & m; h[i] = ((r[i] - g[i]) / d[i]) + 4
    h = (h * 60) % 360
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0.0)
    return h, s, mx

def to_rgb(h, s, v):
    c = v * s; hp = (h % 360) / 60.0
    x = c * (1 - np.abs(hp % 2 - 1)); m = v - c
    z = np.zeros_like(c)
    out = np.stack([z, z, z], -1)
    conds = [(hp < 1, (c, x, z)), ((hp >= 1) & (hp < 2), (x, c, z)),
             ((hp >= 2) & (hp < 3), (z, c, x)), ((hp >= 3) & (hp < 4), (z, x, c)),
             ((hp >= 4) & (hp < 5), (x, z, c)), (hp >= 5, (c, z, x))]
    for cond, (rr, gg, bb) in conds:
        out[cond] = np.stack([rr, gg, bb], -1)[cond]
    return np.clip(out + m[..., None], 0, 1)

def strip_background(rgba, tol=30):
    """Fond = composante connexe de pixels proches de la couleur des bords."""
    rgb = rgba[..., :3].astype(np.float32)
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)
    close = np.sqrt(((rgb - bg) ** 2).sum(-1)) < tol
    lab, n = ndimage.label(close)
    edge_labels = set(lab[0]) | set(lab[-1]) | set(lab[:, 0]) | set(lab[:, -1])
    edge_labels.discard(0)
    mask = np.isin(lab, list(edge_labels))          # True = fond
    # poussière : le grain du papier laisse des îlots opaques de quelques
    # pixels dans le fond. Sans ce nettoyage ils survivent au détourage et,
    # surtout, ils faussent le recadrage — la boîte englobante s'accroche à une
    # tache de 5 px au lieu de l'objet.
    keep = ~mask
    lab2, n2 = ndimage.label(keep)
    if n2:
        sizes = np.bincount(lab2.ravel())
        small = np.isin(lab2, np.where(sizes < 40)[0])
        mask = mask | (keep & small)
    a = np.where(mask, 0, 255).astype(np.uint8)
    # 0.7px de fondu : sans lui le détourage laisse un escalier sur le trait
    a = np.array(Image.fromarray(a).filter(ImageFilter.GaussianBlur(0.7)))
    out = rgba.copy(); out[..., 3] = np.minimum(rgba[..., 3], a)
    return out, bg, mask.mean()

def recolour(rgba, report, targets=None, invert_ink=False):
    a = rgba[..., :3].astype(np.float32) / 255.0
    alpha = rgba[..., 3]
    h, s, v = to_hsv(a)
    vis = alpha > 40

    t_red, t_green, t_ink = targets or (TARGET_RED, TARGET_GREEN, TARGET_INK)

    for name, target, hue_lo, hue_hi in (
        ("rouge", t_red, 330, 25), ("vert", t_green, 90, 190)):
        th, ts, tv = to_hsv(np.array(target, np.float32) / 255.0)
        band = ((h >= hue_lo) | (h <= hue_hi)) if hue_lo > hue_hi else ((h >= hue_lo) & (h <= hue_hi))
        sel = vis & band & (s > 0.30) & (v > 0.15)
        if sel.sum() < 200:
            continue
        # moyennes de départ, mesurées sur les pixels bien saturés seulement
        core = sel & (s > 0.55)
        ref = core if core.sum() > 200 else sel
        h0 = np.degrees(np.arctan2(np.sin(np.radians(h[ref])).mean(),
                                   np.cos(np.radians(h[ref])).mean())) % 360
        s0, v0 = s[ref].mean(), v[ref].mean()
        dh = ((float(th) - h0 + 180) % 360) - 180
        ks, kv = float(ts) / max(s0, 1e-3), float(tv) / max(v0, 1e-3)
        # le correctif s'atténue avec la saturation : les pixels d'anticrénelage
        # ne basculent pas d'un coup de teinte
        w = np.clip((s - 0.30) / 0.35, 0, 1)[sel]
        h[sel] = (h[sel] + dh * w) % 360
        s[sel] = np.clip(s[sel] * (1 + (ks - 1) * w), 0, 1)
        v[sel] = np.clip(v[sel] * (1 + (kv - 1) * w), 0, 1)
        report.append(f"    {name} : {s0:.2f}/{v0:.2f} → cible {float(ts):.2f}/{float(tv):.2f} "
                      f"({sel.sum()} px, rotation {dh:+.1f}°)")

    # encre : seuls les pixels neutres ET sombres, avec fondu vers le papier
    tv_ink = t_ink[0] / 255.0
    ink = vis & (s < 0.30) & (v < 0.45)
    if ink.sum() > 200:
        core = vis & (s < 0.30) & (v < 0.22)
        v0 = v[core].mean() if core.sum() > 200 else v[ink].mean()
        if invert_ink:
            # NÉGATIF, et pas une simple mise à l'échelle. Remonter V de 0,10 à
            # 0,96 revient à le multiplier par 9,6 : tout sature à 1, le grain
            # disparaît et les dégradés du chronographe gravé — ses masses
            # noires et ses reflets clairs — s'écrasent en un aplat. L'inversion
            # conserve les écarts internes : ce qui était le plus sombre devient
            # le plus clair, et l'ordre des valeurs entre les deux est gardé.
            w = np.clip((0.45 - v) / 0.25, 0, 1)[ink]
            inv = 1.0 - v[ink]
            k = tv_ink / max(1.0 - v0, 1e-3)
            v[ink] = np.clip(v[ink] * (1 - w) + inv * k * w, 0, 1)
        else:
            k = tv_ink / max(v0, 1e-3)
            w = np.clip((0.45 - v) / 0.25, 0, 1)[ink]
            v[ink] = np.clip(v[ink] * (1 + (k - 1) * w), 0, 1)
        report.append(f"    encre  : V {v0:.3f} → {tv_ink:.3f} ({ink.sum()} px)"
                      + ("  [négatif]" if invert_ink else ""))

    rgb = (to_rgb(h, s, v) * 255).round().astype(np.uint8)
    return np.dstack([rgb, alpha])

def paper_to_alpha(rgba, despeckle=False):
    """Le papier de l'illustration devient le papier de la PAGE.

    Deux des trois images n'ont aucun aplat clair : leurs formes sont des
    contours, et le crème du site passe au travers. La troisième arrivait avec
    ses faces peintes en #F6F2E9 — un crème plus jaune que le #FAFAF8 de la
    page. Posées côte à côte, deux illustrations imprimées sur le papier du
    site et une sur le sien. On vide donc les aplats clairs plutôt que de les
    repeindre : le rendu est le même sur le crème, mais il reste juste si le
    bloc change un jour de fond."""
    a = rgba.astype(np.float32)
    rgb, al = a[..., :3], a[..., 3]
    mx = rgb.max(-1); mn = rgb.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    v = mx / 255.0
    # rampe : opaque jusqu'à V=0.78, transparent à partir de 0.90. Les pixels
    # d'anticrénelage entre l'aplat et le trait prennent une valeur partielle,
    # sinon le détourage laisse un liseré clair le long de chaque trait.
    k = np.clip((v - 0.78) / 0.12, 0, 1) * np.clip((0.20 - sat) / 0.08, 0, 1)
    al = al * (1 - k)
    out = np.dstack([rgb, al]).round().astype(np.uint8)
    if despeckle:
        lab, n = ndimage.label(out[..., 3] > 12)
        if n:
            sizes = np.bincount(lab.ravel())
            drop = np.isin(lab, np.where(sizes < 40)[0]) & (lab > 0)
            out[..., 3][drop] = 0
    return out

def recentre(rgba, margin=0.08, square=True):
    alpha = rgba[..., 3]
    ys, xs = np.where(alpha > 12)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    crop = rgba[y0:y1, x0:x1]
    ch, cw = crop.shape[:2]
    side = max(ch, cw) if square else None
    W = int(round((side or cw) * (1 + 2 * margin)))
    H = int(round((side or ch) * (1 + 2 * margin)))
    out = np.zeros((H, W, 4), np.uint8)
    ox, oy = (W - cw) // 2, (H - ch) // 2
    out[oy:oy + ch, ox:ox + cw] = crop
    return out

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "illustrations")
DST = os.path.join(HERE, os.pardir, "public", "illustrations")
os.makedirs(DST, exist_ok=True)

# (source, sortie, carré, marge)
#
# La MARGE n'est pas la même partout, et c'est délibéré. Les trois marques de
# section sont simplement alignées à droite dans leur colonne : 8% de blanc
# autour du dessin leur donne de l'air, et personne ne peut voir où s'arrête
# leur boîte. Le chronographe, lui, se cale sous le logotype `.NET` et sous une
# colonne de valeurs alignées à droite : trois éléments au fer à droite juste
# au-dessus de lui font un axe visible, et 8% de vide dans son fichier
# décalaient son trait de 12px de cet axe. Sa boîte est donc calée sur son
# encre, et l'air éventuel devient une décision de CSS — pas une valeur cuite
# dans le PNG.
JOBS = [
    ("Stopwatch Illustration Sept 5 2026 (2).png", "stack.png",     True,  0.08),
    ("Stopwatch Illustration Sept 5 2026 (1).png", "livraison.png", True,  0.08),
    ("Stopwatch Illustration Sept 5 2026 (3).png", "contact.png",   True,  0.08),
    # `square=False` : c'est le seul dessin nettement plus haut que large
    # (323 x 363), et le forcer dans un carré lui aurait ajouté 20px de vide de
    # chaque côté — donc, à largeur d'affichage égale, un dessin plus petit que
    # les trois autres sans raison.
    ("timer.png",                                  "timer.png",     False, 0.015),
]

for src, dst, square, margin in JOBS:
    p = os.path.join(SRC, src)
    im = Image.open(p).convert("RGBA")
    arr = np.array(im)
    rep = [f"  {src}  ({im.width}x{im.height}, {os.path.getsize(p)//1024} KB)"]
    stripped = bool((arr[..., 3] > 250).all())
    if stripped:
        arr, bg, frac = strip_background(arr)
        rep.append(f"    fond #{int(bg[0]):02X}{int(bg[1]):02X}{int(bg[2]):02X} détouré "
                   f"({frac*100:.0f}% de la surface)")
    # ⚠️ LE PAPIER SE VIDE AVANT DE RECOLORER, PAS APRÈS.
    #
    # `paper_to_alpha` vide les pixels CLAIRS et peu saturés. Tant qu'on ne
    # produisait que la version claire, l'ordre n'avait aucune importance :
    # avant ou après, « clair » y désignait le papier. Il en a pris une, avec
    # la variante sombre : l'encre y devient claire par construction, et
    # appelée après l'inversion, l'étape effaçait le trait qu'elle venait de
    # peindre — il ne restait que les bavures d'anticrénelage, un dessin
    # rongé. Le papier se juge donc sur l'ORIGINAL, une seule fois, avant que
    # les valeurs ne bougent.
    before = (arr[..., 3] > 200).sum()
    arr = paper_to_alpha(arr, despeckle=stripped)
    after = (arr[..., 3] > 200).sum()
    if before - after > 1000:
        rep.append(f"    aplats clairs vidés : {before - after} px rendus au papier de la page")

    for suffixe, cibles, negatif in (
        ("", None, False),
        ("-dark", (DARK_RED, DARK_GREEN, DARK_INK), True),
    ):
      variante = recolour(arr.copy(), rep, targets=cibles, invert_ink=negatif)
      variante = recentre(variante, margin=margin, square=square)
      out = Image.fromarray(variante)
      dst_v = dst.replace(".png", f"{suffixe}.png")
    # Plafond de définition : au-delà de 1000 px on transporte du poids sans
    # gagner un pixel visible — le plus grand emploi prévu est ~360 px de CSS,
    # soit 720 px sur un écran retina.
      if max(out.size) > 1000:
        r = 1000 / max(out.size)
        out = out.resize((round(out.width * r), round(out.height * r)), Image.LANCZOS)
      o = os.path.join(DST, dst_v)
      out.save(o, optimize=True)
    # Le grain riso est du bruit : il ruine la compression PNG (1,5 Mo pour un
    # dessin à trois couleurs). Une palette de 128 entrées le rend lisible sans
    # bande visible, et divise le poids par cinq.
      if os.path.getsize(o) > 250_000:
        q = out.quantize(colors=128, method=Image.Quantize.FASTOCTREE)
        q.save(o, optimize=True)
      rep.append(f"    → {dst_v}  {out.width}x{out.height}, {os.path.getsize(o)//1024} KB")
    print("\n".join(rep)); print()
