# golink-gh-pages

A simple static url shortner hosted on github pages. All the data is stored in
the github repo. Private github repo is supported. External users without github
repo access won't see the data.

## Why github pages

Github pages ~~is free~~ has a better SLA and minimum maintainance effort.

## Install

> You need [nodejs][nodejs] installed to start. It will bring you `node`, `npm`
> and `npx` commands.

First, create an empty github repo to hold the site.

> Suggestion, use github website to create a repo named as `go.yourdomain.com`
> and clone it to your local workspace.

```bash
mkdir my-golink
cd my-golink
git init
```

Next, make this github repo a npm package. And initialize this golink package.

```bash
npm init
npm install --save-dev golink-gh-pages
npx golink
```

Now, test your setup in a simple server.

```bash
npm install --save-dev serve
npx serve docs
```

Open browser and navigate to
[localhost:5000/google](http://localhost:5000/google). You'll be able to see a
refresh to google homepage.

## Usage

Add your entry in `entries.json`

```json
{
  "YT": "https://www.youtube.com/watch"
}
```

Then rebuild the project. New static entries will be created in the docs folder.

```bash
npx golink
npx serve docs
```

Verify [localhost:5000/yt?v=NasyGUeNMTs](http://localhost:5000/yt?v=NasyGUeNMTs)

In general, if more data is included in the query string. The golink will strip
the key and append the remain query to the targeted location. (e.g.
[localhost:5000/google/search?q=poifuture](http://localhost:5000/google/search?q=poifuture)
will be translated to
[www.google.com/search?q=poifuture](http://www.google.com/search?q=poifuture) )

## Productionlize

To make the golink useful in the real world, the following setup is needed.

### Set up custom domain

### Set up continuous delivery

### Set up local dns for "go" TLD

This convinient setup will unlock your productivity by typing go/link in the
browser. See how [Google does][history].

## Config

Config file is located at `golink.config.json`. The following options are used
to configure the build process.

`fuzzy` (default `true`): Allow fuzzy match. Matches are case insensitive and
all symbols will be ignored. (e.g. `go/MyGREatBLOg5` can hit the
`my-great-blog-5` entry)

`jekyll301` (default `false`): Generate jekyll front matters to do 301
redirection. This will improve the redirection performance in github pages. But
it doesn't pass the query string to the targeted site.

## Credits

Huge appreciation to [Google internal golinks][history]

[nodejs]: https://nodejs.org/
[history]:
  https://medium.com/@golinks/the-full-history-of-go-links-and-the-golink-system-cbc6d2c8bb3
