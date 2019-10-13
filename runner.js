'use strict'
const Simulator =require('./src/lib/simulator'),
      simulator = new Simulator();


function get_generated_data() {
    return Math.round(Math.random()*100);
}
let get_generated_tuples = () => {
    let timestamp = Math.round(new Date().getTime()/1000);
    let tuples = [
        [timestamp-2, get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), 1, 32.112223, -10.222422],
        [timestamp-1, get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), 0],
        [timestamp-0, get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), get_generated_data(), 0],
    ]
    return tuples;
}
let cid = -1;
let timer = {};
let data_transfer = () => {
    console.log(cid);
    simulator.run_realtime_airquality_data_transfer(cid, get_generated_tuples());
}

let runner = () => {
    //get ssn
    simulator.run_sensor_identifier_request(process.argv[2], (result)=> {
        if(result.payload.resultCode === 0) {        
            console.log(`ssn,${process.argv[2]},${result.payload.ssn}`);
            //connectionID 발급
            let ssn = result.payload.ssn;
            simulator.run_dynamic_connection_addition(ssn, (result)=> {
                console.log(`cid,${process.argv[2]},${result.payload.cid}`);
                if(result.payload.resultCode === 0) {
                    cid = result.payload.cid;
                    timer = setInterval(data_transfer, 3000);
                }
            });
        } else {
            console.log(`err,${process.argv[2]}`);
        }
    });

    //RAD TRN 시작

}

runner();
process.on('SIGUSR2', function(){
    clearInterval(timer);
});