/**
 * Copyright (C) 2016. No part of this file may be replicated without the
 *   explicit written consent of all authors of this project.
 */

'use strict';

var express = require('express'),
    path = require('path');

module.exports = function(statusCodes, HomeController, AuthenticationController, DataExportController, TutorController, StudentController, MatchController) {
  var router = express.Router();

  /**
   * Sends 405 for routes that are not allowed in this model
   */
  var methodNotAllowed = function(req, res, next) {
    var error = new Error('Non supported method.');
    error.status = statusCodes.METHOD_NOT_ALLOWED;
    return next(error);
  };

  /**
   * Sends user object in JSON to client
   */
  var returnUserObject = function(req, res, next) {
    if (!req.session.user) {
      return res.send({
        user: null
      });
    }
    return res.json({
      user: req.session.user
    });
  };

  var redirectToLogin = function (res) {
    res.redirect('/login');
  };

  /**
   * Checks if the user is already logged in. If they are, redirect to the dashboard.
   */
  var checkIfAlreadyLoggedIn = function(req, res, next) {
    if (req.session.user) {
      return res.redirect('/dashboard');
    }
    next();
  };

  // --------------------------------------------------------------
  // UNPROTECTED ROUTES:

  // API

  // authentication route
  router.route('/account/login')
    .post(AuthenticationController.login)
    .all(methodNotAllowed);

  // FRONT-END

  // Login route
  router.route('/login')
    .get(checkIfAlreadyLoggedIn)
    .get(HomeController.login)
    .all(methodNotAllowed);

  // Home/Landing page - redirect to login
  router.route('/')
    .all(function(req, res, next) {
      res.redirect('/login');
    });


  // --------------------------------------------------------------
  // PROTECTED ROUTES:
  // Verify there is a user logged in before allowing access
  router.use(function(req, res, next) {
    // Redirect to the login page if there is no user logged in
    if (!req.session.user) {
      return res.redirect('/login');
    } else {
      // Otherwise, allow the user through to the next matching route
      return next();
    }
  });

  // API
  router.route('/logout')
      .get(AuthenticationController.logout)
      .all(methodNotAllowed);

  router.route('/user')
      .get(returnUserObject)
      .all(methodNotAllowed);

  router.route('/api/account/password')
      .post(AuthenticationController.updatePassword)
      .all(methodNotAllowed);

  router.route('/api/accounts')
      .get(AuthenticationController.listUsers)
      .all(methodNotAllowed);

  router.route('/api/account/role')
      .post(AuthenticationController.updateRole)
      .all(methodNotAllowed);

  router.route('/api/account/branch')
      .post(AuthenticationController.updateBranch)
      .all(methodNotAllowed);

  router.route('/api/account/:username?')
      .post(AuthenticationController.createAccount)
      .delete(AuthenticationController.deleteAccount)
      .all(methodNotAllowed);

  router.route('/api/tutor/:id?')
      .get(TutorController.getTutor)
      .delete(TutorController.exitTutor)
      .all(methodNotAllowed);

  router.route('/api/student/:id?')
      .get(StudentController.getStudent)
      .all(methodNotAllowed);

  router.route('/api/autocomplete/tutor/:name')
      .get(TutorController.autocomplete)
      .all(methodNotAllowed);

  router.route('/api/autocomplete/student/:name')
      .get(StudentController.autocomplete)
      .all(methodNotAllowed);

  router.route('/api/createstudent')
      .post(StudentController.createStudent)
      .all(methodNotAllowed);

  router.route('/api/createtutor')
      .post(TutorController.createTutor)
      .all(methodNotAllowed);

  router.route('/api/matches/:id?')
      .get(MatchController.getMatches)
      .post(MatchController.addOrUpdate)
      .delete(MatchController.dissolveMatch)
      .all(methodNotAllowed);

  router.route('/export/students')
      .get(DataExportController.exportStudents)
      .all(methodNotAllowed);

  router.route('/export/tutors')
      .get(DataExportController.exportTutors)
      .all(methodNotAllowed);

  router.route('/export/matches')
      .get(DataExportController.exportMatches)
      .all(methodNotAllowed);

  // ADMIN

  // FRONT-END
  router.route('/dashboard')
      .get(HomeController.dashboard)
      .all(methodNotAllowed);

  router.route('/account')
      .get(HomeController.account)
      .all(methodNotAllowed);

  router.route('/administration')
      .get(HomeController.admin)
      .all(methodNotAllowed);

  router.route('/student-form')
      .get(HomeController.studentForm)
      .all(methodNotAllowed);

  router.route('/tutor-form')
      .get(HomeController.tutorForm)
      .all(methodNotAllowed);

  router.route('/students/:id?')
      .get(HomeController.students)
      .all(methodNotAllowed);

  router.route('/tutors/:id?')
      .get(HomeController.tutors)
      .all(methodNotAllowed);

  router.route('/matching')
      .get(HomeController.matching)
      .all(methodNotAllowed);

  router.route('/export')
      .get(HomeController.export)
      .all(methodNotAllowed);

  // Static Content for Protected content - prevents non-authenticated users from accessing these files
  router.all('*', express.static(path.resolve(__dirname + '/../protected'))); // static protected files in /protected

  return router;
};
