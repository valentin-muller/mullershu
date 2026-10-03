"""Property-photo reference: broad soft sack with flared, horizontally sewn upper wings.
Run in a separate Blender background process; does not touch the open GUI scene.
"""
import bpy, math, random
from pathlib import Path
from mathutils import Vector

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
OUT=ROOT/'mullers2-wellness/mellow/assets/parajd-sack-v3.png'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
random.seed(21)
def material(name,color,roughness=.75):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=roughness
    return m

cloth=material('Off-white woven polypropylene',(.86,.85,.81))
n=cloth.node_tree.nodes;l=cloth.node_tree.links;p=n.get('Principled BSDF')
coord=n.new('ShaderNodeTexCoord')
# Fine crossing strips give the flat woven packaging a subtle real material grain.
waves=[]
for direction in ['X','Z']:
    wave=n.new('ShaderNodeTexWave');wave.wave_type='BANDS';wave.bands_direction=direction;wave.inputs['Scale'].default_value=145
    wave.inputs['Distortion'].default_value=.22;l.new(coord.outputs['Generated'],wave.inputs['Vector']);waves.append(wave)
mix=n.new('ShaderNodeMath');mix.operation='MULTIPLY';l.new(waves[0].outputs['Fac'],mix.inputs[0]);l.new(waves[1].outputs['Fac'],mix.inputs[1])
bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.23;bump.inputs['Distance'].default_value=.006
l.new(mix.outputs[0],bump.inputs['Height']);l.new(bump.outputs['Normal'],p.inputs['Normal'])
p.inputs['Sheen Weight'].default_value=.10
printed=cloth.copy();printed.name='Actual green BALNEO Sal packaging print'
n=printed.node_tree.nodes;l=printed.node_tree.links;p=n.get('Principled BSDF')
tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(HERE/'parajd-property-reference.jpg'));tex.extension='EXTEND';tex.image.pack()
uv_map=n.new('ShaderNodeUVMap');uv_map.uv_map='Front print projection';l.new(uv_map.outputs['UV'],tex.inputs['Vector'])
# Extract the green ink in the material, rather than photographing wood or white fabric onto the model.
channels=n.new('ShaderNodeSeparateColor');channels.mode='RGB';l.new(tex.outputs['Color'],channels.inputs['Color'])
def mathnode(op,a,b):
    node=n.new('ShaderNodeMath');node.operation=op
    for index,value in enumerate([a,b]):
        if isinstance(value,(int,float)):node.inputs[index].default_value=value
        else:l.new(value,node.inputs[index])
    return node.outputs[0]
# The photograph's smaller print is desaturated by warm reflected light.
# Separate ink by darkness from the bright sack, preserving those original glyphs too.
luminance=mathnode('MULTIPLY',mathnode('ADD',channels.outputs['Red'],channels.outputs['Green']),.5)
mask=mathnode('SUBTRACT',.46,luminance)
mask=mathnode('MAXIMUM',0,mathnode('MINIMUM',1,mathnode('MULTIPLY',mask,7)))
mask=mathnode('MULTIPLY',mask,mathnode('GREATER_THAN',channels.outputs['Green'],mathnode('MULTIPLY',channels.outputs['Red'],.96)))
mask=mathnode('MULTIPLY',mask,mathnode('GREATER_THAN',channels.outputs['Green'],mathnode('MULTIPLY',channels.outputs['Blue'],1.02)))
color=n.new('ShaderNodeMixRGB');color.inputs[1].default_value=(.86,.85,.81,1);color.inputs[2].default_value=(.018,.14,.064,1)
l.new(mask,color.inputs[0]);l.new(color.outputs[0],p.inputs['Base Color']);p.inputs['Specular IOR Level'].default_value=.2
seam_mat=material('White folded stitching',(.78,.77,.73))
salt=material('Natural salt crystals',(.9,.88,.82),.48)

profile=[(0,.70,.08),(.05,.79,.21),(.18,.82,.30),(.42,.84,.36),(.72,.80,.37),(1.0,.72,.32),(1.28,.67,.26),(1.50,.73,.20),(1.72,.83,.13),(1.90,.95,.055),(2.07,.97,.016)]
def dims(z):
    for (z0,x0,y0),(z1,x1,y1) in zip(profile,profile[1:]):
        if z<=z1:
            t=(z-z0)/(z1-z0);return x0+(x1-x0)*t,y0+(y1-y0)*t
    return profile[-1][1:]

