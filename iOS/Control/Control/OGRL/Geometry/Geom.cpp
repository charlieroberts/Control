
#include "Geom.hpp"
#include "Renderer.hpp"

Geom::Geom() {
  //printf("in Geom::Geom()\n");
  SetColor(Color::Float(1.0f,1.0f,1.0f,1.0f)); //default color is white (for now, should be able to change this programmatically)
  IsSelectable = false; //default selectability is false
  parent = NULL; 
  
  //temp border testing
  drawBorder = false;
  borderColor = Color::RGB(255);

}



Program* Geom::GetProgram(string _p) {
  Renderer* r = Renderer::GetRenderer();
  return r->GetProgram(_p);
}

vector<Geom*>& Geom::GetGeoms() {
  return geoms;
}

bool Geom::AddGeom(Geom* _g) {
  _g->parent = this;
  _g->root = this->root; //i.e. the camera
  geoms.push_back(_g);
  //geoms.insert(0,_g);
  return 1; //later make a real test- ie if it's already in there...
}

bool Geom::RemoveGeom(Geom* _g) {
  //set<Geom*>::iterator it = geoms.find(_g);  
  
  geoms.erase( std::find( geoms.begin(), geoms.end(), _g ));
  //geoms.erase(geoms.find(_g));
  return 1;  //later make a real test- ie if it was there to be removed...
}

void Geom::Draw() {
  
  //default draw method - assumes using only vertices - flat shader
  Program* program = GetProgram("FlatShader");
  
  program->Bind(); {
    glUniformMatrix4fv(program->Uniform("Modelview"), 1, 0, GetModelView().Pointer());
    glUniformMatrix4fv(program->Uniform("Projection"), 1, 0, root->projection.Pointer());
    glUniform4fv(program->Uniform("Color"), 1, GetColor()->AsFloat().Pointer());
    PassVertices(program, GL_TRIANGLES);
  } program->Unbind();
  
  
  //  glLineWidth(2);
  //testing... really need another shader for this to do better borders
  if (drawBorder == true) {
    program->Bind(); {
      glUniformMatrix4fv(program->Uniform("Modelview"), 1, 0, GetModelView().Pointer());
      glUniformMatrix4fv(program->Uniform("Projection"), 1, 0, root->projection.Pointer());
      //glUniform4fv(program->Uniform("Color"), 1, GetColor()->AsFloat().Pointer());
      glUniform4fv(program->Uniform("Color"), 1, borderColor->AsFloat().Pointer());
      PassVertices(program, GL_LINES);
    } program->Unbind();
  }
 
    
}

/*
void Geom::SetColor(float r, float g, float b, float a) {
  SetColor(vec4(r,g,b,a));
}

void Geom::SetColor(float r, float g, float b) {
  SetColor(vec4(r,g,b,1.0));
}
*/
void Geom::SetColor(Color* _Color) {
  color = _Color;
}

Color* Geom::GetColor() {
  return color;
}

void Geom::Text(float pen_x, float pen_y, string text, Color* color ) {
  Renderer* r = Renderer::GetRenderer();
  r->DrawText(r->CurrentFont, pen_x, pen_y, text, color, false ) ;
}

void Geom::Text(float pen_x, float pen_y, string text, Color* color, bool usePixel ) {
  Renderer* r = Renderer::GetRenderer();
  r->DrawText(r->CurrentFont, pen_x, pen_y, text, color, usePixel ) ;
}

void Geom::Text(FontAtlas* font, float pen_x, float pen_y, string text, Color* color ) {
  Renderer* r = Renderer::GetRenderer();
  r->DrawText(font, pen_x, pen_y, text, color, false ) ;
}

void Geom::Text(FontAtlas* font, float pen_x, float pen_y, string text, Color* color, bool usePixel ) {
  Renderer* r = Renderer::GetRenderer();
  r->DrawText(font, pen_x, pen_y, text, color, usePixel ) ;
}

void Geom::Text(vec3 offsetPt, string text, Color* color) {
  Renderer* r = Renderer::GetRenderer();
  vec3 p0 = mat4::multiplyMatrixByVector(modelview, offsetPt); 
  ivec2 wp0 = root->Project(p0);
  r->DrawText(wp0.x, wp0.y, text, color, true); 
}

bool Geom::ContainsWindowPoint(ivec2 windowPt) {
  //printf("This object does not yet support checking if it contains a window point... to do...\n");
  //we should iterate through all vertices, project them into 2D space, and then see if the point is inside all of them
  
  return false; //default is false... need to be implemented by each Geom
}


void Geom::Transform() {
  //if (IsTransformed()) {
    
  mat4 mv = parent->GetModelView();
  
  //mat4 mv = Renderer::GetRenderer()->GetCamera()->GetModelView();
  
  //printf("isTransformed!\n");
  //mv.Print();
  
  
  //translate
  mv = mat4::Translate(mv, GetTranslate());
  
  //scale
  mv = mat4::Translate(mv, scaleAnchor);
  mv = mat4::Scale(mv, GetScale());
  mv = mat4::Translate(mv, -scaleAnchor);
  
 
  
  //rotate
  mv = mat4::Translate(mv, rotateAnchor);
  mv = mat4::RotateX(mv, GetRotate().x);
  mv = mat4::RotateY(mv, GetRotate().y);
  mv = mat4::RotateZ(mv, GetRotate().z);
  mv = mat4::Translate(mv, (-rotateAnchor));
  
  
  SetModelView(mv);
  SetIsTransformed(false);
  //}
}

void Geom::HandleTouchBegan(ivec2 mouse) {
  printf("Geom::HandleTouchBegan, not handled\n");
}
void Geom::HandleTouchMoved(ivec2 prevMouse, ivec2 mouse) {
  printf("Geom::HandleTouchMoved, not handled\n");
}
void Geom::HandleTouchEnded(ivec2 mouse) {
  printf("Geom::HandleTouchEnded, not handled\n");
}
void Geom::HandleLongPress(ivec2 mouse) {
  printf("Geom::HandleLongPress, not handled\n");
}
void Geom::HandlePinch(float scale) {
  printf("Geom::HandlePinch, not handled\n");
}
void Geom::HandlePinchEnded() {
  printf("Geom::HandlePinchEnded, not handled\n");
}

