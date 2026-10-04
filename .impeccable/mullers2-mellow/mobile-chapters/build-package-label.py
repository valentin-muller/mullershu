"""Typeset the reference bag's green packaging print, not a photo manipulation."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

HERE=Path(__file__).resolve().parent
FONT=Path('/System/Library/Fonts/Supplemental')
im=Image.new('RGBA',(1536,2048),(0,0,0,0))
d=ImageDraw.Draw(im)
green=(14,83,46,255)
d.rounded_rectangle((84,70,1452,1980),radius=100,outline=green,width=11)
def text(value,y,size=64,bold=False,sans=False):
    name='Arial Black.ttf' if sans else 'Times New Roman Bold.ttf' if bold else 'Times New Roman.ttf'
    font=ImageFont.truetype(str(FONT/name),size)
    while d.textlength(value,font=font)>1240:
        size-=1; font=ImageFont.truetype(str(FONT/name),size)
    d.text((768,y),value,font=font,anchor='mt',fill=green)

text('BALNEO SAL',140,127,sans=True)
d.text((1297,130),'®',font=ImageFont.truetype(str(FONT/'Arial Bold.ttf'),42),fill=green)
text('SARE DE MASĂ - PRAID',325,80)
d.line((218,435,1318,435),fill=green,width=5)
text('PARAJDI - ASZTALI SÓ',485,83)
text('Tárolás: száraz hűvös helyen',675,60,bold=True)
text('A se păstra: la loc uscat și răcoros.',755,60,bold=True)
text('Greutatea netă / Nettó súly:',915,67,bold=True)
text('10 Kg.          25 Kg.',1010,76,bold=True)
d.rectangle((442,1120,498,1176),outline=green,width=3)
d.line((1030,1110,1100,1180),fill=green,width=9)
d.line((1100,1110,1030,1180),fill=green,width=9)
text('Termen de valabilitate (zi/lună/an): nelimitat',1280,48)
text('Minőségét megőrzi (nap/hó/év): korlátlan ideig',1360,48)
text('Țara de origine / Származási hely: România / Románia',1470,45)
text('Distribuit de / Forgalmazza: Balneo sal Srl',1600,52)
text('Tg. Mureș / Marosvásárhely',1680,56)
text('Date de contact / Elérhetőség:',1800,48)
text('e-mail: balneosal@gmail.com',1875,48)
im.save(HERE/'parajd-label-v2.png')
