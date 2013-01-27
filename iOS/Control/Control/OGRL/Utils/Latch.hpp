
#ifndef OpenGLRenderLibrary_Latch_h
#define OpenGLRenderLibrary_Latch_h

//a mutex

class Latch {
  
public:
  Latch();
  
  bool CheckLatch(int process);
  void ReleaseLatch();
  
private:
  int token;
  int state; //0 = block, 1 = released
};

#endif
