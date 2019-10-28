//see https://nodejs.org/zh-cn/docs/guides/timers-in-node/
//var sleep = require('sleep'); //改用 setTimeout or setInterval
var rti   = require('rticonnextdds-connector');
var child_process = require('child_process');

var connector = new rti.Connector("MyParticipantLibrary::Zero",__dirname + "/xml/message_sub.xml");
var input = connector.getInput("MySubscriber::MySquareReader");

console.log('[Publisher]', 'initalize');

var child1 = child_process.fork(__dirname + '/02_sub');
//console.log("@sub.child1.pid:",child1.pid)

child1.on('message', function(msg) { 
    console.log('@child1.on:', msg); 
    //child1.send("@test start child1...");
});

var child2 = child_process.fork(__dirname + '/02_sub');
//console.log("@sub.child1.pid:",child2.pid)

var child3 = child_process.fork(__dirname + '/02_sub');
//console.log("@sub.child1.pid:",child3.pid)

var ID;
child1.send("@test start child1...");

//var buffer[];

function main_loop() {
    //console.log("msub: Waiting for samples...");
    input.take();
    for (var i=0; i < input.samples.getLength(); i++) {
      if (input.infos.isValid(i)) {
        //console.log(JSON.stringify(input.samples.getJSON(i)));
        var xx=input.samples.getJSON(i);
        //console.log("pub:",JSON.stringify(xx));
        if(xx.ID==0)
            child1.send(xx);
        if(xx.ID==1)
            child2.send(xx);
        if(xx.ID==2)
            child3.send(xx);
      }
    }
    
    //sleep.sleep(2);
}

const intervalObj = setInterval(main_loop, 1); //msec
//clearInterval(intervalObj) //kill timer
