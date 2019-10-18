'use strict'
const request = require('request'),
      requestURL = 'http://intuseer.co.kr:8001/s_api_v1_0';
      //requestURL = 'http://localhost:8001';
// function intervalFunc() {
//     console.log(`simulator runing, ${process.argv[2]}`);
// }

// setInterval(intervalFunc, 1500);

class Simulator {
    constructor() {
        this.wmac = '';
        this.cid = '';
    }
    conn = (ls, packedMsg, cb) => {
        let options = {
            method: 'POST',
            url: requestURL + ls,
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
            },
            body: packedMsg,
            json: true
        };
        request(options, function (error, response, body) {
            if (error) {
                console.error(`Server connection loss by ${JSON.stringify(packedMsg)}`);
            } else {
                cb(body);
            }
        });
    }
    get_generated_data = () => {
        return Math.round(Math.random()*100);
    }
    data_transfer = () => {
        this.get_generated_tuples((tuples)=>{
            console.log('tuple',tuples);
            this.run_realtime_airquality_data_transfer(tuples);
        });
    }
    get_gps = (wmac, cb) => {
        let params = {
            "queryType": "GET",
            "wmac": wmac
        };
        this.conn('/simulator', params, (result) => {
            cb(result.gps);
        })
    }
    get_generated_tuples = (cb) => {
        let timestamp = Math.round(new Date().getTime()/1000);
        this.get_gps(this.wmac, (gps) => {
            let arrGps = gps.split(','),
                lat = Number(arrGps[0]),
                lng = Number(arrGps[1]),
                tuples = [
                [timestamp-2, this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), 1, lat, lng],
                [timestamp-1, this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), 0],
                [timestamp-0, this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), this.get_generated_data(), 0],
            ]
            cb(tuples);
        });
    }
    run_sensor_identifier_request = (wmac, cb) => {
        let params = {
            "header": {
                "msgType": 1,
                "msgLen": 0,
                "endpointId":2
            },
            "payload": {
                "wmac": wmac
            }
        };
        this.conn('/s_api_v1_0', params, (result) => {
            cb(result);
        })
    };
    run_dynamic_connection_addition = (ssn, cb) => {
        
        this.get_gps(this.wmac, (gps) => {
            let arrGps = gps.split(','),
                lat = Number(arrGps[0]),
                lng = Number(arrGps[1]),
                params = {
                    "header": {
                        "msgType": 3,
                        "msgLen": 0,
                        "endpointId":ssn
                    },
                    "payload": {
                        "lat": lat,
                        "lng": lng
                    }
                }     
            this.conn('/s_api_v1_0', params, (result) => {
                cb(result);
                
            });      
        });
    };
    run_dynamic_connection_deletion = (cid, cb) => {
        let params = {
            "header": {
                "msgType": 5,
                "msgLen": 0,
                "endpointId":cid
            },
            "payload": {
            }
        }
        this.conn('/s_api_v1_0', params, (result) => {
            cb(result);
            
        });
    };
    run_dataGenerator = () => {

    }
    run_realtime_airquality_data_transfer = (data_tuples) => {
        let params = {
            "header": {
                "msgType": 7,
                "msgLen": 0,
                "endpointId": this.cid
            },
            "payload": {
                "listEncodingType": 1,
                "listEncodingValue": {
                    "dataTupleType": 1,
                    "dataTupleValue":data_tuples
                } 
            }
        }
        this.conn('/s_api_v1_0', params, (result) => {
            console.log('Transfer successed');
        });
    }
}
module.exports = Simulator;
