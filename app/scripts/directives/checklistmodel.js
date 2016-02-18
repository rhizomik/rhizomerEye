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
      scope: true,
      link: function postLink(scope, element, attrs) {

        var checklistModel = scope.$eval(attrs.checklistModel);
        var checklistValue = attrs.checklistValue;

        if (checklistModel.indexOf(checklistValue) >= 0) {
          element[0].checked = true;
        }

        element.bind('click', function() {
          var index = checklistModel.indexOf(checklistValue);

          if (element[0].checked && index < 0) {
            checklistModel.push(checklistValue);
          }
          else if (index >= 0) {
            checklistModel.splice(index, 1);
          }
        });
      }
    };
  });
