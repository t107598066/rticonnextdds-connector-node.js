/******************************************************************************
* (c) 2005-2015 Copyright, Real-Time Innovations.  All rights reserved.       *
* No duplications, whole or partial, manual or electronic, may be made        *
* without express written permission.  Any such copies, or revisions thereof, *
* must display this notice unaltered.                                         *
* This code contains trade secrets of Real-Time Innovations, Inc.             *
******************************************************************************/

var sleep = require('sleep');
var rti   = require('rticonnextdds-connector');
var request = require("request");
var fs = require("fs");

var connector = new rti.Connector("MyParticipantLibrary::Zero",__dirname + "/xml/message_sub.xml");
var input = connector.getInput("MySubscriber::MySquareReader");



async function main_loop() {
    //console.log("msub: Waiting for samples...");
    input.take();
    for (var i=0; i < input.samples.getLength(); i++) {
        if (input.infos.isValid(i)) {
            //console.log(JSON.stringify(input.samples.getJSON(i)));
            var xx=input.samples.getJSON(i);
            var yy=JSON.parse(xx.data);

            console.log("Get data:",yy);
            //console.log("Get data:",xx.data);
            upLoadFile(yy);

            console.log("Complete send to database.");
        }
    }

    //sleep.msleep(1);
}

async function upLoadFile(obj)
{
	await request({
		uri: "http://3.84.218.73:8081/coordinate",
        //uri: "http://140.124.182.21:8081/coordinate",
		method: "POST",
		form: {
			obj : [obj]
		},
		encoding: null,
		json: true
	},function(error , response , body){
		//ok = 成功 , error = 失敗
		console.log(body.toString());
	});

}

const intervalObj = setInterval(main_loop, 1); //msec
