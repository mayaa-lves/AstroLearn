import { vertex, fragment as material } from './planeta-shaders.js';

export { vertex };
const pixel = document.documentElement.dataset.astroTema === 'pixel';

const gelo = `if(family==2.){
      float basin = clouds3(surface*3.7 + vec3(7.2, 2.5, 1.8));
      float snow = basin + .21*pow(abs(surface.y), 3.);
      ${pixel ? 'snow = floor(snow*9.)/9.;' : ''}
      color = mix(vec3(.12,.33,.51),vec3(.47,.73,.83),smoothstep(.25,.54,snow));
      color = mix(color,vec3(.86,.96,.99),smoothstep(.49,.75,snow));
      float strata = noise3(surface*5.5 + vec3(9., 2., 3.));
      float rift = 1.-smoothstep(.008,.024,abs(strata-.51));
      float broken = smoothstep(.36,.63,noise3(surface*12.));
      color = mix(color,vec3(.15,.44,.62),rift*broken*.65);
      float rim = pow(1.-z, 2.);
      color = mix(color,vec3(.64,.85,.96),rim*.25);
    }`;

let shader = material.replace(/if\s*\(family==2\.\)\s*\{[\s\S]*?\n\s*\}/, gelo);
if (pixel) {
  shader = shader.replace('vec2 xy=point*extent;', 'vec2 xy=(floor(point*56.)+.5)/56.*extent;');
} else {
  // Mantém a cor e os detalhes do mapa de Marte, sem convertê-lo em monocromático.
  shader = shader.replace(
    'if(family==1.)color=mix(vec3(.24,.058,.028),vec3(1.,.59,.23),smoothstep(.085,.7,l));',
    'if(family==1.)color=clamp((texel-.18)*1.18+.18,0.,1.)*vec3(1.04,.98,.95);'
  );
  const dust = `
  // Inclinação e teste de profundidade mantêm a poeira traseira atrás de Marte.
  if(variant>=0. && mod(variant,6.)==1.){
    vec3 plane=normalize(vec3(.22,.91,.37));
    float depth=-dot(plane.xy,xy)/plane.z;
    vec3 orbit=vec3(xy,depth);
    float radius=length(orbit);
    if(radius>1.02 && radius<1.23 && depth>z){
      float swirl=atan(orbit.z,orbit.x)+cloudAngle;
      float density=smoothstep(.28,.78,noise3(vec3(cos(swirl)*5.,sin(swirl)*5.,radius*68.)));
      float fade=smoothstep(1.02,1.09,radius)*(1.-smoothstep(1.12,1.23,radius));
      float da=.35*density*fade;
      float combined=da+alpha*(1.-da);
      color=(vec3(1.,.68,.39)*da+color*alpha*(1.-da))/max(combined,.001);
      alpha=combined;
    }
  }`;
  shader = shader.replace('if(alpha<.001)discard;', dust + '\n if(alpha<.001)discard;');
  shader = shader
    .replace('vec2 tap=vec2(.0022,.0011);', 'vec2 tap=vec2(.00065,.00028);')
    .replace('color*=.66+.42*light;', 'color*=.43+.65*pow(light,.83);')
    .replace('vec3(.65,.78,1.),rim*.35', 'vec3(.39,.72,1.),rim*.36')
    .replace(
      'float density=smoothstep(.548,.698,clouds3(cn*vec3(6.5,9.,6.5)));',
      'float density=smoothstep(.555,.71,clouds3(cn*vec3(7.6,11.,7.6)));'
    )
    .replace(
      'vec3 mc=mix(vec3(.83,.89,1.),vec3(1.,.96,.91),.5+.5*mn.y);',
      'vec3 mc=mod(variant,6.)==1. ? vec3(1.,.72,.46) : mix(vec3(.83,.89,1.),vec3(1.,.96,.91),.5+.5*mn.y);'
    )
    .replace('if(ringRadius>1.24&&ringRadius<2.17&&rz>z)', 'if(ringRadius>1.30&&ringRadius<2.15&&rz>z)')
    .replace(
      'float ringAlpha=(.35+.35*bands)*(1.-gap*.8)*smoothstep(1.24,1.3,ringRadius)*(1.-smoothstep(2.1,2.17,ringRadius));',
      'float ringAlpha=(.19+.31*bands)*(1.-gap*.92)*smoothstep(1.30,1.37,ringRadius)*(1.-smoothstep(2.05,2.15,ringRadius));'
    )
    .replace('alpha*=.64;', 'alpha*=.58;');
}
export const fragment = shader;
