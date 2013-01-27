
#include "TextRect.hpp"
#include "Renderer.hpp"
#include "Camera.hpp"


TextRect::TextRect(string _text) {
  font = Renderer::GetRenderer()->CurrentFont;
  text = _text;
  TextHeight = 1.0;
  backgroundColor = Color::RGB(0); 
  
  useTexCoords = true;
  useColors = false;
  useNormals = false;
  
  needsToBeInitialized = true;
  
  
}

TextRect::TextRect(FontAtlas* _font, string _text) {
  
  font = _font;
  text = _text;
  TextHeight = 1.0;
  backgroundColor = Color::RGB(0);   
  useTexCoords = true;
  useColors = false;
  useNormals = false;

  needsToBeInitialized = true;
}


/*
 TextRect::TextRect(vec3 _translate, float _w, float _h) {
 printf("in TextRect(vec3, float) constructor\n");
 useTexCoords = true;
 useColors = false;
 useNormals = false;
 
 SetTranslate(_translate);
 SetScale(vec3(_w, _h, 0.0));
 //width = _w;
 //height = _h;
 GenerateVertices();
 GenerateLineIndices();
 GenerateTriangleIndices();
 
 SetIsTransformed(true);
 }
 
 */

/*
int TextRect::GetVertexCount()  {    
  return 4;
}

int TextRect::GetLineIndexCount() {
  return 8; //4 line segments, each with 2 points 
}

int TextRect::GetTriangleIndexCount() {
  return 6; //2 triangles, each having 3 points 
}
*/

void TextRect::GenerateVertices() {
  
  vertices.resize(GetVertexCount() * 3);
  texCoords.resize(GetVertexCount() * 3);
  
  float* rectVertices = &vertices[0];
  float* rectTexCoords = &texCoords[0];
  
  int v_idx = 0;
  int tc_idx = 0;
  
  float yoff = TranslateYOffset; //-0.2;
  
  rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = yoff; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 0.0;
  
  rectVertices[v_idx++] = 0.0; rectVertices[v_idx++] = 1.0 + yoff; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0;
  
  rectVertices[v_idx++] = 1.0; rectVertices[v_idx++] = yoff; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 0.0;
  
  rectVertices[v_idx++] = 1.0; rectVertices[v_idx++] = 1.0 + yoff; rectVertices[v_idx++] = 0.0;
  rectTexCoords[tc_idx++] = 1.0; rectTexCoords[tc_idx++] = 0.0; rectTexCoords[tc_idx++] = 0.0;
}

/*
void TextRect::GenerateLineIndices() {
  
  lineIndices.resize(GetLineIndexCount());
  vector<unsigned short>::iterator index = lineIndices.begin();
  
  *index++ = 0;
  *index++ = 1;
  *index++ = 1;
  *index++ = 2;
  *index++ = 2;
  *index++ = 3; 
  *index++ = 3;
  *index++ = 0; 
}

void TextRect::GenerateTriangleIndices() {
  
  triangleIndices.resize(GetTriangleIndexCount());
  vector<unsigned short>::iterator index = triangleIndices.begin();
  
  *index++ = 0;
  *index++ = 1;
  *index++ = 2;
  *index++ = 2;
  *index++ = 1;
  *index++ = 3;  
}
*/

/*
void TextRect::Transform() {
  //if (IsTransformed()) {
  mat4 mv = parent->GetModelView();
  
  //mat4 mv = Renderer::GetRenderer()->GetCamera()->GetModelView();
  
  //printf("isTransformed!\n");
  //mv.Print();
  
  //translate
  mv = mat4::Translate(mv, GetTranslate());
  //mv = mat4::Translate(mv, vec3(0,-TranslateYOffset,0));
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
*/

bool TextRect::ContainsWindowPoint(ivec2 pt) {
  vec3 p0 = mat4::multiplyMatrixByVector(modelview, vec3(0,TranslateYOffset,0)); 
  vec3 p2 = mat4::multiplyMatrixByVector(modelview, vec3(1,1.0+TranslateYOffset,0)); 
  
  vec3 wp0 = mat4::Project(p0, parent->modelview, root->projection, root->viewport);
  vec3 wp2 = mat4::Project(p2, parent->modelview, root->projection, root->viewport);
  
  //printf(" p0.xy = %f/%f   p2.xy = %f/%f\n", wp0.x, wp0.y, wp2.x, wp2.y);
  if (pt.x > wp0.x && pt.x < wp2.x && pt.y > wp0.y && pt.y < wp2.y) {
    return true;
  }
  
  return false;
}


void TextRect::SetWidth(float _w) {
  
  TextHeight = _w/AspectRatio;
  
  SetScale(_w,TextHeight,1.0);
  //needsToBeInitialized = true;
  //Init();
  
}

