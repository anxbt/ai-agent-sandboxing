import { exec } from "child_process";

import fs from "fs";

const code = `print("hello from sandbox")`;

fs.writeFileSync("./script.py", code);


console.log("Ran");

exec(`

cd .. &&  docker build -t my-python-app . && docker run  my-python-app

`, (err, stdout, stderr) => {

  console.log(stdout);

});