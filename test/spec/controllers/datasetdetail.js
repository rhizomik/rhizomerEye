'use strict';

describe('Controller: DatasetDetailCtrl', function () {

  // load the controller's module
  beforeEach(module('rhizomerEyeApp'));

  var DatasetdetailctrlCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DatasetDetailCtrl = $controller('DatasetDetailCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(DatasetDetailCtrl.awesomeThings.length).toBe(3);
  });
});
