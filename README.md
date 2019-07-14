# golink-gh-pages

A simple static url shortner hosted on github pages. All the data is stored in
the github repo. Private github repo is supported. External users without github
repo access won't see the data.

## Live demo

- Accessable all around the world
  - http://go-l.ink/golink-intro
  - http://go-l.ink/google
  - http://go-l.ink/youtube/NasyGUeNMTs
- If you have dns installed.
  - [go/golink-intro](http://go/golink-intro)
  - [go/google](http://go/google)
  - [go/youtube/NasyGUeNMTs](http://go/youtube/NasyGUeNMTs)

Live demo is located at http://go-l.ink/github-golink-demo

## Why github pages

Github pages ~~is free~~ provides the easiest way to maintain a service with no
cost (time or money).

This project is inspired by [golinks.io](http://golinks.io). You can try it if a
private Github Pages repo is not a requirement for you.

## Quick Start

> You need [nodejs][nodejs] installed to start. It will bring you `node`, `npm`
> and `npx` commands.

1. Create a new `go.yourdomain.com` repo in github with `{gitignore: Node}`
2. Clone the repo, init with golink-gh-pages, and push back to github.

   ```bash
      git clone git://github.com/yourorg/go.yourdomain.com
      cd go.yourdomain.com
      # npx will automatically download the golink init script in tmp folder.
      npx golink-gh-pages
      git add --all && commit -m "Init golink"
      git push origin master
   ```

3. Enable Github Pages on `master/docs` with your `go.yourdomain.com` domain.
4. (Optional) Setup Circle CI workflow.
5. (Optional) Setup "go" TLD to enable go/link in the browser.

## Developing

Simply `npx serve docs` will simulate a github pages server on localhost 5000
port. `npm run start` script will rebuild static entries first before serving
the sites. After server is started, open browser and navigate to
[localhost:5000/google](http://localhost:5000/google). You'll be able to see the
broswer is refreshing to google homepage.

## Usage

Add your entry in `entries.json`

```json
{
  "g": "https://www.google.com/",
  "YT": "https://www.youtube.com/watch?v="
}
```

> Note the tailing slash "/" is important. It allows `go/g/search?q=123` to be
> translated to `https://www.google.com/search?q=123`. Without tailing slash, it
> will become `https://www.google.comsearch?q=123`

Then rebuild the project. New static entries will be created in the docs folder.

```bash
npm build
npm start
```

Verify [localhost:5000/yt/NasyGUeNMTs](http://localhost:5000/yt/NasyGUeNMTs)

In general, if more data is included in the query string. The golink will strip
the key and append the remain query to the targeted location. (e.g.
[localhost:5000/google/search?q=poifuture](http://localhost:5000/google/search?q=poifuture)
will be translated to
[www.google.com/search?q=poifuture](http://www.google.com/search?q=poifuture) )

## Productionlize

To make the golink useful in the real world, the following steps are
recommended.

### Enable Github Pages

Of course!

Open github.com -> your repo -> Settings -> GitHub Pages -> Source: master/docs

Private repo is okay.

### Set up custom domain

The good choice is `https://go.corp.example.com`. https setup would be good for
security reason. You may want to simply forward your short domain to the secure
long domain. You can follow the
[official GitHub Pages wiki](https://help.github.com/en/articles/using-a-custom-domain-with-github-pages)
to set up your custom domain.

### Set up short url

Usually, your dns provider allows you to set 301 redirect (a.k.a forwarding) for
your apex domain. (also known as root zone, host "@", etc.). In our live demo,
the forwarding is set from "go-l.ink" to "https://golink.poi.dev" at
[poigolink repo](https://github.com/poigolink/golink.poi.dev). So that you can
access your golink globalwide. Try [go-l.ink/google](http://go-l.ink/google)

### Set up continuous delivery

**Security alert!** If you use default setup, `everyone` would be able to push
any commits as your identity to GitHub

Continuous delivery is used to build the entry when anyone is modifing
`entries.json`. By default, a Circle CI config is already provided in the repo.
All you need to do is enabling your repo in Circle CI and grant write/push
permission.

**The user key setup is dangerous, check Circle CI docs for r/w deploy key.**

Grant Circle CI a user key at Circle CI -> Settings -> Permissons -> SSH Keys

### Set up "go" TLD

This convinient setup will unlock your productivity significantly. You'll be
able to access the doc you remember in your brain by simply typing
`go/an-awesome-doc` in the browser. See a great document by
[golinks.io][history]. To achieve this, there are 3 options.

#### Option 1: Run a redirection server on everyone's port 80

To set up, simply run

```bash
npx golink-gh-pages install-local-dns https://go.yourdomain.com
```

If the setup is successful, open http://go/google will redirect to google. Next
time, simply type go/ to your document without searching everywhere.

The installation will create "~/golink-local.js", a 3-line pure nodejs redirect
server. Then add a startup registry to run this server at port 80. Finally, the
installation will write a "go" TLD entry to 127.0.0.1, which allows the browser
to redirect the "go" domain same as "localhost"

#### Option 2: Run a org wide redirection server at a static ip port 80

Since port 80 is required. It would bring extra maintainance effort for this
server. AWS Elastic IP + AWS Lambda is probably a good setup.

#### Option 3: Run a org wide dns server

> Not all dns server supports this setup

Simply add a CNAME from "go" TLD to yourorg.github.io Growing teams will gain
other benefits from a private dns at the same time.

## Configs

Config file is located at `golink.config.json`. The following options are used
to configure the build process.

`cleanStart` (default `false`): Clear the entries that doesn't exist in
`entries.json`.

`fuzzy` (default `true`): Allow fuzzy match. Matches are case insensitive and
all symbols will be ignored. (e.g. `go/MyGReatBLOg5` can hit the
`my-great-blog-5` entry)

`jekyll301` (default `false`): Generate jekyll front matters to do 301
redirection. This will improve the redirection performance in github pages. But
it doesn't pass the query string to the targeted site.

## Alternatives

[golinks.io][golinks.io] is a reliable SaaS platform to provide the golinks to
advanced users.

## Credits

Huge appreciation to [Google internal golinks][history]

[nodejs]: https://nodejs.org/
[history]:
  https://medium.com/@golinks/the-full-history-of-go-links-and-the-golink-system-cbc6d2c8bb3
