import localtunnel from 'localtunnel';
import { spawn } from "child_process";

(async () => {
  const tunnel = await localtunnel({ port: 3000 });

  // the assigned public url for your tunnel
  // i.e. https://abcdefgjhij.localtunnel.me
  
  const node = spawn('npx nodemon index ' + tunnel.url);

  node.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
  });

  node.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
  });

  node.on('error', (error) => {
      console.log(`error: ${error.message}`);
  });

  tunnel.on('close', () => {
    console.log('closed')
  });
})();