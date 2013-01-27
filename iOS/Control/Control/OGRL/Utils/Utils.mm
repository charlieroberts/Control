#include "Utils.hpp"
#include "Renderer.hpp"

using namespace std;

bool Utils::Epsilon(float val, float target, float range) {
 
  if (val > target - range && val < target + range) {
    return true;
  }
  
  return false;
  
}

void Utils::Sleep(double seconds) {
  [NSThread sleepForTimeInterval:seconds];
}

float Utils::RandomFloatBetween(float a, float b) {
  return ((b-a) * RandomFloat()) + a;
}


float Utils::RandomFloat() {
  return ((float)arc4random()/0x1000000);
}

//non-inclusive, i.e., if a=0 and b=10, it will return in the range of 0->9
int Utils::RandomIntBetween(int a, int b) {
  //return (int)a + (arc4random() % (b-a+1));
  return (int)a + (arc4random() % (b-a));
  //return (int) (((b-a) * [Utils randomDouble]) + a);
}

//non-inclusive, i.e., if a=0 and b=10, it will return in the range of 0->10
int Utils::RandomIntRange(int a, int b) {
  return (int)a + (arc4random() % (b-a+1));
  //return (int) (((b-a) * [Utils randomDouble]) + a);
}


ray3 Utils::GetPickingRay(int mx, int my) {
  Camera* camera = Renderer::GetRenderer()->GetCamera();
ivec4 vp = camera->viewport; 
mat4 proj = camera->projection;
mat4 mv = camera->modelview;

vec3 atNearPlane = mat4::Unproject(mx, my, 0.0, mv, proj, vp);
vec3 atFarPlane = mat4::Unproject(mx, my, 1.0, mv, proj, vp);
return ray3(atNearPlane, (atFarPlane - atNearPlane));
}

int Utils::IntersectsWithRay2(ray3 theRay, Sphere* s, vec3* intersection) {
  
  vec3 rO = theRay.origin;
  vec3 rD = theRay.direction;
  
  vec3 pos = s->GetTranslate();
  float radius = s->GetScale().x; //assuming a uniform scale
  //printf("radius = %f\n", radius);
  
  vec3 eyeToPixelDir = rD;
  vec3 originMinusCenter = rO - pos;
  
  float a = eyeToPixelDir % eyeToPixelDir;
  float b = 2 * (originMinusCenter % eyeToPixelDir);
  float c = originMinusCenter % originMinusCenter;
  
  //  float a = vec3::Dot(eyeToPixelDir, eyeToPixelDir);
  //  float b = 2 * (vec3::Dot(originMinusCenter, eyeToPixelDir));
  //  float c = vec3::Dot(originMinusCenter, originMinusCenter);
  c -= (radius * radius);
  
  float bb4ac = b * b - 4 * a * c;
  
  if(bb4ac > 0) {
    float t1 = (-b + sqrt(bb4ac)) / (2 * a);
    float t2 = (-b - sqrt(bb4ac)) / (2 * a);
    
    float closestT = (t1 < t2) ? t1 : t2;
    
    if(closestT >= 0) {
      *intersection = rO + (eyeToPixelDir * closestT);
      return 1;
    }
  }
  
  *intersection = vec3(0,0,0);
  return 0;
}




int Utils::IntersectsWithRay(ray3 theRay, Sphere* s, vec3* intersection) {
  
  vec3 rO = theRay.origin;
  vec3 rD = theRay.direction;
  
  vec3 pos = vec3(0,0,0); //s.translate;
  float radius = 1; //s.scale;
  
  vec3 eyeToPixelDir = rD;
  vec3 originMinusCenter = rO - pos;
  
  float a = eyeToPixelDir % eyeToPixelDir;
  float b = 2 * (originMinusCenter % eyeToPixelDir);
  float c = originMinusCenter % originMinusCenter;
  
//  float a = vec3::Dot(eyeToPixelDir, eyeToPixelDir);
//  float b = 2 * (vec3::Dot(originMinusCenter, eyeToPixelDir));
//  float c = vec3::Dot(originMinusCenter, originMinusCenter);
  c -= (radius * radius);
  
  float bb4ac = b * b - 4 * a * c;
  
  if(bb4ac > 0) {
    float t1 = (-b + sqrt(bb4ac)) / (2 * a);
    float t2 = (-b - sqrt(bb4ac)) / (2 * a);
    
    float closestT = (t1 < t2) ? t1 : t2;
    
    if(closestT >= 0) {
      *intersection = rO + (eyeToPixelDir * closestT);
      return 1;
    }
  }
  
  *intersection = vec3(0,0,0);
  return 0;
}


//a straightforward variation of Paul Bourke's code
vec3 Utils::ArbitraryRotate(vec3 p, float theta, vec3 r) {
  vec3 q = vec3(0.0,0.0,0.0);
  double costheta,sintheta;
  
  p.Normalize();
  r.Normalize();
  
  float rad = radians(theta);
  costheta = cos(rad);
  sintheta = sin(rad);
  
  q.x += (costheta + (1 - costheta) * r.x * r.x) * p.x;
  q.x += ((1 - costheta) * r.x * r.y - r.z * sintheta) * p.y;
  q.x += ((1 - costheta) * r.x * r.z + r.y * sintheta) * p.z;
  
  q.y += ((1 - costheta) * r.x * r.y + r.z * sintheta) * p.x;
  q.y += (costheta + (1 - costheta) * r.y * r.y) * p.y;
  q.y += ((1 - costheta) * r.y * r.z - r.x * sintheta) * p.z;
  
  q.z += ((1 - costheta) * r.x * r.z - r.y * sintheta) * p.x;
  q.z += ((1 - costheta) * r.y * r.z + r.x * sintheta) * p.y;
  q.z += (costheta + (1 - costheta) * r.z * r.z) * p.z;
  
  q.Normalize();
  
  return(q);
}




  