N=128;ROWS=85;verts=[];faces=[]
for row in range(ROWS):
    z=2.07*row/(ROWS-1);rx,ry=dims(z)
    for j in range(N):
        a=2*math.pi*j/N;c=math.cos(a);s=math.sin(a)
        x=rx*math.copysign(abs(c)**.58,c);y=ry*math.copysign(abs(s)**.58,s)
        # Cloth side creases and shallow uneven fullness; no gathered neck.
        fold=(.022*math.sin(13*a+z*3)+.016*math.cos(9*a-z*5))
        y+=fold*(.4+abs(x)/rx)*math.sin(math.pi*row/(ROWS-1))
        y+=.024*math.sin(19*x+8*z)*max(0,abs(s)-.3)*math.sin(math.pi*row/(ROWS-1))
        if s<-.4:
            # Uneven diagonal creases in the white woven fabric, like the supplied bag.
            for center,slope,depth in [(.42,.34,.021),(.98,-.6,.024),(1.57,.26,.017)]:
                crease=(z-center-slope*x)/.07
                y+=depth*math.exp(-crease*crease)*math.sin(math.pi*row/(ROWS-1))
            y+=.035*math.sin(16*x+z)*max(0,z-1.45)/.62
        zz=z+.018*math.sin(a*4+z*2)*math.sin(math.pi*row/(ROWS-1))
        zz+=.075*x*(z/2.07)**6+.02*math.cos(5*x)*(z/2.07)**8
        x+=.025*math.sin(z*4)*math.sin(math.pi*row/(ROWS-1))
        verts.append((x,y,zz))
for row in range(ROWS-1):
    for j in range(N):
        a=row*N+j;b=row*N+(j+1)%N;faces.append((a,b,b+N,a+N))
faces.append(tuple(reversed(range(N))))
faces.append(tuple((ROWS-1)*N+j for j in range(N)))
mesh=bpy.data.meshes.new('Soft broad pillow sack with flared empty top');mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new('Actual property BALNEO Sal sack',mesh);bpy.context.collection.objects.link(obj)
obj.data.materials.append(cloth);obj.data.materials.append(printed)
uv=mesh.uv_layers.new(name='Front print projection')
# Bilinear UV projection of the four printed-label corners in the supplied photo.
# Only the label area gets the green-ink material; all other faces retain neutral cloth.
corners=[(193/588,1-478/1280),(379/588,1-454/1280),(435/588,1-744/1280),(225/588,1-765/1280)]
for poly in mesh.polygons:
    poly.use_smooth=True
    cx=sum(verts[v][0] for v in poly.vertices)/len(poly.vertices)
    cy=sum(verts[v][1] for v in poly.vertices)/len(poly.vertices)
    cz=sum(verts[v][2] for v in poly.vertices)/len(poly.vertices)
    poly.material_index=1 if cy<-.07 and abs(cx)<.54 and 1.21<cz<1.60 else 0
    for loop in poly.loop_indices:
        x,y,z=verts[mesh.loops[loop].vertex_index]
        u=max(0,min(1,x/1.04+.5));v=max(0,min(1,(z-.25)/1.31))
        tl,tr,br,bl=corners
        uv.data[loop].uv=tuple((1-v)*((1-u)*bl[k]+u*br[k])+v*((1-u)*tl[k]+u*tr[k]) for k in [0,1])
sub=obj.modifiers.new('Soft packaging folds','SUBSURF');sub.levels=1

def cord(name,points,radius=.004):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.bevel_depth=radius;curve.bevel_resolution=2
    sp=curve.splines.new('POLY');sp.points.add(len(points)-1)
    for p,xyz in zip(sp.points,points):p.co=(*xyz,1)
    o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o);o.data.materials.append(seam_mat)
# Broad, flat stitched upper edge; no gathered neck. Cloth wings and loose corner threads.
def top_z(x):return 2.065+.075*x+.02*math.cos(5*x)
cord('Flat upper sewn closure',[(x,-.024,top_z(x)) for x in [(-.965+i*.0193) for i in range(101)]],.007)
for i in range(75):
    x=-.945+i*.0255
    cord('Hem stitch',[(x,-.033,top_z(x)-.025),(x+.008,-.033,top_z(x)-.012)],.0014)
