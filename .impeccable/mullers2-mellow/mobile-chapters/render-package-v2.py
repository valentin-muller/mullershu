"""Reference-based white woven salt sack with a straight full-width sewn closure.
Run in a separate Blender background process; does not touch the open GUI scene.
"""
import bpy, math, random
from pathlib import Path
from mathutils import Vector

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2]
OUT=ROOT/'mullers2-wellness/mellow/assets/parajd-sack-v2.png'
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
printed=cloth.copy();printed.name='Green BALNEO SAL print on woven white sack'
n=printed.node_tree.nodes;l=printed.node_tree.links;p=n.get('Principled BSDF')
tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(HERE/'parajd-label-v2.png'));tex.extension='CLIP';tex.image.pack()
color=n.new('ShaderNodeMixRGB');color.blend_type='MIX';color.inputs[1].default_value=(.86,.85,.81,1)
ink=n.new('ShaderNodeVectorMath');ink.operation='MULTIPLY';ink.inputs[1].default_value=(.30,.45,.30)
l.new(tex.outputs['Color'],ink.inputs[0]);l.new(ink.outputs['Vector'],color.inputs[2])
l.new(tex.outputs['Alpha'],color.inputs[0]);l.new(color.outputs[0],p.inputs['Base Color'])
p.inputs['Specular IOR Level'].default_value=.2
seam_mat=material('White folded stitching',(.78,.77,.73))
salt=material('Natural salt crystals',(.9,.88,.82),.48)

profile=[(0,.47,.23),(.06,.55,.29),(.2,.58,.32),(.48,.60,.36),(.85,.615,.385),(1.2,.60,.37),(1.55,.585,.33),(1.78,.575,.27),(1.91,.565,.17),(2.01,.56,.04),(2.07,.55,.025)]
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
        x=rx*math.copysign(abs(c)**.42,c);y=ry*math.copysign(abs(s)**.42,s)
        # Cloth side creases and shallow uneven fullness; no gathered neck.
        fold=(.009*math.sin(17*a+z*3)+.008*math.cos(11*a-z*5))
        y+=fold*(.4+abs(x)/rx)*math.sin(math.pi*row/(ROWS-1))
        y+=.012*math.sin(24*x+8*z)*max(0,abs(s)-.3)*math.sin(math.pi*row/(ROWS-1))
        if s<-.4:
            # Uneven diagonal creases in the white woven fabric, like the supplied bag.
            for center,slope,depth in [(.48,.42,.025),(1.05,-.7,.020),(1.62,.28,.018)]:
                crease=(z-center-slope*x)/.045
                y+=depth*math.exp(-crease*crease)*math.sin(math.pi*row/(ROWS-1))
            y+=.018*math.sin(17*x+z)*max(0,z-1.75)/.32
        zz=z+.012*math.sin(a*4+z*2)*math.sin(math.pi*row/(ROWS-1))
        verts.append((x,y,zz))
for row in range(ROWS-1):
    for j in range(N):
        a=row*N+j;b=row*N+(j+1)%N;faces.append((a,b,b+N,a+N))
faces.append(tuple(reversed(range(N))))
faces.append(tuple((ROWS-1)*N+j for j in range(N)))
mesh=bpy.data.meshes.new('Broad rectangular salt sack, full-width flattened closure');mesh.from_pydata(verts,[],faces);mesh.update()
obj=bpy.data.objects.new('BALNEO SAL white woven salt sack',mesh);bpy.context.collection.objects.link(obj)
obj.data.materials.append(cloth);obj.data.materials.append(printed)
uv=mesh.uv_layers.new(name='Front print projection')
for poly in mesh.polygons:
    poly.use_smooth=True
    poly.material_index=1 if sum(verts[v][1] for v in poly.vertices)/len(poly.vertices)<-.04 else 0
    for loop in poly.loop_indices:
        x,y,z=verts[mesh.loops[loop].vertex_index]
        uv.data[loop].uv=(x/1.04+.5,(z-.12)/1.71)
sub=obj.modifiers.new('Soft packaging folds','SUBSURF');sub.levels=1

def cord(name,points,radius=.004):
    curve=bpy.data.curves.new(name,'CURVE');curve.dimensions='3D';curve.bevel_depth=radius;curve.bevel_resolution=2
    sp=curve.splines.new('POLY');sp.points.add(len(points)-1)
    for p,xyz in zip(sp.points,points):p.co=(*xyz,1)
    o=bpy.data.objects.new(name,curve);bpy.context.collection.objects.link(o);o.data.materials.append(seam_mat)
# Full-width horizontal hem and individual stitching, rather than a circular tie.
cord('Straight horizontal top hem',[(x,-.031,2.065+.004*math.sin(x*18)) for x in [(-.55+i*.011) for i in range(101)]],.009)
for i in range(47):
    x=-.52+i*.022
    cord('White stitch',[(x,-.045,2.043),(x+.01,-.044,2.05)],.0018)
for side in [-1,1]:
    cord('Folded side seam',[(side*dims(z)[0],.018,z) for z in [i*2.02/60 for i in range(61)]],.005)

for i in range(18):
    a=random.uniform(-math.pi,0);r=random.uniform(.55,.81)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=random.uniform(.025,.07),location=(r*math.cos(a),r*math.sin(a),.04))
    o=bpy.context.object;o.name='Salt crystal';o.scale=(1.2,.8,.7);o.rotation_euler=(random.random(),random.random(),random.random());o.data.materials.append(salt)
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
for name,loc,power,size in [('Large soft key',(-3,-4,6),500,4),('Neutral fill',(3,-2,4),220,3),('White rim',(1,3,4),220,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.size=size;aim(o,(0,0,1))
bpy.ops.object.camera_add(location=(1.3,-6,2.7));camera=bpy.context.object;aim(camera,(0,0,1.02));camera.data.type='ORTHO';camera.data.ortho_scale=2.48
scene=bpy.context.scene;scene.camera=camera;scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=True
scene.world.color=(.35,.35,.35);scene.render.film_transparent=True;scene.render.resolution_x=600;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.filepath=str(OUT);scene.view_settings.view_transform='AgX'
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'parajd-sack-v2.blend'))
bpy.ops.render.render(write_still=True)
