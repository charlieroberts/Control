#include "Renderer.hpp"
//#include "NSGLView.h"
#include "IOSGLView.h"
//#include "TextRect.hpp"


Renderer* Renderer::instance = NULL;

Renderer* Renderer::GetRenderer() {
  return instance;
}

Renderer::Renderer() {
  printf("Renderer::Renderer()\n");
  
  isRendering = false;
  
  CreateRenderBuffer();
  
  LoadDefaultPrograms();
  
  //think this should be called as needed by individual renderers...
  CreateFullScreenRect(); //i.e. can be used to draw a full screen texture from an fbo
  
  //AddGeom(this);
  instance = this;
}



void Renderer::Transform() {
  //if (IsTransformed()) {
  //modelview = GetModelView(); //return camera's modelview
  printf("in Renderer::Transform(), this should never be called!\n");
}



mat4 Renderer::GetModelView() {
  //modelview.Print();
  //printf("in Renderer GetModelView()\n");
  //return GetCamera()->GetModelView();
  //return modelview;
  printf("in Renderer::GetModelView(), this should never be called!\n");
  return mat4::Identity();
}



map<string, Camera*>& Renderer::GetCameras() {
  return cameras;
}

Camera* Renderer::GetCamera() {
  return camera; //return default camera
}


Camera* Renderer::InstallDefaultCamera(Camera* _c) {
  InstallCamera("default", _c);
  AddGeom(Renderer::GetRenderer());
  return _c;
}

Camera* Renderer::InstallCamera(string cameraName, Camera* _c) {
  
  Camera* cam = cameras[cameraName];
  
  if (cam != NULL) {
    //  return cam;
    cout << "overriding existing camera <" << cameraName << ">, should probably update its children! to do \n"; 
  }
  
  cout << "camera \"" << cameraName << "\" installed \n";
  cameras[cameraName] = _c;
  
  _c->Transform();
  return GetCameras()["" + cameraName];
}



bool Renderer::AddGeom(Geom* g) {
  printf("in Renderer::AddGeom(Geom* g) \n");
  return cameras["default"]->AddGeom(g);
}

bool Renderer::RemoveGeom(Geom* g) {
  return cameras["default"]->RemoveGeom(g);
}

void Renderer::Render() { 
  
  //printf("in Renderer::Render()\n");
  BindDefaultFrameBuffer();
  glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT); 

  map<string,Camera*>::iterator it;
  
  for (it=GetCameras().begin(); it!=GetCameras().end(); it++) {
    string cname = (string)it->first;
    //cout << "about to iterate through all Geoms attached to camera <" << cname << ">\n";
    Camera* cam = (Camera*) it->second;
    cam->Render();
  }
  
  /*
   typedef std::map<std::string, std::map<std::string, std::string> >::iterator it_type;
   for(it_type iterator = m.begin(); iterator != m.end(); iterator++) {
   // iterator->first = key
   // iterator->second = value
   // Repeat if you also want to iterate through the second map.
   }
   for (int c = 0; c < cameras.size(); c++) {
   Camera* cam = (Camera*) cameras[c];
   cam->Render();
   }
   */
}

void Renderer::PrintGLVersion() {
  printf("GL Version = %s\n", glGetString(GL_VERSION));
  printf("GLSL Version = %s\n", glGetString(GL_SHADING_LANGUAGE_VERSION));
}

void Renderer::PrintGLSLInfo() {
  int range, precision;
  glGetShaderPrecisionFormat(GL_FRAGMENT_SHADER, GL_HIGH_FLOAT, &range, &precision);
  printf("GL_HIGH_FLOAT: range / precision = %d, %d\n", range, precision);
  glGetShaderPrecisionFormat(GL_FRAGMENT_SHADER, GL_HIGH_INT, &range, &precision);
  printf("GL_HIGH_INT: range / precision = %d, %d\n", range, precision);
  glGetShaderPrecisionFormat(GL_FRAGMENT_SHADER, GL_MEDIUM_FLOAT, &range, &precision);
  printf("GL_MEDIUM_FLOAT: range / precision = %d, %d\n", range, precision);
  glGetShaderPrecisionFormat(GL_FRAGMENT_SHADER, GL_MEDIUM_INT, &range, &precision);
  printf("GL_MEDIUM_INT: range / precision = %d, %d\n", range, precision);
  glGetShaderPrecisionFormat(GL_FRAGMENT_SHADER, GL_LOW_FLOAT, &range, &precision);
  printf("GL_LOW_FLOAT: range / precision = %d, %d\n", range, precision);
  glGetShaderPrecisionFormat(GL_FRAGMENT_SHADER, GL_LOW_INT, &range, &precision);
  printf("GL_LOW_INT: range / precision = %d, %d\n", range, precision);
}

