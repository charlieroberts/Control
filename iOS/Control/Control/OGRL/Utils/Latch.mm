
#import "Latch.hpp"

Latch::Latch() {
  token = 0;
  state = 0;
}

//true = good to go, false = latched
bool Latch::CheckLatch(int process) {
  
  printf("in checkLatch : PROCESS:%d TOKEN:%d STATE:%d \n", process, token, state);
  
  if (token != process && state == 0) { //other process not yet done
    return false;
  } else if (token == process && state == 1) { //other process not yet started
    return false;
  } else { //other process is done
    token = process; //switch token
    state = 0;
    return true;
  }
}

void Latch::ReleaseLatch() {
  state = 1;
}
