'use strict';

/**
 * @ngdoc directive
 * @name rhizomerEyeApp.directive:checkboxGroup
 * @description
 * # checklistModel
 */
angular.module('rhizomerEyeApp')
  .directive('checklistModel', function () {
    return {
      restrict: 'A',
      scope: {
        checklistModel: '=',
        checklistChanged: '=',
        checklistValue: '@'
      },
      link: function postLink(scope, element) {

        var checklistOriginal = angular.copy(scope.checklistModel);

        if (scope.checklistModel.indexOf(scope.checklistValue) >= 0) {
          element[0].checked = true;
        }

        element.bind('click', function() {
          var index = scope.checklistModel.indexOf(scope.checklistValue);

          if (element[0].checked && index < 0) {
            scope.checklistModel.push(scope.checklistValue);
          }
          else if (index >= 0) {
            scope.checklistModel.splice(index, 1);
          }

          scope.checklistChanged.value = scope.checklistModel.toString() !== checklistOriginal.toString();
          scope.$apply();

        });
      }
    };
  });