void Renderer::CreateFullScreenRect() {
  fullScreenRect = new Rectangle(vec3(-1.0, -1.0, 0.0), 2.0, 2.0);
  fullScreenRect->modelview = mat4::Translate(mat4::Identity(), fullScreenRect->GetTranslate());
  fullScreenRect->modelview = mat4::Scale(fullScreenRect->modelview, fullScreenRect->GetScale());
  fullScreenRect->SetIsTransformed(false);
  fullScreenRect->parent = this;
  
  
  LoadProgram("SingleTexture");
  //LoadProgram("BicubicInterpolation");
  
}


void Renderer::updateGeoms(bool cameraMoved) {
  vector<Geom*>::iterator it;
  
  for (it=GetGeoms().begin(); it!=GetGeoms().end(); it++) {
    Geom* g = (Geom*) *it;
    
    if (g->IsTransformed() || cameraMoved) {
      g->Transform();
    }
    
  }
}
void Renderer::Reshape(int _width, int _height) {
  width = _width;
  height = _height;
  printf("in Renderer::Reshape w/h = %d %d\n", width, height);
  camera->Reshape(width, height);
}

void Renderer::CreateRenderBuffer() {
  
  printf("in Renderer::CreateRenderBuffer\n"); 
  glGenRenderbuffers(1, &m_colorRenderbuffer);
  glBindRenderbuffer(GL_RENDERBUFFER, m_colorRenderbuffer);
  
  printf("GL_RENDERBUFFER = %d\n", m_colorRenderbuffer);
}

void Renderer::InitializeRenderBuffers() {
  
  printf("in Renderer::InitializeRenderBuffers w/h = %d/%d\n", width, height);
  // Extract width and height.
  glGetRenderbufferParameteriv(GL_RENDERBUFFER,
                               GL_RENDERBUFFER_WIDTH, &width);
  glGetRenderbufferParameteriv(GL_RENDERBUFFER,
                               GL_RENDERBUFFER_HEIGHT, &height);
  
  glGenRenderbuffers(1, &m_depthRenderbuffer);
  glBindRenderbuffer(GL_RENDERBUFFER, m_depthRenderbuffer);
  glRenderbufferStorage(GL_RENDERBUFFER, GL_DEPTH_COMPONENT16, width, height);
  
  GLuint framebuffer;
  glGenFramebuffers(1, &framebuffer);
  glBindFramebuffer(GL_FRAMEBUFFER, framebuffer);
  
  printf("color attachment framebuffer = %d\n", framebuffer);
  
  glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0,
                            GL_RENDERBUFFER, m_colorRenderbuffer);
  glFramebufferRenderbuffer(GL_FRAMEBUFFER, GL_DEPTH_ATTACHMENT,
                            GL_RENDERBUFFER, m_depthRenderbuffer);
  glBindRenderbuffer(GL_RENDERBUFFER, m_colorRenderbuffer);  
  printf("color attachment renderbuffer = %d\n", m_colorRenderbuffer);
  
  defaultFBO = framebuffer;
  
  
  printf("in Renderer::InitializeRenderBuffers w/h = %d/%d\n", width, height);
}

void Renderer::SetGyroscopeMatrix(mat4 _mvm) {
  gyroscopeMatrix = _mvm;
}

void Renderer::BindDefaultFrameBuffer() {
  glBindFramebuffer(GL_FRAMEBUFFER, defaultFBO);
  
//  ivec4 vp = camera->viewport;
//  glViewport(vp.x, vp.y, vp.z, vp.w);
//  glClearColor(0.0f, 0.0f, 0.0f, 1.0f);
//  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
}

