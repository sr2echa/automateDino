var watCode = null;

var asmscript = `(module
  (memory (export "memory") 1)
  (func (export "pid") (param $speed f32) (param $distance f32) (param $obstacleHeight f32) (param $obstacleType i32) (result i32)
    (local $jumpThreshold f32)
    local.get $speed
    f32.const 8.0
    f32.div
    f32.const 125.0
    f32.mul
    local.set $jumpThreshold
    local.get $distance
    local.get $jumpThreshold
    f32.lt
    if (result i32)
      local.get $obstacleType
      i32.const 1
      i32.eq
      if (result i32)
        local.get $obstacleHeight
        f32.const 50.0
        f32.ne
        if (result i32)
          i32.const 1
        else
          i32.const 0
        end
      else
        i32.const 1
      end
    else
      i32.const 0
    end
  )
)`;

var base64EncodedAsm = btoa(asmscript);
var xhr = new XMLHttpRequest();
xhr.open('GET', `https://ascscript.sreechar.repl.co/convert/${base64EncodedAsm}`, false);
xhr.send();
if (xhr.status === 200) { watCode = xhr.responseText; } else { console.error('Error fetching data. Check your internet connection. Use chrome://dino to test locally (and not by switching off the internet :)'); }
var wasmBinary = Uint8Array.from(atob(watCode), c => c.charCodeAt(0));
WebAssembly.compile(wasmBinary.buffer).then(wasmModule => WebAssembly.instantiate(wasmModule)).then(wasmInstance => { window.pid = wasmInstance.exports.pid; });

function automateDino() {
  if (!window.pid) return;
  var tRex = Runner.instance_.tRex, horizon = Runner.instance_.horizon;
  if (!tRex || !horizon.obstacles.length) return;
  var obstacle = horizon.obstacles[0],
      obstacleType = obstacle.typeConfig.type === 'PTERODACTYL' ? 1 : 0,
      action = window.pid(
        Runner.instance_.currentSpeed,
        obstacle.xPos - tRex.xPos,
        obstacle.yPos,
        obstacleType
      );

  if (action === 1 && !tRex.jumping) {
    var keyEvent = new KeyboardEvent('keydown', { keyCode: 38 });
    document.dispatchEvent(keyEvent);
    setTimeout(function() { document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 38 })); }, 150); }
}

setInterval(automateDino, 1);
