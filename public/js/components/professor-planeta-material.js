export const vertex=`attribute vec2 position;varying vec2 point;void main(){point=position;gl_Position=vec4(position,0.,1.);}`;
export const fragment=`precision highp float;
varying vec2 point;uniform sampler2D atlas;uniform vec2 extent;uniform float angle;uniform float cloudAngle;uniform float kind;uniform float variant;
const float PI=3.14159265359;
void main(){
 vec2 xy=point*extent;float rr=dot(xy,xy);float z=-100.;vec3 color=vec3(0.);float alpha=0.;
 float family=mod(variant,6.);
 if(rr<1.){
  z=sqrt(1.-rr);vec3 n=vec3(xy,z);float a=angle;vec3 p=vec3(cos(a)*n.x+sin(a)*n.z,n.y,-sin(a)*n.x+cos(a)*n.z);
  float u=fract(atan(p.z,p.x)/(2.*PI)+.5);float v=acos(clamp(p.y,-1.,1.))/PI;
  float lo=0.,hi=.178;
  if(family==1.){lo=.181;hi=.344;}
  if(family==2.){lo=.349;hi=.497;}
  if(family==3.){lo=.502;hi=.660;}
  if(family==4.){lo=.666;hi=.826;}
  if(family==5.){lo=.833;hi=.998;}
  vec2 uv=vec2(u,mix(lo,hi,clamp(v,.015,.985)));
  vec3 material=texture2D(atlas,uv).rgb;
  // Soften the seam only at longitude zero; the silhouette remains sharp.
  float seam=1.-smoothstep(0.,.014,min(u,1.-u));
  vec3 edge=.5*(texture2D(atlas,vec2(.006,uv.y)).rgb+texture2D(atlas,vec2(.994,uv.y)).rgb);
  material=mix(material,edge,seam*.8);
  float diffuse=max(0.,dot(n,normalize(vec3(-.65,.75,1.5))));
  color=material*(.65+.44*diffuse);
  float rim=pow(1.-z,3.5);
  vec3 atmosphere=family==1.?vec3(1.,.65,.42):family==4.?vec3(1.,.35,.13):family==5.?vec3(1.,.64,.83):vec3(.65,.85,1.);
  color=mix(color,atmosphere,rim*.27);
  if(family==4.){float lava=smoothstep(.10,.4,material.r-material.b);color+=vec3(1.,.22,.015)*lava*.3;}
  alpha=1.-smoothstep(.987,1.,rr);
 }else if(rr<1.12){alpha=(1.-smoothstep(1.,1.12,rr))*.18;color=vec3(.85,.9,1.);}
 // Thin inclined orbital ellipse with correct front/back occlusion.
 float rz=(xy.y-.37*xy.x)/.30;
 float radius=length(vec2(xy.x,rz));
 float orbit=(1.-smoothstep(.006,.018,abs(radius-1.12)))*.8;
 if(orbit>0.&&rz>z){float combined=orbit+alpha*(1.-orbit);color=(vec3(1.,.97,.95)*orbit+color*alpha*(1.-orbit))/max(combined,.001);alpha=combined;}
 if(alpha<.001)discard;gl_FragColor=vec4(color*alpha,alpha);
}`;
