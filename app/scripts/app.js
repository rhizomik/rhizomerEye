'use strict';

/**
 * @ngdoc overview
 * @name rhizomerEyeApp
 * @description
 * # rhizomerEyeApp
 *
 * Main module of the application.
 */
angular
  .module('rhizomerEyeApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'config'
  ])
  .config(function ($stateProvider) {
    $stateProvider
      .state('datasets-list', {
        url: '/datasets',
        templateUrl: 'views/datasets-list.html',
        controller: 'DatasetsCtrl' })
      .state('dataset-detail', {
        url: '/datasets/{id}',
        templateUrl: 'views/dataset-detail.html',
        controller: 'DatasetDetailCtrl' });
  })
  .run(function($state) {
        $state.go('datasets-list');
  });