void Renderer::DrawFullScreenTexture(Texture* t) {
  BindDefaultFrameBuffer();
  
  /*
   vector<float>& vvv = fullScreenRect->GetTexCoords();
   
   vvv[0] = post.x + 0.5;
   vvv[i+1] = post.y + 0.5;
   vvv[i+2] = post.z;
   
   }
   */
  
  //Program* program = GetPrograms()["BicubicInterpolation"];
  Program* program = GetProgram("SingleTexture");
  program->Bind(); {
    
    glUniform1f(program->Uniform("fWidth"), width);
    glUniform1f(program->Uniform("fHeight"), height);
    
    
    glUniformMatrix4fv(program->Uniform("Modelview"), 1, 0, fullScreenRect->GetModelView().Pointer());
    glUniformMatrix4fv(program->Uniform("Projection"), 1, 0, mat4::Identity().Pointer());
    
    t->Bind(GL_TEXTURE0); {
      
      glUniform1i(program->Uniform("s_tex"), 0);
      fullScreenRect->PassVertices(program, GL_TRIANGLES);
      
    } t->Unbind(GL_TEXTURE0);
  } program->Unbind();
}


void Renderer::LoadDefaultPrograms() {
  
  
  
  string passThroughVSH = 
  "attribute vec4 position; \n"  
  "attribute vec3 texCoord; \n"  
  "uniform mat4 Projection; \n"
  "uniform mat4 Modelview; \n"
  "varying vec2 v_texCoord; \n"    
  "void main() { \n"                   
  "  gl_Position = Projection * Modelview * position; \n"
  "  v_texCoord = texCoord.xy; \n"  
  "}";                   
  
  string singleTextureFSH = 
  "precision mediump float; \n" 
  "varying vec2 v_texCoord; \n"                          
  "uniform sampler2D s_tex; \n"                     
  "void main() { \n"         
  "  gl_FragColor = texture2D( s_tex, v_texCoord ); \n"
  //"  gl_FragColor = vec4(1.0,0.0,0.0,1.0); //texture2D( s_tex, v_texCoord ); \n"
  "}";  
  
  LoadProgram("SingleTexture", passThroughVSH, singleTextureFSH);
  
  string textureAtlasFSH = 
  "precision mediump float; \n"
  "varying vec2 v_texCoord; \n"                           
  "uniform sampler2D s_tex; \n"                      
  "uniform vec4 letterColor; \n"
  "void main() { \n"    
  "   vec4 texColor = texture2D( s_tex, v_texCoord ); \n"
  "   vec4 useColor = letterColor * texColor.a; \n"
  "   gl_FragColor = vec4(useColor); \n"
  //"  gl_FragColor = vec4(1.0,0.0,0.0,1.0); //texture2D( s_tex, v_texCoord ); \n"
  "}";
  
  LoadProgram("TextureAtlas", passThroughVSH, textureAtlasFSH);
  
  string flatShaderVSH =
  "attribute vec4 position; \n"  
  "uniform mat4 Projection; \n"
  "uniform mat4 Modelview; \n"
  "void main() { \n"                   
  "  gl_Position = Projection * Modelview * position; \n"
  "}";                   
  
  string flatShaderFSH =
  "uniform mediump vec4 Color; \n"
  "void main(void) { \n"
  "  gl_FragColor = Color; \n"
  "}";
  
  LoadProgram("FlatShader", flatShaderVSH, flatShaderFSH);
}


Program* Renderer::LoadProgram(string programName, string vsh, string fsh) {
  Program* program = programs[programName];
  
  if (program != NULL) {
    return program;
  }
  
  program = new Program(programName, vsh, fsh);
  
  if (program != NULL) {
    cout << "program ID = " << program->programID << " for Program: " << programName << "\n";
    programs[programName] = program;
    return GetPrograms()["" + programName];
  }
  
  cout << "COULDN'T LOAD " << programName << "\n"; 
  return NULL;
}

Program* Renderer::LoadProgram(string programName) {
  Program* program = programs[programName];
  
  if (program != NULL) {
    return program;
  }
  
  program = new Program(programName);
  
  if (program != NULL) {
    cout << "program ID = " << program->programID << " for Program: " << programName << "\n";
    programs[programName] = program;
    return GetPrograms()["" + programName];
  }
  
  cout << "COULDN'T LOAD " << programName << "\n"; 
  return NULL;
}


Program* Renderer::GetProgram(string programName) {
  return LoadProgram(programName);
}


