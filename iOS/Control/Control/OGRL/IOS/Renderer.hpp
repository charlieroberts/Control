//#include "ApplicationHandler.hpp"


#include <map>

#include "Program.hpp"
#include "Cube.hpp"
#include "Texture.hpp"
#include "Rectangle.hpp"
#include "FBO.hpp"
//#include <map>
#include <vector>
#include <set>

#include "Camera.hpp"
#include "Vector.hpp"
#include "Matrix.hpp"
#include "FontAtlas.hpp"



#ifndef RENDERER_H
#define RENDERER_H


class Renderer : public Geom {
  
public:
  static Renderer* GetRenderer();
  
  Renderer(); 
  virtual void Initialize() = 0;
  void Render();
  
  // void RenderChildren(Geom* g, bool cameraMoved); //if cameraMoved, then need to re-Transform everything
  
  //from Geom->Modelview
  void Transform();
  
  
  /* 
   isReady is set only after IOS view is completely loaded (in the ViewController). 
   Problems occur is we try to render before the view is loaded.
   */
  bool isReady; 
  
  /* 
   isRendering is set right before and right after Render is called from the GLView. Not sure if this is needed.
   */
  bool isRendering;
  
  /* 
   Programmatically add UI elements by overriding the AddUI method. to do... if we care
   */
  virtual void AddUI();
  
  int width, height;
  void CreateRenderBuffer();
  void InitializeRenderBuffers();
  
  void Reshape(int width, int height);
  
  map<string, Program*>& GetPrograms();
  map<string, Texture*>& GetTextures();
  map<string, FBO*>& GetFbos();
  
  map<string, Camera*>& GetCameras(); //get all cameras
  Camera* GetCamera(); //get default camera
  //void SetCamera(Camera* _c); //set a single default camera
  Camera* InstallDefaultCamera(Camera* _c);
  Camera* InstallCamera(string cameraName, Camera* _c);
  
  
  bool AddGeom(Geom* _g); // add a geom to the default camera
  bool RemoveGeom(Geom* _g); //remove a geom from the default camera
  
  
  
  mat4 GetModelView();
  
  vector<Geom*> CheckGeomsForWindowPoint(Geom* parent, ivec2 mouse);
  vector<Geom*> GetGeomsContainingWindowPoint(ivec2 windowPt);
  
  void SetGyroscopeMatrix(mat4 _mvm);
  
  
  
  virtual void HandleKeyDown(char key, bool shift, bool control, bool command, bool option, bool function);
  
  void Cleanup();
  
  FontAtlas* CurrentFont;
  
  //  void Text(float pen_x, float pen_y, string text, vec4 color );
  void DrawText(float pen_x, float pen_y, string text, Color* color, bool usePixel );
  //  void Text(FontAtlas* font, float pen_x, float pen_y, string text, vec4 color );
  void DrawText(FontAtlas* font, float pen_x, float pen_y, string text, Color* color, bool usePixel );
  //  void Text(vec3 offsetPt, string text, vec4 color);
  
  FontAtlas* GetFont(string font);
  Program* GetProgram(string programName);
  
  void BindDefaultFrameBuffer();
  Rectangle* fullScreenRect;
  
  //ivec2 Project(vec3 p);
  
  
protected: 
  FBO* CreateFBO(string FBOName, Texture* texture);
  Texture* CreateTexture(string TextureName, Texture* texture);
  
  
  Camera* camera; //the default camera, + the only thing in the cameras array most of the time.
  
  map<string, Camera*> cameras; //list of all cameras
  map<string, Program*> programs;
  map<string, Texture*> textures;
  map<string, FBO*> fbos;
  map<string, FontAtlas*> fonts;
  
  
  
  
  void updateGeoms(bool cameraMoved);
  Program* LoadProgram(string programName);
  Program* LoadProgram(string programName, string vsh, string fsh);
  
  
  
  GLuint m_colorRenderbuffer;
  GLuint m_depthRenderbuffer;
  
  mat4 gyroscopeMatrix;
  
  GLuint defaultFBO;
  void DrawFullScreenTexture(Texture* t);
  void CreateFullScreenRect();
  
  void PrintGLSLInfo();
  void PrintGLVersion();
  
  
private:
  static Renderer* instance;
  void LoadDefaultPrograms();
  
  
};
#endif
