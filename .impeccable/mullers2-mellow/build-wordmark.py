"""Offline wordmark export: pip install fonttools uharfbuzz; run from repo root."""
from pathlib import Path
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
font_path=Path('mullers2-wellness/mellow/assets/pinyon-script.ttf')
font=TTFont(font_path)
glyphs=font.getGlyphSet()
face=hb.Face(font_path.read_bytes())
hfont=hb.Font(face)
hfont.scale=(face.upem,face.upem)
buf=hb.Buffer()
buf.add_str('Müllers 2')
buf.guess_segment_properties()
hb.shape(hfont,buf)
paths=[]
boxes=[]
x=y=0
for info,pos in zip(buf.glyph_infos,buf.glyph_positions):
    glyph=glyphs[font.getGlyphName(info.codepoint)]
    transform=(1,0,0,1,x+pos.x_offset,y+pos.y_offset)
    pen=SVGPathPen(glyphs)
    glyph.draw(TransformPen(pen,transform))
    paths.append(pen.getCommands())
    bounds=BoundsPen(glyphs)
    glyph.draw(TransformPen(bounds,transform))
    if bounds.bounds: boxes.append(bounds.bounds)
    x+=pos.x_advance
    y+=pos.y_advance
xmin=min(b[0] for b in boxes); ymin=min(b[1] for b in boxes)
xmax=max(b[2] for b in boxes); ymax=max(b[3] for b in boxes)
pad=face.upem*.025
w=xmax-xmin+pad*2; h=ymax-ymin+pad*2
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" role="img" aria-label="Müllers 2"><g fill="#30291f" transform="translate({pad-xmin:g} {pad+ymax:g}) scale(1 -1)">'
svg+=''.join(f'<path d="{d}"/>' for d in paths if d)+'</g></svg>\n'
Path('mullers2-wellness/mellow/assets/mullers-2-wordmark.svg').write_text(svg)
print('Ink-complete wordmark:',w,h,'font units')