map<string, Program*>& Renderer::GetPrograms() {
  return programs;
}

map<string, Texture*>& Renderer::GetTextures() {
  return textures;
}

map<string, FBO*>& Renderer::GetFbos() {
  return fbos;
}


Texture* Renderer::CreateTexture(string TextureName, Texture* texture) {
  GetTextures().insert(pair<string, Texture*>(TextureName, texture));
  return texture;
}

FBO* Renderer::CreateFBO(string FBOName, Texture* texture) {
  FBO* fbo = new FBO(texture);
  GetFbos().insert(pair<string, FBO*>(FBOName, fbo));
  
  return fbo;
}

//Method to help select a Geom from a mouse input. The Geom must handle the method "ContainsWindowPoint".
//See Rectangle.mm for an example that uses mat4::Project.
vector<Geom*> Renderer::GetGeomsContainingWindowPoint(ivec2 mouse) {
  
  vector<Geom*> gs;
  
  map<string,Camera*>::iterator it;
  
  for (it=GetCameras().begin(); it!=GetCameras().end(); it++) {
    string cname = (string)it->first;
    Camera* cam = (Camera*) it->second;
    
    vector<Geom*> cgs = CheckGeomsForWindowPoint(cam, ivec2(mouse.x, height - mouse.y));
    gs.insert(gs.end(), cgs.begin(), cgs.end());
    
  }
  
  
  
  /*
   for (int c = 0; c < cameras.size(); c++) {
   Camera* cam = (Camera*) cameras[c];
   
   //need to flip y window coordinate
   vector<Geom*> cgs = CheckGeomsForWindowPoint(cam, ivec2(mouse.x, height - mouse.y));
   gs.insert(gs.end(), cgs.begin(), cgs.end());
   }
   */
  
  return gs;
}

vector<Geom*> Renderer::CheckGeomsForWindowPoint(Geom* parent, ivec2 mouse) {
  
  printf("in Renderer::CheckGeomsForWindowPoint, mouse = %d/%d\n", mouse.x, mouse.y);
  vector<Geom*> gs;
  
  if ( parent->IsSelectable == true && parent->ContainsWindowPoint(mouse) == true ) {
    gs.push_back(parent);
  }
  
  vector<Geom*>::iterator it;
  for (it=parent->geoms.begin(); it!=parent->geoms.end(); it++) {
    
    vector<Geom*> cgs = CheckGeomsForWindowPoint((Geom*) *it, mouse);
    gs.insert(gs.end(), cgs.begin(), cgs.end());
  }
  
  return gs;
}

void Renderer::HandleKeyDown(char key, bool shift, bool control, bool command, bool option, bool function) {
  printf("renderer is not handling KeyDown\n");    
}

void Renderer::AddUI() {
  printf("renderer is not adding a UI\n"); 
}

void Renderer::Cleanup() {
  
  printf("Cleanup???\n");
  map<string, Texture*>::iterator iter;   
  for( iter = textures.begin(); iter != textures.end(); iter++ ) {
    cout << "cleaning up Texture " << iter->first << "\n";
    
    Texture* t = iter->second;
    GLuint texid = t->texID;
    glDeleteTextures(1, &texid); 
  }
  
  glFinish();
  
}

/*
 ivec2 Renderer::Project(vec3 p) {
 vec3 wp = mat4::Project(p, camera->modelview, camera->projection, camera->viewport);
 return ivec2(wp.x, height - wp.y);
 }
 */

/*
 void Renderer::Text(float pen_x, float pen_y, string text, vec4 color ) {
 Text(CurrentFont, pen_x, pen_y, text, color, false ) ;
 }
 
 
 
 void Renderer::Text(FontAtlas* font, float pen_x, float pen_y, string text, vec4 color ) {
 Text(font, pen_x, pen_y, text, color, false ) ;
 }
 */

void Renderer::DrawText(float pen_x, float pen_y, string text, Color* color, bool usePixel ) {
  DrawText(CurrentFont, pen_x, pen_y, text, color, usePixel ) ;
}

