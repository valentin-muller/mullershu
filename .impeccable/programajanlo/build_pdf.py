from pathlib import Path
import json, re, html
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Image, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from reportlab import rl_config
rl_config.useA85 = False
root=Path(__file__).resolve().parents[2]
for name,path in [('Body','work-sans-400.ttf'),('Title','sora-400.ttf')]:
 pdfmetrics.registerFont(TTFont(name,str(root/'mullers2-wellness/mellow/assets'/path)))
blue=HexColor('#0b2b4a');muted=HexColor('#38546a');linkcolor='#155f8a'
styles={
 'h1':ParagraphStyle('h1',fontName='Title',fontSize=22,leading=28,textColor=blue,spaceAfter=12),
 'h2':ParagraphStyle('h2',fontName='Title',fontSize=14,leading=19,textColor=blue,spaceBefore=14,spaceAfter=5),
 'body':ParagraphStyle('body',fontName='Body',fontSize=10.5,leading=15.5,textColor=blue,spaceAfter=7),
 'note':ParagraphStyle('note',fontName='Body',fontSize=9,leading=13.5,textColor=muted,spaceAfter=8),
 'meta':ParagraphStyle('meta',fontName='Body',fontSize=8.5,leading=12,textColor=muted,spaceAfter=5),
 'link':ParagraphStyle('link',fontName='Body',fontSize=8.5,leading=12,textColor=HexColor(linkcolor),spaceAfter=9)
}
def clean(s):
 s=''.join(c for c in s if ord(c)<0x1F000 and c not in '\ufe0f\u200d\u2614\u26f5\u2693\u2705')
 return html.escape(s.replace('–','-').replace('—','-').strip())
def p(s,style='body'):return Paragraph(clean(s),styles[style])
flow=[]
width=A4[0]-104
from pypdf import PdfReader
# Textual source stays synchronized with the web article's research data.
groups=json.loads((root/'.impeccable/programajanlo/content.json').read_text())
for i,g in enumerate(groups):
 if i:flow.append(PageBreak())
 if i==0:
  flow+=[p('Siófoki programajánló osztálykirándulóknak','h1'),p('10 programötlet, közös kalandok és esőnapi alternatívák.','body'),p('Frissítve: 2026. október 2. | Müller’s Panzió Siófok','meta'),Spacer(1,8)]
 else:flow.append(p(g['title'],'h1'))
 if i==0:flow.append(p(g['title'],'h2'))
 flow.append(p(g['intro']))
 if 'image' in g:
  # Use the faithful original PDF photo with its native aspect ratio.
  img_path=root/'assets/blog/programajanlo'/f"{g['image']}.webp"
  from PIL import Image as PILImage
  im=PILImage.open(img_path); im.thumbnail((900,900)); jpg=root/'.impeccable/programajanlo'/f"pdf-{g['image']}.jpg";im.convert('RGB').save(jpg,quality=88)
  photo=Image(str(jpg)); photo.drawHeight=145;photo.drawWidth=145*im.width/im.height;photo.hAlign='LEFT';flow.extend([photo,Spacer(1,8)])
 for it in g['items']:
  block=[p(it['name'],'h2'),p(it['meta'],'meta'),p(it['text']),p('Jó tudni: '+it['note'],'note'),Paragraph(f'<link href="{html.escape(it["url"])}" color="{linkcolor}">{clean(it["link"])}<br/>{html.escape(it["url"])}</link>',styles['link'])]
  flow.append(KeepTogether(block))
flow.append(PageBreak())
flow+=[p('Két nap, jó ritmusban','h1'),p('Saját mintatervünk kiindulópont. Igazítsátok az osztály korához, a választott dátumhoz és a költségkerethez!')]
from html.parser import HTMLParser
class Section(HTMLParser):
 def __init__(self):super().__init__();self.capture=False;self.depth=0;self.cur='';self.tag='';self.parts=[]
 def handle_starttag(self,t,a):
  if t=='section' and dict(a).get('id') in ['mintaterv','szervezes']:self.capture=True
  if self.capture and t in ['h2','h3','p','li']:self.cur='';self.tag=t
 def handle_data(self,d):
  if self.capture:self.cur+=d
 def handle_endtag(self,t):
  if self.capture and t in ['h2','h3','p','li']:
   text=re.sub(r'\s+',' ',self.cur).strip();self.parts.append((t,text));self.cur=''
  if t=='section':self.capture=False
parser=Section();parser.feed((root/'blog/programajanlo/index.html').read_text())
# Avoid duplicating the plan title/introduction already printed above.
for tag,s in parser.parts[2:]:flow.append(p(s,'h2' if tag in ['h2','h3'] else 'note' if 'tervezési ötlet' in s else 'body'))
flow+=[Spacer(1,10),p('Kérjetek szállásajánlatot a csoportnak!','h2'),Paragraph('<link href="mailto:mullers106@gmail.com" color="#155f8a">mullers106@gmail.com</link> | <link href="tel:+36204131146" color="#155f8a">+36 20 413 1146</link>',styles['body']),p('Küldjétek el az iskola nevét, a dátumot, a diákok és kísérők létszámát, valamint az étkezési igényeket.'),p('Források: a programoknál hivatkozott hivatalos oldalak. A nyitvatartás, az árak és a csoportfogadási feltételek változhatnak; a kirándulás napjára kérjetek visszaigazolást.','note')]
def footer(c,doc):
 c.saveState();c.setFillColor(blue);c.setFont('Body',8);c.drawString(52,29,"Müller's Panzió Siófok | Programajánló | 2026. október 2.");c.drawRightString(A4[0]-52,29,str(doc.page));c.restoreState()
output=root/'assets/blog/programajanlo_2026.pdf'
SimpleDocTemplate(str(output),pagesize=A4,rightMargin=52,leftMargin=52,topMargin=40,bottomMargin=50,title='Siófoki programajánló osztálykirándulóknak',author="Müller's Panzió Siófok").build(flow,onFirstPage=footer,onLaterPages=footer)
r=PdfReader(output);print('PDF pages:',len(r.pages),'bytes:',output.stat().st_size)
for i,page in enumerate(r.pages):print(i+1,len(page.extract_text()),page.extract_text()[:75].replace('\n',' / '))
