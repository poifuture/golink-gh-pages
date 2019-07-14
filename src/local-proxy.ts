import fs from "fs"
import os from "os"
import path from "path"
import process from "process"
import { execFile } from "child_process"
import fetch from "node-fetch"

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

let manual: number = 0

const verifyHost = async (
  golinkHost: string = DefaultHost
): Promise<boolean> => {
  const qualifiedHost = golinkHost.startsWith("http")
    ? golinkHost
    : "http://" + golinkHost
  const res = await fetch(qualifiedHost)
  if (!res.ok) {
    throw new Error(`Verify host ${qualifiedHost} failed: ${res.statusText}`)
  }
  return res.ok
}

const prepareServer = (golinkHost: string = DefaultHost) => {
  if (process.platform !== "win32" && fs.existsSync("/mnt/c")) {
    throw new Error(
      "WSL detected. Abort. Installation in WSL won't starup in Windows. Please run in powershell in your Windows."
    )
  }
  const qualifiedHost = golinkHost.startsWith("http")
    ? golinkHost
    : "http://" + golinkHost
  const serverJs = LocalServerJs.replace(DefaultHost, qualifiedHost)
  const serverJsPath = path.join(os.homedir(), "golink-local.js")
  fs.writeFileSync(serverJsPath, serverJs)
  console.log("Created reverse proxy server script at: ", serverJsPath)
  return serverJsPath
}

const installStartup = (serverJsPath: string = ""): string => {
  switch (process.platform) {
    case "win32": {
      const startupWrapper = `CreateObject("Wscript.Shell").Run "node ${serverJsPath}", 0`
      const startupWrapperPath = path.join(
        process.env.APPDATA,
        "Microsoft",
        "Windows",
        "Start Menu",
        "Programs",
        "Startup",
        "golink-local.vbs"
      )
      fs.writeFileSync(startupWrapperPath, startupWrapper)
      console.log("Created startup entry at: ", startupWrapperPath)
      return startupWrapperPath
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

const installHosts = () => {
  switch (process.platform) {
    case "win32": {
      const hostsPath = "c:\\Windows\\System32\\Drivers\\etc\\hosts"
      try {
        const hostsContent = fs.readFileSync(hostsPath, "utf8")
        if (hostsContent.includes("127.0.0.1 go")) {
          console.log("Found go TLD in hosts, skip writing hosts")
          break
        }
        fs.writeFileSync(hostsPath, "\r\n127.0.0.1 go\r\n", { flag: "a" })
        console.log("Appended go TLD at: ", hostsPath)
      } catch (error) {
        console.error(error)
        console.error("Append go TLD record in etc/hosts failed.")
        manual += 1
        console.error(
          "Manual setup instruction: Please add the following record\r\n127.0.0.1 go\r\nto ",
          hostsPath
        )
      }
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

const firstTimeStart = async (
  startupWrapperPath: string = ""
): Promise<void> => {
  if (!fs.existsSync(startupWrapperPath)) {
    console.log(
      "Server not started. No startup script found at ",
      startupWrapperPath
    )
    return
  }
  execFile(startupWrapperPath, { shell: true })
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, 5000)
  })
}

export const install = (golinkHost: string = DefaultHost) => {
  manual = 0
  const asyncInstall = async () => {
    if (!(await verifyHost(golinkHost))) {
      throw new Error(`Provided host ${golinkHost} didn't respond 200 ok.`)
    }
    const serverJsPath = prepareServer(golinkHost)
    const startupWrapperPath = installStartup(serverJsPath)
    installHosts()
    await firstTimeStart(startupWrapperPath)
  }

  asyncInstall()
    .then(() => {
      if (manual === 0) {
        console.log(
          `It looks like the local dns is installed. Please open http://go/google to verify.
Please reboot to verify if the local dns proxy server will start automatically.
If there's any problem, please check http://poi.page/golink-local-dns`
        )
      } else {
        console.log(
          `There are ${manual} steps failed. Please try to rerun the script as root/admin.
You can also follow the instructions in the error message to install manually.
Please check http://poi.page/golink-local-dns" for more details`
        )
      }
    })
    .catch(error => {
      console.error(error)
      console.error("Precheck failed. Abort.")
    })
}

export default {
  install: install,
}
