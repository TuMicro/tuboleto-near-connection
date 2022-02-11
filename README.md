# About this repository

This repository contains the source code for the connector and top-up website for the TuBoleto app using your NEAR wallet.

The TuBoleto app Near related UI and modifications built during the hackathon are here: https://github.com/TuMicro/tuboleto-near-ui. That repository includes logic for generating links and making use of the website in this repository and also for using the Aurora connector.

The Aurora connector (top-up website) is here: https://github.com/TuMicro/tuboleto-aurora-connection

# Development

Using node v16.13.2

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

Run `npm start` to start developing.

You should see the website when opening [http://localhost:3000](http://localhost:3000) with your browser.

The page will reload if you make edits.

You will also see any lint errors in the console.

## Notes to remember:
* Bootstrap5 changes left and right for start and end (ie: ml => ms, pr => pe)
* To generate typescript types for json responses:
https://jvilk.com/MakeTypes/
* Use this to generate the favicon and icons, it should have all the required icons (including the apple one):
https://favicon.io/favicon-converter/

## About some common issues:

* If you run into scss related errors you can try changing the scss files from CRLF to LF

# Deploy with:

If you have write access to the Google Project you will see it deployed in [`here`](https://tuboleto-near.web.app/) 

```
npm run build && firebase deploy && time /t
```

