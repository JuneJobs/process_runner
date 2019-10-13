
const request = require('request'),
      requestURL = 'http://intuseer.co.kr:8001/s_api_v1_0';
// function intervalFunc() {
//     console.log(`simulator runing, ${process.argv[2]}`);
// }

// setInterval(intervalFunc, 1500);

class Simulator {
    constructor() {

    };
    conn = (packedMsg, cb) => {
        let options = {
            method: 'POST',
            url: requestURL,
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/json'
            },
            body: packedMsg,
            json: true
        };
        request(options, function (error, response, body) {
            if (error) {
                logger.debug(`Server connection loss by ${JSON.stringify(packedMsg)}`);
            } else {
                cb(body);
            }
        });
    };
    run_sensor_identifier_request = (wmac, cb) => {
        console.log(wmac);
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
        this.conn(params, (result) => {
            cb(result);
        })
    };
    run_dynamic_connection_addition = (ssn, cb) => {
        let params = {
            "header": {
                "msgType": 3,
                "msgLen": 0,
                "endpointId":ssn
            },
            "payload": {
                "lat": 32.88247,
                "lng": -117.23484
            }
        }
        this.conn(params, (result) => {
            cb(result);
            
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
        this.conn(params, (result) => {
            cb(result);
            
        });
    };
    run_dataGenerator = () => {

    }
    run_realtime_airquality_data_transfer = (cid, data_tuples) => {
        let params = {
            "header": {
                "msgType": 7,
                "msgLen": 0,
                "endpointId": cid
            },
            "payload": {
                "listEncodingType": 1,
                "listEncodingValue": {
                    "dataTupleType": 1,
                    "dataTupleValue":data_tuples
                } 
            }
        }
        this.conn(params, (result) => {
            console.log('>>',result);
        });
    }
}
module.exports = Simulator;
