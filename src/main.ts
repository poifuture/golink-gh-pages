import fs from "fs"
import JSON5 from "json5"

const getFuzzyKey = (key: string): string => {
  return key.replace(/[^a-zA-Z0-9]*/g, "").toLowerCase()
}

interface ConfigType {
  fuzzy: boolean
  jekyll301: boolean
  unsafe: boolean
}
interface RichEntryType {
  fuzzyKey: string
  target: string
}

const DefaultConfig: ConfigType = {
  fuzzy: true,
  jekyll301: false,
  unsafe: false,
}

const ConfigPath = "golink.config.json"

const resolveConfig = (): ConfigType => {
  if (!fs.existsSync(ConfigPath)) {
    const defaultConfigString = JSON.stringify(DefaultConfig, null, 2)
    fs.writeFileSync(ConfigPath, defaultConfigString)
  }
  const configString: string = fs.readFileSync(ConfigPath, "utf8")
  const config: ConfigType = JSON5.parse(configString)
  console.log("Golink config: ", config)
  return config
}

const initDocs = ({
  fuzzy = true,
  unsafe = false,
}: {
  fuzzy?: boolean
  unsafe?: boolean
}) => {
  if (!fs.existsSync("entries.json")) {
    fs.writeFileSync(
      "entries.json",
      JSON.stringify(
        {
          google: "https://www.google.com",
          "google-maps": "https://maps.google.com",
        },
        null,
        2
      )
    )
  }
  if (!fs.existsSync("docs")) {
    fs.mkdirSync("docs")
  }
  if (!fs.existsSync("docs/entry")) {
    fs.mkdirSync("docs/entry")
    fs.writeFileSync("docs/entry/google", "https://www.google.com")
  }
  let homeHtml = fs.readFileSync(__dirname + "/template.html", "utf8")
  if (fuzzy !== true) {
    homeHtml = homeHtml.replace(/fuzzy start(.|\n)*fuzzy end/gm, "")
  }
  if (unsafe !== true) {
    homeHtml = homeHtml.replace(/unsafe start(.|\n)*unsafe end/gm, "")
  }
  fs.writeFileSync("docs/index.html", homeHtml)
}

const resolveRichEntries = ({
  fuzzy = true,
}: {
  fuzzy: boolean
}): { [s: string]: RichEntryType } => {
  const entriesString = fs.existsSync("entries.json5")
    ? fs.readFileSync("entries.json5", "utf8")
    : fs.existsSync("entries.json")
    ? fs.readFileSync("entries.json", "utf8")
    : ""
  const entries = JSON5.parse(entriesString)
  const richEntries = {}
  const fuzzyPointers = {}
  for (const key in entries) {
    const fuzzyKey = getFuzzyKey(key)
    if (fuzzyKey in fuzzyPointers) {
      const warningMessage = `Two entries (${key} and ${
        fuzzyPointers[fuzzyKey]
      }) have identical fuzzy key: ${fuzzyKey}`
      if (fuzzy === true) {
        throw new Error(warningMessage)
      } else {
        console.warn(warningMessage)
      }
    }
    fuzzyPointers[fuzzyKey] = key
    richEntries[key] = {
      fuzzyKey: fuzzyKey,
      target: entries[key],
    }
  }
  return richEntries
}

const buildJekyll = async (richEntries: {
  [s: string]: RichEntryType
}): Promise<void> => {
  await Promise.all(
    Object.keys(richEntries).map(key => {
      return new Promise((resolve, reject) => {
        fs.writeFile(
          "docs/" + key,
          "---\nredirect_to: " + richEntries[key].target + "\n---",
          error => {
            if (error) {
              reject(error)
            }
            resolve()
          }
        )
      })
    })
  )
}

const buildEntries = async (
  richEntries: {
    [s: string]: RichEntryType
  },
  { fuzzy = true }: { fuzzy?: boolean }
): Promise<void> => {
  await Promise.all(
    Object.keys(richEntries).map(key => {
      return new Promise((resolve, reject) => {
        fs.writeFile(
          "docs/entry/" + (fuzzy ? richEntries[key].fuzzyKey : key),
          richEntries[key].target,
          error => {
            if (error) {
              reject(error)
            }
            resolve()
          }
        )
      })
    })
  )
}

const github404Hack = () => {
  const spaHtml = fs.readFileSync("docs/index.html", "utf8")
  fs.writeFileSync(
    "docs/404.html",
    "---\npermalink: /404.html\n---\n" + spaHtml
  )
}

export default async () => {
  const config: ConfigType = resolveConfig()
  initDocs({ fuzzy: config.fuzzy, unsafe: config.unsafe })
  const richEntries = resolveRichEntries({ fuzzy: config.fuzzy })
  await buildEntries(richEntries, { fuzzy: config.fuzzy })
  if (config.jekyll301) {
    await buildJekyll(richEntries)
  }
  github404Hack()
}
