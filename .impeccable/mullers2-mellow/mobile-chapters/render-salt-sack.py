"""Editable, illustrative linen salt sack. Run with Blender in background mode."""
import bpy, math, random
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'mullers2-wellness/mellow/assets/parajd-sack-v1.png'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
random.seed(21)

def material(name, color, roughness=.8):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=roughness
    return m

linen=material('Natural ivory woven linen',(.77,.70,.56))
n=linen.node_tree.nodes;l=linen.node_tree.links
tex=n.new('ShaderNodeTexNoise');tex.inputs['Scale'].default_value=175;tex.inputs['Detail'].default_value=2
bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.3;bump.inputs['Distance'].default_value=.012
l.new(tex.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs['Normal'],n.get('Principled BSDF').inputs['Normal'])
ink=material('Warm brown print',(.20,.13,.075))
rope=material('Cotton drawstring',(.50,.39,.25))
salt=material('Pale translucent salt',(.90,.86,.78),.48)

# Numerous sculpted cloth rings: full rounded body, gathered neck and folded lip.
profile=[(0,.35),(.05,.54),(.16,.63),(.40,.68),(.75,.69),(1.12,.65),(1.42,.58),(1.60,.40),(1.75,.15),(1.83,.12),(1.97,.24),(2.09,.32)]
verts=[];faces=[];N=96
for row,(z,r) in enumerate(profile):
    for j in range(N):
        a=j*2*math.pi/N
        wrinkle=(.016*math.sin(a*13+row*.8)+.011*math.cos(a*21-row*.6))*(1.9 if z>1.5 else 1)
        radius=r+wrinkle
        verts.append((radius*math.cos(a),radius*.73*math.sin(a),z+.025*math.sin(a*5+row*.4)))
for row in range(len(profile)-1):
    for j in range(N):
        a=row*N+j;b=row*N+(j+1)%N;faces.append((a,b,b+N,a+N))
faces.append(tuple(reversed(range(N))))
mesh=bpy.data.meshes.new('Soft cloth sack mesh');mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new('Parajd linen salt sack',mesh);bpy.context.collection.objects.link(obj);obj.data.materials.append(linen)
for p in mesh.polygons:p.use_smooth=True
sub=obj.modifiers.new('Smooth cloth folds','SUBSURF');sub.levels=2
solid=obj.modifiers.new('Cloth thickness','SOLIDIFY');solid.thickness=.012

def cord(name,points,radius=.012):
    c=bpy.data.curves.new(name,'CURVE');c.dimensions='3D';c.bevel_depth=radius;c.bevel_resolution=3
    sp=c.splines.new('POLY');sp.points.add(len(points)-1)
    for p,xyz in zip(sp.points,points):p.co=(*xyz,1)
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(rope)
cord('Drawstring around gathered neck',[(.14*math.cos(i*math.pi/32),.115*math.sin(i*math.pi/32),1.80+.013*math.sin(i*.5)) for i in range(65)])
cord('Loose cotton tie left',[(.02,-.13,1.8),(-.12,-.24,1.77),(-.24,-.23,1.73),(-.22,-.19,1.70),(-.05,-.14,1.78),(-.16,-.22,1.49)])
cord('Loose cotton tie right',[(.02,-.13,1.8),(.14,-.22,1.81),(.22,-.23,1.76),(.18,-.18,1.72),(.04,-.14,1.79),(.18,-.22,1.53)])

font=bpy.data.fonts.load(str(ROOT/'mullers2-wellness/mellow/assets/sora-400.ttf'))
for label,z,size in [('Parajdi',1.15,.16),('só',.93,.19)]:
    c=bpy.data.curves.new(label,'FONT');c.body=label;c.align_x='CENTER';c.size=size;c.font=font;c.extrude=.001
    o=bpy.data.objects.new('Printed '+label,c);bpy.context.collection.objects.link(o);o.location=(0,-.525,z);o.rotation_euler=(math.pi/2,0,0);o.data.materials.append(ink)

for i in range(20):
    a=random.uniform(-math.pi,0);r=random.uniform(.52,.92)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=random.uniform(.025,.09),location=(r*math.cos(a),r*math.sin(a),.055))
    o=bpy.context.object;o.name='Salt crystal';o.scale=(1.3,.8,.7);o.rotation_euler=(random.random(),random.random(),random.random());o.data.materials.append(salt)

def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for name,loc,power,size in [('Softbox key',(-3,-4,6),450,4),('Softbox fill',(3,-2,4),160,3),('Back rim',(1,3,4),240,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;aim(o,(0,0,1))
bpy.ops.object.camera_add(location=(2.1,-6,2.7));camera=bpy.context.object;aim(camera,(0,0,1.02));camera.data.type='ORTHO';camera.data.ortho_scale=2.5
scene=bpy.context.scene;scene.camera=camera;scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True
scene.world.color=(.3,.3,.3);scene.render.film_transparent=True;scene.render.resolution_x=600;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.filepath=str(OUT)
scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(Path(__file__).with_name('parajd-sack-v1.blend')))
bpy.ops.render.render(write_still=True)
