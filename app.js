var app = angular.module("dashboard", ['chart.js']);
app.controller("dashboardCtrl", function($scope, $filter, $http) {
    // init
    var init = function() {
        $http.get("http://oncokb.org/api/v1/genes/673/variants").then(function(response) {
            buildTableData(response.data);
        });
    },
    buildTableData = function(response) {
        var list = [],
            terms = [],
            counts = {};

        for(var i = 0; i < response.length; i++) {
            if(response[i].gene.oncogene || response[i].gene.tsg) {
                list.push({
                    'alteration': response[i].alteration,
                    'hugo': response[i].gene.hugoSymbol,
                    'geneId': response[i].gene.entrezGeneId.toString(),
                    'oncoGene': response[i].gene.oncogene.toString(),
                    'tsg': response[i].gene.tsg.toString()
                })

                terms.push(response[i].consequence.term);
            }
        }

        terms.forEach(function(x) {
            counts[x] = (counts[x] || 0)+1;
        });

        $scope.labels = [];
        $scope.data = [[]];

        for (var key in counts) {
            $scope.labels.push(key);
            $scope.data[0].push(counts[key])
        }

        $scope.items = list;


        $scope.search();
    };
    $scope.sortingOrder = '';
    $scope.reverse = false;
    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.itemsPerPage = 50;
    $scope.pagedItems = [];
    $scope.currentPage = 0;
    $scope.items = [];

    $scope.labels = [];
    $scope.series = [];
    $scope.data = [];


    var searchMatch = function (haystack, needle) {
        if (!needle) {
            return true;
        }
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };

    // init the filtered items
    $scope.search = function () {
        $scope.filteredItems = $filter('filter')($scope.items, function (item) {
            for(var attr in item) {
                if (searchMatch(item[attr], $scope.query))
                    return true;
            }
            return false;
        });
        // take care of the sorting order
        if ($scope.sortingOrder !== '') {
            $scope.filteredItems = $filter('orderBy')($scope.filteredItems, $scope.sortingOrder, $scope.reverse);
        }
        $scope.currentPage = 0;
        // now group by pages
        $scope.groupToPages();
    };

    // calculate page in place
    $scope.groupToPages = function () {
        $scope.pagedItems = [];

        for (var i = 0; i < $scope.filteredItems.length; i++) {
            if (i % $scope.itemsPerPage === 0) {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)] = [ $scope.filteredItems[i] ];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.itemsPerPage)].push($scope.filteredItems[i]);
            }
        }
    };

    $scope.range = function (start, end) {
        var ret = [];
        if (!end) {
            end = start;
            start = 0;
        }
        for (var i = start; i < end; i++) {
            ret.push(i);
        }
        return ret;
    };

    $scope.prevPage = function () {
        if ($scope.currentPage > 0) {
            $scope.currentPage--;
        }
    };

    $scope.nextPage = function () {
        if ($scope.currentPage < $scope.pagedItems.length - 1) {
            $scope.currentPage++;
        }
    };

    $scope.setPage = function () {
        $scope.currentPage = this.n;
    };

    // change sorting order
    $scope.sort_by = function(newSortingOrder) {
        if ($scope.sortingOrder == newSortingOrder)
            $scope.reverse = !$scope.reverse;

        $scope.sortingOrder = newSortingOrder;

        // icon setup
        $('th i').each(function(){
            // icon reset
            $(this).removeClass().addClass('glyphicon glyphicon-sort');
        });
        if ($scope.reverse)
            $('th.'+newSortingOrder+' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
        else
            $('th.'+newSortingOrder+' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
    };

    init();
});