void TextRect::SetHeight(float _h) {
  TextHeight = _h;
  SetScale(TextHeight*AspectRatio,TextHeight,1.0);
  
  //Init();
  
}

void TextRect::SetColor(Color* _c) {
  Geom::SetColor(_c);
  needsToBeInitialized = true;
  //Init();
}


void TextRect::Init() {
  
  //get font
  //Renderer* r = Renderer::GetRenderer();
  
  FontAtlas* useFont = font; //simple for now, later make able to change font after creation
  
  /*
  FontAtlas* useFont;
  if (font == NULL) {
    printf("FONT IS NULL\n");
    useFont = r->CurrentFont;
    if (useFont == NULL) {
      printf("WTF>\n");
    }
  } else {
    printf("WE OK\n");
    useFont = font;
  }
  */
  //get width and height of TextRect box in pixels
  
  int fontTexWidth = useFont->tw;
  int fontTexHeight = useFont->th;
  int fontHeight = useFont->lineHeight;
  int base = useFont->base;
  
  //loop through each char to get width
  int tw = 0;
  int th = fontHeight;
  FontData* glyph;
  for( int i=0; i < text.length(); ++i) {
    
    glyph = useFont->values[text[i]];
    if (glyph == NULL) {
      glyph = useFont->values[32];
    }
    
    tw += glyph->xadvance;
  }
  
  printf("A1");
  
//  float xScale = 1.0/(tw*0.5);
//  float yScale = 1.0/(th*0.5);
  float xScale = 1.0/(tw*0.5);  //because drawing into the clip space of the fbo which is -1.0->+1.0, i.e. w & h both = 2.0
  float yScale = 1.0/(th*0.5);
  
 // TranslateYOffset = 0;
  TranslateYOffset = -(fontHeight - base) * (yScale*0.5);
 // TranslateYOffset = -(fontHeight - base) * (yScale*1.0);
  AspectRatio = (float)tw/(float)th;
  
  //float rAR = (float)r->width/(float)r->height;
//  Camera* useC = root;
//  int vpW = root->viewport.z;
  
  float rAR = (float)(root->viewport.z)/(float)(root->viewport.w);
  AspectRatio /= rAR;
  
  SetScale(TextHeight*AspectRatio,TextHeight,1.0);
  
  //now generate the rectangle vertices  
  GenerateVertices();
  GenerateLineIndices();
  GenerateTriangleIndices();
  SetIsTransformed(true);  
  
  
  // make offscreen FBO to render into
  fontTexture = Texture::CreateEmptyTexture(tw, th);
  //fontTexture = Texture::CreateSolidTexture(vec4(0.0,1.0,0.0,0.5), tw, 300);
  
  printf("created fontTexture of size %d %d\n", tw, th);
  fontFBO = new FBO(fontTexture);  
  
  
  //render into FBO
  
  
  float twScale = (1.0/(float)fontTexWidth);
  float thScale = (1.0/(float)fontTexHeight);
  
  float pen_x = 0;
  float pen_y = 0;
  float x, y, w, h, s0, s1, t0, t1;
  
  
  fontFBO->Bind(); {
    
    DrawBackground();
    
    glClearColor( 1, 1, 1, 1 );
    glEnable( GL_BLEND );
    glBlendFunc( GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA );
    glEnable( GL_TEXTURE_2D );

    for( int i=0; i < text.length(); ++i) {
      
      glyph = useFont->values[text[i]];
      if (glyph == NULL) {
        glyph = useFont->values[32];
      }
      
      x = -1.0 + ((pen_x + glyph->xoff) * xScale);
      y = 1.0 - ( (th - glyph->yoff) * yScale);
      w = ((glyph->w * (xScale*1.0))); 
      h = (glyph->h * (yScale*1.0));
      
      //printf("TextRect Init : x,y,x,h = %f, %f, %f, %f\n", x, y, w, h);
      s0 = glyph->x * twScale;
      s1 = (glyph->x * twScale) + (glyph->w * twScale) ;
      t0 = glyph->y * thScale;
      t1 = (glyph->y * thScale)+ (glyph->h * thScale);
      
      float ts[] = { s0, t0, 0.0, s0, t1, 0.0, s1, t1, 0.0, s0, t0, 0.0, s1, t1, 0.0, s1, t0, 0.0 };
      float vs[] = { x, y, 0.0, x, y+h, 0.0, x+w,y+h,0.0, x, y, 0.0, x+w,y+h,0.0, x+w,y, 0.0 };
      
      //printf("p0 = %f/%f, p1 = %f/%f, p2 = %f/%f, p3 = %f/%f\n", x, y, x, y-h, x+w,y-h, x+w,y);
    
      
      DrawGlyph(useFont, vs, ts);
        
      pen_x += glyph->xadvance; 
    }
    
    glClearColor(0,0,0, 1 );
    glDisable( GL_BLEND );
    glBlendFunc( GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA );
    glDisable( GL_TEXTURE_2D );
  } fontFBO->Unbind();
  
  //now our fontTexture contains the backgroudn color and the TextRect string.
  
  needsToBeInitialized = false;
  
}


