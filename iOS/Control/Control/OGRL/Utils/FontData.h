

#ifndef OpenGLRenderLibraryNS_FontData_h
#define OpenGLRenderLibraryNS_FontData_h


class FontData { 

public:
  
  FontData();
  FontData(char _val, int _x, int _y, int _w, int _h, int _xoff, int _yoff, int _xadvance);
  
  char val;
  int x;
  int y;
  int w;
  int h;
  int xoff;
  int yoff;
  int xadvance;
};

#endif