void Renderer::DrawText(FontAtlas* font, float pen_x, float pen_y, string text, Color* color, bool usePixel ) {
  
  printf("trying to draw text!!!!\n");
  
  glClearColor( 1, 1, 1, 1 );
  glEnable( GL_BLEND );
  glBlendFunc( GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA );
  glEnable( GL_TEXTURE_2D );
  
  int fontTexWidth = font->tw;
  int fontTexHeight = font->th;
  int fontHeight = font->lineHeight;
  int base = font->base;
  float scaleW = ((float)fontHeight/(float)width)/(float)(fontHeight);
  float scaleH = ((float)fontHeight/(float)height)/(float)(fontHeight);
  float twScale = (1.0/(float)fontTexWidth);
  float thScale = (1.0/(float)fontTexHeight);
  
  size_t i;
  float x, y, w, h, s0, s1, t0, t1;
  FontData* glyph;
  
  Program* p = GetProgram("TextureAtlas");
  
  for( i=0; i < text.length(); ++i) {
    
    glyph = font->values[text[i]];
    if (glyph == NULL) {
      glyph = font->values[32];
    }
    
    printf("glyph: %c %d %d %d %d\n", glyph->val, glyph->x, glyph->y, glyph->w, glyph->h);
    //printf("screen height = %d, glyph height = %d, fontTexture w/h %d/%d\n", height, fontHeight, fontTexWidth, fontTexHeight);
    
    
    if (usePixel == true) {
      x = (pen_x + glyph->xoff) * scaleW; 
      y = (height -  pen_y + (base) - glyph->yoff) * scaleH;
    } else {
      x = pen_x + (glyph->xoff * scaleW); 
      y = pen_y + ((base - glyph->yoff) * scaleH);
    }
    w = glyph->w * scaleW;
    h = glyph->h * scaleH;
    
    // printf("v: ('%c') x y w h %f %f %f %f\n", glyph->val, x, y, w, h);
    
    s0 = glyph->x * twScale;
    s1 = (glyph->x * twScale) + (glyph->w * twScale) ;
    t0 = glyph->y * thScale;
    t1 = (glyph->y * thScale)+ (glyph->h * thScale);
    
    float ts[] = { s0, t0, 0.0, s0, t1, 0.0, s1, t1, 0.0, s0, t0, 0.0, s1, t1, 0.0, s1, t0, 0.0 };
    float vs[] = { x, y, 0.0, x, y-h, 0.0, x+w,y-h,0.0, x, y, 0.0, x+w,y-h,0.0, x+w,y, 0.0 };
    
    p->Bind(); {
      
      glUniformMatrix4fv(p->Uniform("Modelview"), 1, 0,fullScreenRect->GetModelView().Pointer());
      glUniformMatrix4fv(p->Uniform("Projection"), 1, 0, mat4::Identity().Pointer());
      
      font->fontTexture->Bind();
      glUniform1i(p->Uniform("s_tex"), 0);
      
      glUniform4fv(p->Uniform("letterColor"), 1, color->AsFloat().Pointer()); 
      
      //glUniform4f(p->Uniform("letterColor"), color.x, color.y, color.z, color.w);
      
      glVertexAttribPointer ( p->Attribute("position"), 3, GL_FLOAT, GL_FALSE, 0, vs); 
      glEnableVertexAttribArray ( p->Attribute("position") );
      
      glVertexAttribPointer ( p->Attribute("texCoord"), 3, GL_FLOAT, GL_FALSE, 0, ts); 
      glEnableVertexAttribArray ( p->Attribute("texCoord") );
      
      glDrawArrays(GL_TRIANGLES, 0, 6);
      
      glDisableVertexAttribArray ( p->Attribute("position") );
      glDisableVertexAttribArray ( p->Attribute("texCoord") );
      
      font->fontTexture->Unbind();
      
      if (usePixel == true) {
        pen_x += glyph->xadvance; 
      } else {
        pen_x += (glyph->xadvance * scaleW); // - 12;   //- (glyph->xadvance * 0.15);
      }
    } p->Unbind();
  }
  
  
  glClearColor(0,0,0, 1 );
  glDisable( GL_BLEND );
  //glBlendFunc( GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA );
  glDisable( GL_TEXTURE_2D );
}



FontAtlas* Renderer::GetFont(string font) {
  FontAtlas* thefont = fonts[font];
  if (thefont == NULL) {
    ResourceHandler* rh = ResourceHandler::GetResourceHandler();
    fonts[font] = rh->LoadFontAtlas("" + font);
    return fonts[font]; 
  }
  return thefont;
}










