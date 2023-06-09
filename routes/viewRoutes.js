const express = require('express')
const tour = require('../models/tourmodel')
const router = express.Router()
const authController = require('../Controllers/authController')
const viewsController = require('../Controllers/viewsController')
router.get('/signup',viewsController.signup)
router.use(authController.isLoggedIn)
router.get('/',authController.protect, viewsController.getOverview)
router.get('/tour/:slug', viewsController.getTour)
router.get('/login',viewsController.login)
router.get('/me',viewsController.getAccount)
router.post('/submit-user-data',authController.protect, viewsController.updateUserData)
module.exports = router