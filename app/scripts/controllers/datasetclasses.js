'use strict';

/**
 * @ngdoc function
 * @name rhizomerEyeApp.controller:DatasetClassesCtrl
 * @description
 * # DatasetClassesCtrl
 * Controller of the rhizomerEyeApp
 */
angular.module('rhizomerEyeApp')
  .controller('DatasetClassesCtrl', function ($scope, $state, $stateParams, Dataset) {

    $scope.dataset = Dataset.get({id : $stateParams.id});
    $scope.classes = Dataset.getClasses({id : $stateParams.id});

    $scope.refreshClasses = function() {
      Dataset.updateClasses({id: $stateParams.id}, []).$promise
        .then(function () {
          $scope.classes = Dataset.getClasses({id : $stateParams.id});
        })
        .catch(function (error) {
          $scope.error = error;
        });
    };

  });
