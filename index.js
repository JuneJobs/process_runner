'use strict'
const express = require("express"),
      cors = require('cors'),
      spawn = require('child_process').spawn,
      bodyParser = require('body-parser'),
      Simulator =require('./src/lib/simulator'),
      simulatorCon = new Simulator();

global.path = __dirname;
global.app = express();
app.use(cors());
global.router = express.Router();
app.use(bodyParser.json());
app.use("/", router);

// 설명 참고 https://m.blog.naver.com/PostView.nhn?blogId=termy826&logNo=20208750146&proxyReferer=https%3A%2F%2Fwww.google.com%2F

const childPool = [];

let make_simulator = (simulator_wmac) => {
    let ps = spawn('node', [`./runner.js`, simulator_wmac]);
    ps.stdout.on('data', (data) => {
        console.log('' + data);
        data = '' + data;
        if(data.indexOf('ssn,') === 0) {
            let ssn = data.split(',');
            ssn[2] = Number(ssn[2].substring('\n'));
            childPool.find((simulator)=> {
                if(simulator.simulator_wmac === ssn[1]) {
                    simulator.simulator_ssn = ssn[2];
                    return;
                }
            })
        } 
        if (data.indexOf('cid,') === 0) {
            let cid = data.split(',');
            cid[2] = Number(cid[2].substring('\n'));
            childPool.find((simulator)=> {
                if(simulator.simulator_wmac === cid[1]) {
                    simulator.simulator_cid = cid[2];
                    return;
                }
            })
        }
        if (data.indexOf('err,') === 0) {
            let arrMac = data.split(',');
            let wmac = arrMac[1].substring('/n',12);
            let idx = -1;
            childPool.map((simulator ,index)=> {
                    if (simulator.simulator_wmac === wmac) {
                        idx = index;
                    }
                })    
            childPool.splice(idx, 1);
        }
    });
    ps.stderr.setEncoding('utf8');
    ps.stderr.on('data', function (data) {
      if (/^execvp\(\)/.test(data)) {
        console.log('Failed to start child process.');
      }
    });
    childPool.push({
        simulator_wmac: simulator_wmac,
        simulator_ssn: 0,
        simulator_cid: 0,
        simulator: ps
    });

}
let kill_simulator = (simulator_wmac, cb) => {
    let result = false,
        idx = -1;
    childPool.map((obj_simulator, index) => {
        if(obj_simulator.simulator_wmac === simulator_wmac) {
            simulatorCon.run_dynamic_connection_deletion(obj_simulator.simulator_cid, (reslut)=> {
                result = true;
                idx =index;
                obj_simulator.simulator.kill('SIGUSR2');
            })
        }
    });
    childPool.splice(idx, 1);

    cb(result);   
}

function monitor() {
    console.log(`${childPool.length}개의 시뮬레이터 동작중`);
}
app.listen(8080, function () {
    console.log('simulator controller is running.');
    
    setInterval(monitor, 1500);
});

router.post('/s_simulator_control', (req, res) => {
    let s_id;
    switch(req.body.operation) {
        case 'run':
            s_id = req.body.simulator_wmac;
            make_simulator(s_id);
            res.send({
                res_code: 0
            });
            break;
        case 'kill':
            s_id = req.body.simulator_wmac;
            kill_simulator(s_id, (result)=> {
                if(result) {
                    console.log(`${s_id} was killed.`)
                    res.send({
                        res_code: 0
                    });
                } else {
                    console.log(`${s_id} doesn't exist.`)
                    res.send({
                        res_code: 1
                    });
                }
            });
            break;
    }
});
process.on('SIGINT', function(){
    console.log('simulator killed.');
    
    process.exit();
});