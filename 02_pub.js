//see https://nodejs.org/zh-cn/docs/guides/timers-in-node/
var sleep = require('sleep'); ////改用 setTimeout or setInterval
// here one listens for new tasks from the parent
process.on('message', function(messageFromParent) {
    if(messageFromParent=="@test start child1...")
        console.log('@process.on:',messageFromParent);
    if(messageFromParent.msg=="t1"){
        t2=now();
        //console.log('@process.on:',messageFromParent);
        t1=messageFromParent.time;
        get_t1=1;
    }

    if(messageFromParent.msg=="total"){
        //console.log('@process.on:',messageFromParent);
        total=messageFromParent.time;
        clock =now()-total;
        localtime = new Date(clock/1000000);
        console.log("Renew time:",localtime.toString());
        console.log("");

        set_hi=0;
        //set_hi=1;//for one test
    }
});

var rti   = require('rticonnextdds-connector');
var now = require('nano-time');
var fs = require('fs');
var path = require('path');

var request = require("request");
var util = require('util');

var connector = new rti.Connector("MyParticipantLibrary::Zero",__dirname + "/xml/message_sub.xml");
var output = connector.getOutput("MyPublisher::MySquareWriter");
var mqtt = require('mqtt');

var opt = {
	port:1883, //port
	clientId:'pc_receive' // client id
};
var client = mqtt.connect('mqtt://169.254.82.192',opt);

client.on('connect',function(){
	console.log('connect to mqtt server success!!!');
	client.subscribe('dwm/node/47b9/uplink/location');//這邊不確定47b9會不會變
});

client.on('message',function(topic,msg){
    var location_info=msg.toString();
    location_info = JSON.parse(location_info);
      // console.log("AAA",location_info);
    if(location_info.position.x !== 'NaN')
    {
      console.log("1111main_loop",location_info);
      main_loop(location_info)
    }
});

var ID=0;
var set_hi=0;
var get_t1=0;
var get_t2=0;
var get_t3=0;
var t1=0;
var t2=0;
var t3=0;
var total=0;
var clock=0;
var localtime=0;
var i =0;


async function main_loop(location_info) {
    if(typeof location_info !== 'undefined'){
      console.log("main_loop",location_info);
      // We clear the instance associated to this output
      //   otherwise the sample will have the values set in the
      //   previous iteration

      output.clear_members();
      //sent PTP announce
      if(set_hi==0){
          /*
          output.instance.setNumber("ID", ID);
          output.instance.setString("msg", "hi");
          console.log("Writing...");
          */
          console.log("set_hi",location_info);
          await dataoperation(ID,"hi",0,location_info)


          set_hi=1;
          get_t1=1;
          sleep.msleep(100);
      }

      //when receive t1, send t2 and t3
      if(get_t1==1){
          //console.log("t2:",t2);
          /*
          output.instance.setNumber("ID", ID);
          output.instance.setString("msg", "t2");
          output.instance.setNumber("time",t2);
          console.log("sub: Writing...");
          output.write();
          */
          console.log("get_t1",location_info);
          await dataoperation(ID,"t2",t2,location_info)
          get_t1=0;
          get_t2=1;
          sleep.msleep(100);//避免server還收不到t2
      }
      if(get_t2==1){
          t3=now();
          //console.log("t3:",t3);
          /*
          output.instance.setNumber("ID", ID);
          output.instance.setString("msg", "t3");
          output.instance.setNumber("time",t3);
          console.log("sub: Writing...");
          output.write();
          */
          console.log("get_t2",location_info);
          await dataoperation(ID,"t3",t3,location_info)
          get_t2=0;
          sleep.msleep(100);
      }
    }
}

async function dataoperation(ID,msg,time,location_info){
	output.clear_members();
    output.instance.setNumber("ID", ID);
    output.instance.setString("msg", msg);
    output.instance.setNumber("time",time);
    //console.log("Writing...");

    //==========車子的資料請寫在這裡==========
    // var xx=[{
    //     x:1,
    //     y:2,
    //     z:3,
    //     q:60,
    // }];
    // if(data.position.x != 'NaN')
    // {


      console.log(location_info);

      var location_info_json=[{
           'x':location_info.position.x,
           'y':location_info.position.y,
           'z':location_info.position.z,
           'q':location_info.position.quality,
         }];

      var data=JSON.stringify(location_info_json);
      output.instance.setString("data", data);
      output.instance.setString("file",String(time)); //file name
      console.log("Writing...");
      output.write();
      i=i+1;




    // }

    //========================================
    // console.log("location:",xx);
    // var data=JSON.stringify(xx);
    //
    // output.instance.setString("data",data);
    // output.instance.setString("file",String(time)); //file name
    // output.write();
}

const intervalObj = setInterval(main_loop, 1000); //msec
//clearInterval(intervalObj);//kill timer
