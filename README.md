> [!WARNING]
> If you are here for the fun part, screw all these long paras and lets jump right in! [Click Here :)](https://github.com/sr2echa/automateDino#how2run)

# Preface
IEEE Comsoc recruitment had this `Task: Develop a dino game automator`

It could have been completed in few lines of js _(The easier and well known + popularized way)_ or done in python with opencv _(the way Comsoc wanted to see it implemented as mentioned in the task details - "Use Python")_

First approach is often plagerized and the second one is just way too unnecessary. 
Both of these really weren't something of an _overengineered_ solution so the idea of implementing them didnt fit [@sr2echa](https://github.com/sr2echa) style.

So i came up with **2 approaches** that I could fit my standards :
1. `Train a Reinforced Learning ML model  ` → Taking the Python implementation to extreme
2. `Use WebAssembly                       ` → Making the javascript implementation on sterroids

**Then after a lot of delebration.....<br>
Presenting you with...**

#### A [PID function](https://en.wikipedia.org/wiki/Proportional%E2%80%93integral%E2%80%93derivative_controller) implimented in WebAssembly Text (Assembly Script) to calculate when to jump based on various parameters.

> [!NOTE]
> <samp>What has been implemented is just the P part of the PID. We dont need the Precision levels of I & D in this simple usecase.</samp>

# Implementation
The code can be found @ [automateDino.js](./automateDino.js)

> [!IMPORTANT]
> Browsers dont support native injection of WebAssembly nor do they have access to Browser APIs. This Limits WebAssembly useage to just computational tasks where it excels javascript a million times.<br><br>
> So in this approach, we will be using javascript as the driver code to compile our WAT to WASM <samp>(using a hosted api whoes backend is [app.py](./api/app.py))</samp> and to simulate the keypress in the browser scope.

##### This is the WAT
```asm
(module
  (memory (export "memory") 1)

  ;; Function to decide whether to jump or eat 5star.
  ;; Params: speed (f32), distance (f32), obstacleHeight (f32), obstacleType (i32)
  ;; Returns: i32 (0 → no action & 1 → jump)

  (func (export "pid") (param $speed f32) (param $distance f32) (param $obstacleHeight f32) (param $obstacleType i32) (result i32)
    (local $jumpThreshold f32)
    
    ;; Dynamically set jump threshold based on speed [threshold = (speed / 8) * 125]
    local.get $speed
    f32.const 8.0
    f32.div
    f32.const 125.0
    f32.mul
    local.set $jumpThreshold

    local.get $distance
    local.get $jumpThreshold
    f32.lt
    if (result i32)  ;; If the obstacle is within jump threshold
      local.get $obstacleType
      i32.const 1
      i32.eq
      if (result i32)  ;; If the obstacle is 🐦
        local.get $obstacleHeight
        f32.const 50.0
        f32.ne
        if (result i32)  ;; If bird's yPos is not 50, recommend to jump 
          i32.const 1
        else  ;; If bird's yPos is 50, do nothing :: The bird is flying high, above the dino
          i32.const 0
        end
      else  ;; It is just a 🌵
        i32.const 1  ;; Recommend to jump
      end
    else
      i32.const 0  ;; Eat 5star do nothing
    end
  )
)
```
**🔑 Points :**
 - Threshold is the least distance at which the dino ought to jump.
 - Threshold is calculated by $`\frac{\text{speed}}{8} \times 125`$
 - `125` and `8` are arbiterary values derrived based on intensive experimentation. <samp>(Note : Speed is of range 6 to 13)</samp>
 - We do not implement ducking. Instead we jump when the 🐦 is not flying high <samp>( yPos = 75 (medium) & yPos = 100 (low) )</samp> and do nothing when it is flying high <samp>( yPos = 50 (high) )</samp>

# Performance
The Results were amazing. The dino never dies when you set a constant speed below 11. The implementation works amazing for high speeds as well. The only reason the dino dies is due to generation of obstacles in distance shorter than the distance travelled in air during a single jump. The distance travelled in air during a jump is directly propotional to the speed (as the air time of a single jump is fixed). This is why we [Propotionally](https://en.wikipedia.org/wiki/Proportional%E2%80%93integral%E2%80%93derivative_controller) calculate the jump threshold so we land and have time for the next jump. This change boosted the score by 560%!

# But why? Was it worth it?
WebAssembly seemed fun (and is fun). I wanted to use IEEE ComSoc Interview as an excuse and build an extension that could inject WebAssembly into the webpage instance and make it a liberary so people could build upon it and we can see cool stuff popup built in WebAssembly <samp>(_serious Overengineering_)</samp>. But due to various browser constraints and a time crunch, I was not able to put in the full dedication and effort to make it posssible. It is something totally possible and I wish to resume this one day. 

Practically speaking, using WebAssembly here is of no practical benifit. It is a mere gimick. WebAssembly's performance gains will be significant when implemented for highly computational tasks. I would still consider it worth it as it gave me an opportunity to get a glimse of WebAssembly and how to implement it in the browser webpage runtime. 

##### Now to the most awaited part...
# Result

https://github.com/sr2echa/automateDino/assets/65058816/7165bdc9-f950-47e4-9c58-774689813253


# How2run
**STEP 1 :** Go to [`chrome://dino`](chrome//dino)              <br>
**STEP 2 :** Open Dev Tools by clicking `Ctrl` + `Shift` + `I`  <br>
**STEP 3 :** Navigate to the console tab in Dev Tools           <br>
**STEP 4 :** Paste this code and press `[Enter]`                
```js
fetch('https://automatedino.sreecha.io/automateDino.js').then(response => response.text()).then(script => eval(script));
```
**STEP 5 :** Eat 5star and watch it run!

---
<samp> ©️ [MIT License](LICENSE) </samp>
