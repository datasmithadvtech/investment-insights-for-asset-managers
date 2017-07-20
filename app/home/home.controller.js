(function () {

  'use strict';

  angular
    .module('app')
    .controller('HomeController', homeController);


  function homeController($scope, authService, $http, $location) {
    var vm = this;
    vm.auth = authService;
    vm.login = login;
    $scope.oneAtATime = true;
    var mapping = [
        { name: 'technology',file: '/data/technology_holdings.json'},
        { name: 'pharmaceutical',file: '/data/pharma_holdings.json'}
    ];

    var holdingsArray = [];
    // login function making a call to signin that comes from auth service and send the user profile to the profile that user is logged in with. If all good the storing user profile on local storage.
    function login() {
        //profile will hold user profile info and the token will get us the jwt
        auth.signin({}, function (profile, token) {
            store.set('profile', profile);
            store.set('id_token', token);
            $location.path('/test'); // user is sent to home page
        }, function (error){
            console.log(error);
        });
    }

// porfolio function
   vm.initialSetup = function ()
    {
    //Reading Porfolios JSON
     $http({
        method: 'GET',
        url: '/data/portfolios.json'
     }).then(function(result){
         $scope.portfolios = result.data.portfolios;
         
        if(result !== null && (result.data !== null || result.data !== ''))
            {
                //console.log(replaceAll(JSON.stringify(result.data),"currentdate",currentISOTimestamp()));
                //Creating Porfolios
                $http({
                    method: 'POST',
                    url: '/api/bulkportfolios',
                    data: replaceAll(JSON.stringify(result.data),"currentdate",currentISOTimestamp())
                    })
                    .then(function(response) {
                        //Reading Holdings JSON one at a time.
                         angular.forEach(mapping,function(value,key){
                           $http({
                                method: 'GET',
                                url: value.file
                            })
                            .then(function(holdings){
                                //console.log("HOLDINGS JSON:" + holdings.data);
                                //Creating Holdings and mapping them to respective portfolio
                                $http({
                                method: 'POST',
                                url: '/api/holdings/'+ value.name,
                                data: holdings.data
                            })
                            .then(function(holdingsresult){
                                //console.log("HOLDINGS CREATION result:" + holdingsresult.data);
                            },function(err) {
                                console.log("CREATE HOLDINGS FAILED");
                             });
                            },function(err) {
                          });
                         }
                        );
                        }, function(err) {
                            console.log("CREATE PORTFOLIOS FAILED");
                        });
            }
        
         //return replaceAll(JSON.stringify(result.data),"currentdate",currentISOTimestamp());
     },function(err){

     });
      
    }

  vm.toDiscovery = function(companyname)
  {
      //alert(companyname);
  }

  vm.getHoldings = function (portfolio)
  {
      $scope.holdings = "";
      switch(portfolio.name){
          case 'technology':
                  //alert("technology");
                    returnHoldings("technology");
                    break;

          case 'pharmaceutical':
                  //alert("pharma");
                    returnHoldings("pharmaceutical");
                    break;
      }
  }

function returnHoldings(portfolioname)
 {
   $http({
          method: 'GET',
          url: '/api/holdings/'+ portfolioname
         })
         .then(function(holdings){
            $scope.holdings = holdings.data.holdings[0].holdings;
        });
 }
}
// PRIVATE FUNCTIONS
  function currentISOTimestamp(){
    return new Date().toISOString();
}
function replaceAll(str, find, replace) {
    //console.log("REPLACE CALLED");
    return str.replace(new RegExp(find, 'g'), replace);
}

homeController.$inject = ['$scope', 'authService', '$http'];

})();
