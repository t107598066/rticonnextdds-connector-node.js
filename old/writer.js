/******************************************************************************
* (c) 2005-2015 Copyright, Real-Time Innovations.  All rights reserved.       *
* No duplications, whole or partial, manual or electronic, may be made        *
* without express written permission.  Any such copies, or revisions thereof, *
* must display this notice unaltered.                                         *
* This code contains trade secrets of Real-Time Innovations, Inc.             *
******************************************************************************/
var sleep = require('sleep');
var rti   = require('rticonnextdds-connector');

var connector = new rti.Connector("MyParticipantLibrary::Zero",__dirname + "/xml/message_sub.xml");
var output = connector.getOutput("MyPublisher::MySquareWriter");
var data;
var mqtt = require('mqtt');
var opt = {
	port:1883, //port
	clientId:'pc_receive' // client id
};
var client = mqtt.connect('mqtt://169.254.122.188',opt);

client.on('connect',function(){
	console.log('connect to mqtt server success!!!');
	client.subscribe('dwm/node/47b9/uplink/location');//這邊不確定47b9會不會變
});

client.on('message',function(topic,msg){
	var location_info=msg.toString();
	main(location_info)
});

function main(data){
    /* We clear the instance associated to this output
       otherwise the sample will have the values set in the
       previous iteration
    */
      output.clear_members();

      //put data here
      var ID=0; //車子的ID
      //var xx=data; //這裡放車子要上傳的資料，請照以下格式寫入
	    data = JSON.parse(data);
	    //console.log('x: '+data.position.x)
	    //console.log('y: '+data.position.y)
	    //console.log('z: '+data.position.z)
	    //console.log('quality: '+data.position.quality)
      var location_info_json={
       'x':data.position.x,
       'y':data.position.y,
       'z':data.position.z,
       'q':data.position.quality,
      };
      //console.log(data);
      var data=JSON.stringify(location_info_json);
      //console.log(data);

      //send data out
      output.instance.setNumber("ID", ID);
      output.instance.setString("data", data);
      console.log("Writing...");
      output.write();
      sleep.sleep(2); //單位:秒

}

exports.main = main;