void TextRect::DrawGlyph(FontAtlas* font, float* vs, float* ts) {
 
  Renderer* r = Renderer::GetRenderer();
  Program* p = r->GetProgram("TextureAtlas");
  
  p->Bind(); {
    
    glUniformMatrix4fv(p->Uniform("Modelview"), 1, 0, mat4::Identity().Pointer());
    //glUniformMatrix4fv(p->Uniform("Projection"), 1, 0, r->GetCamera()->projection.Pointer());
    glUniformMatrix4fv(p->Uniform("Projection"), 1, 0, mat4::Identity().Pointer());
    
    font->fontTexture->Bind();
    glUniform1i(p->Uniform("s_tex"), 0);
    
    
    glUniform4fv(p->Uniform("letterColor"), 1, color->AsFloat().Pointer());
    
    //glUniform4f(p->Uniform("backgroundColor"), 0.0, 1.0, 0.0, 1.0);
    
    glVertexAttribPointer ( p->Attribute("position"), 3, GL_FLOAT, GL_FALSE, 0, vs); 
    glEnableVertexAttribArray ( p->Attribute("position") );
    
    glVertexAttribPointer ( p->Attribute("texCoord"), 3, GL_FLOAT, GL_FALSE, 0, ts); 
    glEnableVertexAttribArray ( p->Attribute("texCoord") );
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray ( p->Attribute("position") );
    glDisableVertexAttribArray ( p->Attribute("texCoord") );
    
    font->fontTexture->Unbind();
    
    
  } p->Unbind();
 
}

void TextRect::SetBackgroundColor(Color* _c) {
  backgroundColor = _c;
  needsToBeInitialized = true;
  //Init();
}



void TextRect::DrawBackground() {
  
  Renderer* r = Renderer::GetRenderer();
  
  Program* p2 = r->GetProgram("FlatShader");

  float x0 = -1.0;
  float x1 = 1.0;
  float y0 = -1.0;
  float y1 = 1.0;

  float backgroundVs[] = { x0,y0, 0.0,   x0,y1, 0.0, x1,y1, 0.0,  x0,y0, 0.0, x1,y1,0.0, x1,y0, 0.0 };
  
  p2->Bind(); {
    glUniformMatrix4fv(p2->Uniform("Modelview"), 1, 0, mat4::Identity().Pointer());
    glUniformMatrix4fv(p2->Uniform("Projection"), 1, 0, mat4::Identity().Pointer());
    glUniform4fv(p2->Uniform("Color"), 1, backgroundColor->AsFloat().Pointer());
    
    glVertexAttribPointer ( p2->Attribute("position"), 3, GL_FLOAT, GL_FALSE, 0, backgroundVs); 
    glEnableVertexAttribArray ( p2->Attribute("position") );
    
    glDrawArrays(GL_TRIANGLES, 0, 6);
    
    glDisableVertexAttribArray ( p2->Attribute("position") );
  } p2->Unbind();
}

void TextRect::Draw() {
  
  if (needsToBeInitialized == true) {
    Init();
  }
  
  glClearColor( 1, 1, 1, 1 );
  glEnable( GL_BLEND );
  glBlendFunc( GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA );
  glEnable( GL_TEXTURE_2D );
  
  Renderer* r = Renderer::GetRenderer();
  
  Program* program = r->GetProgram("SingleTexture");
  program->Bind(); {
    
    glUniformMatrix4fv(program->Uniform("Modelview"), 1, 0, modelview.Pointer());
   // glUniformMatrix4fv(program->Uniform("Projection"), 1, 0, mat4::Identity().Pointer());
    glUniformMatrix4fv(program->Uniform("Projection"), 1, 0, root->projection.Pointer());
    
    fontTexture->Bind(GL_TEXTURE0); {
      
      glUniform1i(program->Uniform("s_tex"), 0);
      PassVertices(program, GL_TRIANGLES);
      
    } fontTexture->Unbind(GL_TEXTURE0);
  } program->Unbind();
  
  
  glClearColor(0,0,0, 1 );
  glDisable( GL_BLEND );
  //glBlendFunc( GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA );
  glDisable( GL_TEXTURE_2D );
  
}

