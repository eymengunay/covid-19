# Personal Covid-19 Tracker [![JavaScript Style Guide][standard-badge]][standard-url]

A simple static interface for visualizing personal covid-19 related events. It lets you track vaccination dates, allows you to log your antibody count overtime and archive pcr & antigen test results.

I did this in my free time to mainly track my antibody increase/decrease over a long period of time. I have collected the included data purely for fun and I aim to keep this up-to-date as much as possible.

## Requirements

* [Node.js][node-url] >= 10.0

## Usage

To get started clone this repository and install [Node.js][node-url] dependencies:

```
git clone git@github.com:eymengunay/covid-19.git
cd covid-19
npm install
```

Now to start the development server, use command:

```
npm run serve
```

Or to build files into `dist` folder:

```
npm run build
```

## Notes

This project is currently using a modified version chart.xkcd. You can find the dependency inside `vendor` folder. I quickly put together some changes to make things work but it is a mess. I hope to update this sometime in the future. 

[standard-badge]: https://img.shields.io/badge/code_style-standard-brightgreen.svg?style=popout
[standard-url]: https://standardjs.com
[node-url]: https://nodejs.org