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
      .state('create-dataset', {
        url: '/datasets/create',
        templateUrl: 'views/dataset-form.html',
        controller: 'DatasetCreateCtrl' })
      .state('dataset-edit', {
        url: '/datasets/{id}/edit',
        templateUrl: 'views/dataset-edit.html',
        controller: 'DatasetEditCtrl' });
  })
  .run(function($state) {
        $state.go('datasets-list');
  });
