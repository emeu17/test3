
var express = require('express');
var router = express.Router();
const cityModel = require("../models/city.js");
const travelModel = require("../models/travel.js");

//route /v1/city
router.get('/', (req, res) => cityModel.getAllCities(res, req));

//route /v1/city/:id
router.get('/:id', (req, res) => cityModel.getCityById(res, req));

//route /v1/city/:id/station
router.get('/:id/station', (req, res) => cityModel.getStations(res, req));

//route /v1/city/:id/bike
router.get('/:id/bike', (req, res) => cityModel.getBikes(res, req));

//route /v1/city/:id/bike/rented
//get all bikes that have status rented ie
//bikes that are currently changing position frequently
router.get('/:id/bike/rented', (req, res) => travelModel.getRentedBikes(res, req));

module.exports = router;
