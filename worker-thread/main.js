//In your `index.js` file, add the following:
const {Worker} = require("worker_threads");

let number = 10;

const worker = new Worker("./worker.js", {workerData: {num: number}});

worker.once("message", result => {
    console.log(`${number}th Fibonacci No: ${result}`);
});

worker.on("error", error => {
    console.log(error);
});

worker.on("exit", exitCode => {
    console.log(`It exited with code ${exitCode}`);
})

console.log("Execution in main thread");
