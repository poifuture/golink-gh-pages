import fs from "fs"
import os from "os"
import path from "path"
import process from "process"
import { exec, execFileSync } from "child_process"

const DefaultHost = "https://go.poi.dev"

const LocalServerJs = `#!/usr/bin/env node

var http = require("http");

var golinkHost = "https://go.poi.dev";

var server = http.createServer(function(req, res) {
  res.writeHead(301, { Location: golinkHost + req.url });
  res.end();
});

server.listen(80);
`

const prepare = (golinkHost: string = DefaultHost) => {
  if (process.platform !== "win32" && fs.existsSync("/mnt/c")) {
    throw new Error(
      "WSL detected. Abort. Installation needs to inject Windows registry. Please run in powershell."
    )
  }
  const qualifiedHost = golinkHost.startsWith("http")
    ? golinkHost
    : "http://" + golinkHost
  const serverJs = LocalServerJs.replace(DefaultHost, qualifiedHost)
  const serverJsPath = path.join(os.homedir(), "golink-local.js")
  fs.writeFileSync(serverJsPath, serverJs)
  switch (process.platform) {
    case "win32": {
      const startupWrapper = `CreateObject("Wscript.Shell").Run "node ${serverJsPath}", 0`
      fs.writeFileSync(
        path.join(
          process.env.APPDATA,
          "Microsoft",
          "Windows",
          "Start Menu",
          "Programs",
          "Startup",
          "golink-local.vbs"
        ),
        startupWrapper
      )
      break
    }
    case "linux": {
      throw new Error(`Unsupported platform: ${process.platform}`)
      break
    }
    case "darwin": {
      throw new Error(`Unsupported platform: ${process.platform}`)
      break
    }
    default: {
      throw new Error(`Unsupported platform: ${process.platform}`)
    }
  }
}

export default (golinkHost: string = DefaultHost) => {
  prepare(golinkHost)
  try {
    switch (process.platform) {
      case "win32": {
        fs.writeFileSync(
          "c:\\Windows\\System32\\Drivers\\etc\\hosts",
          "\r\n127.0.0.1 go\r\n",
          { flag: "a" }
        )
        break
      }
      case "linux": {
        throw new Error(`Unsupported platform: ${process.platform}`)
        break
      }
      case "darwin": {
        throw new Error(`Unsupported platform: ${process.platform}`)
        break
      }
      default: {
        throw new Error(`Unsupported platform: ${process.platform}`)
      }
    }
  } catch (error) {
    console.error(error)
    console.log(`
Install not finished.
The installation needs to write local dns for go TLD and os registry for auto startup the local redirect server.
You can try to rerun "golink install-local" with root permision.
Or, you can configure it manually described as follows.

1. Append this record in your os etc/hosts

127.0.0.1 go

The hosts file is located at:
Linux: /etc/hosts
Windows: c:\\Windows\\System32\\Drivers\\etc\\hosts

2. Add the server to your os startup services
Windows: Run %USERPROFILE%/golink-local.reg

3. If the redirect server is not generated at ~/golink-local.js. Please create it manually.

${LocalServerJs}

Install not finished.
You can try to rerun "golink install-local" with root permision.
    `)
  }
}
