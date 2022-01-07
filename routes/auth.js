var express = require('express');
var router = express.Router();
const authModel = require("../models/auth.js");
const customerModel = require("../models/customer.js");
const staffModel = require("../models/staff.js");
const travelModel = require("../models/travel.js");

//lägg till ny kund/användare
router.post('/customer', (req, res) => authModel.register(res, req));

//logga in användare/kund
router.post('/customer/login', (req, res) => authModel.login(res, req));

//lägg till ny admin/staff
router.post('/staff', (req, res) => authModel.registerStaff(res, req));

//logga in admin/staff
router.post('/staff/login', (req, res) => authModel.loginStaff(res, req));

//visa alla kunder - endast inloggad personal/staff
router.get('/customer',
    (req, res, next) => authModel.checkStaffToken(req, res, next),
    (req, res) => customerModel.getAllCustomers(res, req)
);

//uppdatera detaljer om specifik kund - endast för inloggad kund
router.put('/customer',
    (req, res, next) => authModel.checkToken(req, res, next),
    (req, res) => customerModel.customerUpdate(res, req)
);

//visa specifik kund - endast för den egna inloggade kunden
router.get('/customer/:id',
    (req, res, next) => authModel.checkToken(req, res, next),
    (req, res) => customerModel.getSpecificCustomer(res, req)
);

//ta bort specifik kund - endast för inloggad staff/admin
router.delete('/customer/:id',
    (req, res, next) => authModel.checkStaffToken(req, res, next),
    (req, res) => customerModel.deleteSpecificCustomer(res, req)
);

//uppdatera detaljer om specifik kund - endast för inloggad staff/admin
router.put('/customer/:id',
    (req, res, next) => authModel.checkStaffToken(req, res, next),
    (req, res) => customerModel.updateSpecificCustomer(res, req)
);

//visa specifik kunds hyrda cyklar (cykel) - endast för den egna inloggade kunden
router.get('/customer/:id/rented',
    (req, res, next) => authModel.checkToken(req, res, next),
    (req, res) => travelModel.getCustomerRentals(res, req)
);



//visa alla admin/staff - endast inloggad personal/staff
router.get('/staff',
    (req, res, next) => authModel.checkStaffToken(req, res, next),
    (req, res) => staffModel.getAllStaff(res, req)
);

module.exports = router;
