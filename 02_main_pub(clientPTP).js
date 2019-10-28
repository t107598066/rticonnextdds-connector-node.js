//see https://nodejs.org/zh-cn/docs/guides/timers-in-node/
//var sleep = require('sleep'); //改用 setTimeout or setInterval
var rti   = require('rticonnextdds-connector');

var ID=0;
var connector = new rti.Connector("MyParticipantLibrary::Zero",__dirname + "/xml/message_pub.xml");
var input = connector.getInput("MySubscriber::MySquareReader");

var child_process = require('child_process');
console.log('[Publisher]', 'initalize');

var child1 = child_process.fork(__dirname + '/02_pub');
console.log("@pub.child1.pid:",child1.pid)

child1.on('message', function(msg) { 
    console.log('@child1.on:', msg); 
});

child1.send("@test start child1...");

function main_loop() {
    //console.log("Waiting for samples...");
    input.take();
    for (var i=0; i < input.samples.getLength(); i++) {
      if (input.infos.isValid(i)) {
        var xx=input.samples.getJSON(i);
        //console.log("pub:",JSON.stringify(xx));
        //console.log("@msg:",xx.msg);
        //console.log("@time:",xx.time);
        if(xx.ID==ID)
            child1.send(xx);
      }
    }

    //sleep.sleep(2);
}

const intervalObj = setInterval(main_loop, 1); //msec
//clearInterval(intervalObj) //kill timer
