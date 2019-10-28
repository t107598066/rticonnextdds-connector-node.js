//see https://nodejs.org/zh-cn/docs/guides/timers-in-node/
//console.log("process:",process)
// here one listens for new tasks from the parent
process.on('message', function(messageFromParent) {
    if(messageFromParent=="@test start child1...")
        console.log('@process.on:',messageFromParent);
    if(messageFromParent.msg=="hi"){
        locationdata=JSON.parse(messageFromParent.data);
        console.log('Get data:',locationdata);
        //console.log('@process.on:',messageFromParent);
        ID=messageFromParent.ID;
        //upLoadFile(JSON.stringify(locationdata));

        get_hi=1;
    }
    if(messageFromParent.msg=="t2"){
        locationdata=JSON.parse(messageFromParent.data);
        console.log('Get data:',locationdata);
        //console.log('@process.on:',messageFromParent);
        t2=messageFromParent.time;
        ID=messageFromParent.ID;
        //upLoadFile(JSON.stringify(locationdata));

        push(ID,t2);
        get_t2=1;
    }
    if(messageFromParent.msg=="t3"){
        t4=now();
        locationdata=JSON.parse(messageFromParent.data);
        console.log('Get data:',locationdata);
        ID=messageFromParent.ID;
        //console.log('@process.on:',messageFromParent);
        t3=messageFromParent.time;

        push(ID,t3);
        push(ID,t4);

        get_t3=1;
    }
});

//var sleep = require('sleep'); //改用 setTimeout or setInterval
var rti   = require('rticonnextdds-connector');
var now = require('nano-time');
var fs = require('fs');
var path = require('path');
var request = require("request");
var util = require('util');

var connector = new rti.Connector("MyParticipantLibrary::Zero",__dirname + "/xml/message_pub.xml");
var output = connector.getOutput("MyPublisher::MySquareWriter");

var ID;
var list= new Array(5).fill(new Array(4));
var listp=new Array(5).fill(0);
//let list=[];//分ID，[0]~[3]存t1~t4
var x=0;
var y=0;
var z=0;
var q=0;
var get_hi=0;
var get_t2=0;
var get_t3=0;
var t1=0;
var t1_real=0;
var t2=0;
var t3=0;
var t4=0;
var ms_diff=0;
var sm_diff=0;
var offset=0;
var delay=0;
var total=0;
var period=0;
var total_period=0;
var jitter=0;
var ss_rx=0;
var locationdata=0;
//process.send("send from 01_sub");

var i =0;
function push(ID,xx){
    var j=listp[ID];
    list[ID][j]=xx;
    listp[ID]=j+1;
}
function pop(ID){
    var j=listp[ID];
    listp[ID]=j-1;
    return listp[ID];
}


async function main_loop() {
    // We clear the instance associated to this output
    //   otherwise the sample will have the values set in the
    //   previous iteration
    output.clear_members();

    //when recieve PTP announce, send t1
    if(get_hi==1){
        t1=now();
        //console.log("t1:",t1);
        output.instance.setNumber("ID", ID);
        output.instance.setString("msg", "t1");
        output.instance.setNumber("time",t1);

        //console.log("sub: Writing...");
        output.write();
        t1_real=now();
        t1=t1_real;
        //list[ID].push(t1);
        push(ID,t1);
        get_hi=0;
    }

    //when recieve t2
    if(get_t2==1){

        get_t2=0;
    }

    //when recieve t3, get t4 and calculate, then send total
    if(get_t3==1){

        /*
        console.log("t1:",list[ID][0]);
        console.log("t2:",list[ID][1]);
        console.log("t3:",list[ID][2]);
        console.log("t4:",list[ID][3]);
        */

        console.log("");
        ms_diff=t2-t1;
        sm_diff=t4-t3;
        offset = (ms_diff-sm_diff)/2;
        delay = (ms_diff+sm_diff)/2;
        total = offset + delay;

        //console.log("ID:",ID,"offset:",offset/1000000," ms");
        console.log("ID:",ID,"delay:",delay/1000000," ms");

        /*
        if(offset==0){
            console.log("server & client",ID," same fast");
            console.log("");
        }
        if(offset>0){
            console.log("client",ID," faster");
            console.log("");
        }
        if(offset<0){
            console.log("server faster");
            console.log("");
        }
        */

        output.instance.setNumber("ID", ID);
        output.instance.setString("msg", "total");
        output.instance.setNumber("time",total);
        //console.log("sub: Writing...");
        output.write();

        //calculate
        period =t4-t1;
        total_period += period;
        ss_rx+=1;
        jitter =period-(total_period/ss_rx);
        console.log("ID:",ID,"jitter:",jitter/1000000," ms");

        var performance=[{
            x:locationdata[0].x,
            y:locationdata[0].y,
            z:locationdata[0].z,
            q:locationdata[0].q,
            delay:delay/1000000,
            jitter:jitter/1000000,
        }];
        //console.log("performance:",performance);
        //upLoadFile(JSON.stringify(performance));//upload t3-location & delay jitter

        console.log("=================================");

        pop(ID);
        pop(ID);
        pop(ID);
        pop(ID);

        get_t3=0;
    }

    //sleep.sleep(1);
    //process.send("send from 01_sub");
    i+=1;

}

async function upLoadFile(obj)
{
	await request({
		uri: "http://3.84.218.73:8081/coordinate",
        //uri: "http://140.124.182.21:8081/coordinate",
		method: "POST",
		form: {
			obj : obj
		},
		encoding: null,
		json: true
	},function(error , response , body){
		//ok = 成功 , error = 失敗
		console.log(body.toString());
	});
}

const intervalObj = setInterval(main_loop, 1000); //msec
//clearInterval(intervalObj) //kill timer
