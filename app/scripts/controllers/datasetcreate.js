'use strict';

/**
 * @ngdoc function
 * @name rhizomerEyeApp.controller:DatasetCreateCtrl
 * @description
 * # DatasetCreateCtrl
 * Controller of the rhizomerEyeApp
 */
angular.module('rhizomerEyeApp')
  .controller('DatasetCreateCtrl', function ($scope, $state, Dataset) {

    $scope.dataset = new Dataset();

    $scope.create = function(dataset) {
      Dataset.save(dataset).$promise
        .then(function () {
          $state.go('dataset-edit', {id: dataset.id});
        })
        .catch(function (error) {
          $scope.error = error;
        });
    };

  });
