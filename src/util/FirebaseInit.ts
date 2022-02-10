// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";
// If you are using v7 or any earlier version of the JS SDK, you should import firebase using namespace import
// import * as firebase from "firebase/app"

// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";
import { isProductionWebsite } from "./DevEnvUtil";

// firestore
// Required for side-effects
import "firebase/firestore";

// For Firebase JavaScript SDK v7.20.0 and later, `measurementId` is an optional field

const firebaseConfigProduction = {
  apiKey: "AIzaSyBks_18ayUtgY2nAOLi3DYe8ARGG4KCShY",
  authDomain: "tumicro-1203.firebaseapp.com",
  databaseURL: "https://tumicro-1203.firebaseio.com",
  projectId: "tumicro-1203",
  storageBucket: "tumicro-1203.appspot.com",
  messagingSenderId: "341269335857",
  appId: "1:341269335857:web:7b282c2c4ca63e79d22a10",
  measurementId: "G-T7EMNMGSL1"
};

const firebaseConfigTest = firebaseConfigProduction;



const firebaseConfig = (isProductionWebsite ? firebaseConfigProduction : firebaseConfigTest);

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Init analytics
export const fa = firebase.analytics();

// get firestore:
export const db = firebase.firestore();
