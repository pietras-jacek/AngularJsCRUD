

function CreateCtrl ($scope, $location, BikesService) {
  $scope.action = 'Add'
  $scope.save = function() {
    BikesService.save($scope.bike, function() {
      $location.path('/')
    })
  }  
}

function ListCtrl ($scope, $http, BikesService) {
  var index = -1;

  //for pagination and searching
  $scope.limit = 25
  $scope.offset = 0 //this is the same as: (current page - 1)
  $scope.total = 0
  $scope.pageCount = 0

  $scope.bikes = BikesService.query()

  $scope.index = index; //currently selected element
  $scope.selectedId = -1; //actual id of selected bike

  $http.get('/api/bikes/total').success(function(body) {
    $scope.total = body.total
    $scope.pageCount = Math.floor($scope.total / $scope.limit) 
    if ($scope.total % $scope.limit !== 0)
      $scope.pageCount += 1
  })


  $scope.select = function(i) {
    $scope.index = index
    index = i
    $scope.selectedId = $scope.bikes[index].id
  }

  $scope.delete = function() {
    if (index >= 0) {
      BikesService.delete({id: $scope.bikes[index].id})
      $scope.bikes.splice(index, 1)
    }
  }

  $scope.loadPage = function (pg) {
    $scope.offset = pg - 1
    $scope.bikes = BikesService.query({offset: $scope.offset, limit: $scope.limit})
  }

}

function EditCtrl ($scope, $location, $routeParams, BikesService) {
  var id = $routeParams.id
  BikesService.get({id: id}, function(resp) {
    $scope.bike = resp.content  
  })

  $scope.action = "Update"


  $scope.save = function() {
    BikesService.update({id: id}, $scope.bike, function() {
      $location.path('/')
    })
  }
}