for side in [-1,1]:
    cord('Folded side seam',[(side*dims(z)[0],.018,z+.075*side*dims(z)[0]*(z/2.07)**6) for z in [i*2.06/90 for i in range(91)]],.004)
    # Loose woven corners at the lower seam.
    mesh_tip=bpy.data.meshes.new('Cloth corner')
    mesh_tip.from_pydata([(side*.72,-.025,.035),(side*.92,-.018,.075),(side*.79,-.09,.14),(side*.78,.025,.09)],[],[(0,1,2),(1,3,2)])
    tip=bpy.data.objects.new('Flattened lower corner',mesh_tip);bpy.context.collection.objects.link(tip);tip.data.materials.append(cloth)
    sol=tip.modifiers.new('Cloth thickness','SOLIDIFY');sol.thickness=.003
    cord('Loose lower thread',[(side*(.91+i*.007),-.02,.08+i*.004+.018*math.sin(i*.5)) for i in range(14)],.0015)
cord('Loose upper thread',[(.97+.007*i,-.006,top_z(.97)-.01*i+.012*math.sin(i)) for i in range(14)],.0016)

# Keep the supplied stylized logo. Reconstruct the legible product wording as
# conforming ink geometry so the warm photograph's worn fine print does not break up.
ink_mat=material('Dark green printed lettering',(.018,.14,.064))
font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Times New Roman.ttf')
for body,z,size in [
    ('Destinația produs. / Termék neve',1.18,.038),
    ('SARE DE MASĂ / ASZTALI SÓ',1.065,.067),
    ('PRAID / PARAJD',.960,.076),
    ('Țara de origine / Származási hely',.825,.035),
    ('România / Románia',.757,.040),
    ('Depozitare / Tárolás',.650,.040),
    ('La loc uscat și răcoros / száraz hűvös helyen',.570,.033),
    ('Greutatea netă / Nettó súly: 25 Kg',.440,.043),
]:
    text=bpy.data.curves.new(body,'FONT');text.body=body;text.font=font;text.size=size;text.align_x='CENTER';text.resolution_u=8
    o=bpy.data.objects.new(body,text);bpy.context.collection.objects.link(o);o.location=(0,-.53,z);o.rotation_euler=(math.pi/2,0,0);o.data.materials.append(ink_mat)
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.convert(target='MESH');bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
    wrap=o.modifiers.new('Printed onto cloth','SHRINKWRAP');wrap.target=obj;wrap.wrap_method='PROJECT';wrap.use_project_y=True;wrap.use_positive_direction=True;wrap.use_negative_direction=True;wrap.offset=.0015
# A thin green packaging frame continues below the logo, following the cloth surface.
for name,points in [
    ('Left printed frame',[(-.52,-.55,1.23-i*.014) for i in range(65)]),
    ('Right printed frame',[(.52,-.55,1.49-i*.018) for i in range(65)]),
    ('Lower printed frame',[(-.52+i*.0104,-.55,.315-.018*math.cos(i*math.pi/100)) for i in range(101)]),
]:
    cord(name,points,.003);o=bpy.context.collection.objects.get(name);o.data.materials.clear();o.data.materials.append(ink_mat)
    bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
    wrap=o.modifiers.new('Frame printed onto cloth','SHRINKWRAP');wrap.target=obj;wrap.wrap_method='PROJECT';wrap.use_project_y=True;wrap.use_positive_direction=True;wrap.use_negative_direction=True;wrap.offset=.0015

def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for name,loc,power,size in [('Large soft key',(-3,-4,6),500,4),('Neutral fill',(3,-2,4),220,3),('White rim',(1,3,4),220,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.size=size;aim(o,(0,0,1))
bpy.ops.object.camera_add(location=(.7,-6,2.35));camera=bpy.context.object;aim(camera,(0,0,1.02));camera.data.type='ORTHO';camera.data.ortho_scale=2.94
scene=bpy.context.scene;scene.camera=camera;scene.render.engine='CYCLES';scene.cycles.samples=96;scene.cycles.use_denoising=True
scene.world.color=(.35,.35,.35);scene.render.film_transparent=True;scene.render.resolution_x=600;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.filepath=str(OUT);scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'parajd-sack-v3.blend'))
bpy.ops.render.render(write_still=True)
