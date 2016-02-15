'use strict';

/**
 * @ngdoc function
 * @name rhizomerEyeApp.controller:DatasetDetailCtrl
 * @description
 * # DatasetDetailCtrl
 * Controller of the rhizomerEyeApp
 */
angular.module('rhizomerEyeApp')
  .controller('DatasetDetailCtrl', function ($scope, $stateParams, Dataset) {

    $scope.dataset = Dataset.get({id : $stateParams.id});

  });
