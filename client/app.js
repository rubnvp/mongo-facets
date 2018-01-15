(function() {
"use strict";

var API_ENDPOINT = '/api';
    
var app = new Vue({
    el: '#main',
    template: '#app',
    data: function() {
        return {
            page: 0,
            pageSize: 50,
            search: '',
            selectedFacets: {
                cuisine: [],
                borough: [],
                zipcode: [],
            },
            facets: {
                cuisine: [],
                borough: [],
                zipcode: [],
            },
            restaurants: [],
            restaurantsCount: '',
        };
    },
    computed: {
        pagesCount: function() {
            return Math.floor(this.restaurantsCount / this.pageSize) + 1;
        },
        previousPageDisabled: function() {
            return this.page === 0;
        },
        nextPageDisabled: function() {
            return this.page === this.pagesCount - 1;
        },
    },
    watch: {
        search: function() {
            this.page = 0;
            this.fetchRestaurants();
            this.fetchFacets();
        },
    },
    methods: {
        previousPage: function() {
            this.page--;
            this.fetchRestaurants();
        },
        nextPage: function() {
            this.page++;
            this.fetchRestaurants();
        },
        facetClicked: function(facet) {
            var facetList = this.selectedFacets[facet.type];
            if (!facetList) return;

            var facetIndex = facetList.indexOf(facet.value);
            // add facet
            if (facetIndex === -1 ) {
                facetList.push(facet.value);
            }
            else { // remove facet
                facetList.splice(facetIndex, 1);
            }
            this.page = 0;
            this.fetchRestaurants();
            this.fetchFacets();
        },
        isFacetSelected: function(facet) {
            var facetList = this.selectedFacets[facet.type];
            if (!facetList) return false;
            return facetList.indexOf(facet.value) !== -1;
        },
        getQueryOptions: function() {
            var options = {
                params: {
                    page: this.page,
                    page_size: this.pageSize,
                    search: this.search,
                    boroughs: this.selectedFacets.borough.join(','),
                    cuisines: this.selectedFacets.cuisine.join(','),
                    zipcodes: this.selectedFacets.zipcode.join(','),
                }
            };
            if (this.page <= 0) delete options.params.page;
            if (!this.search) delete options.params.search;
            if (!options.params.boroughs) delete options.params.boroughs;
            if (!options.params.cuisines) delete options.params.cuisines;
            if (!options.params.zipcodes) delete options.params.zipcodes;
            return options;
        },
        fetchRestaurants: function() {
            var self = this;
            var options = this.getQueryOptions();
            axios.get(API_ENDPOINT + '/restaurants', options).then(function(response) {
                self.restaurants = response.data.restaurants;
                self.restaurantsCount = response.data.count;
            });
        },
        fetchFacets: function() {
            var self = this;
            var options = this.getQueryOptions();
            delete options.params.page;
            delete options.params.page_size;
            axios.get(API_ENDPOINT + '/restaurants/facets', options).then(function(response) {
                self.facets.borough = _getOrderedFacets(
                    self.selectedFacets.borough,
                    response.data.borough,
                    'borough'
                );
                self.facets.cuisine = _getOrderedFacets(
                    self.selectedFacets.cuisine,
                    response.data.cuisine,
                    'cuisine'
                );
                self.facets.zipcode = _getOrderedFacets(
                    self.selectedFacets.zipcode,
                    response.data.zipcode,
                    'zipcode'
                );
            });
        },
    },
    mounted: function() {
        this.fetchRestaurants();
        this.fetchFacets();
    }
});

function _getOrderedFacets(selectedValues, facets, type) {
    return selectedValues
        .map(function(value) { // get selected facets (and add count if exists)
            var facet = facets.find(function(facet) {
                return facet.value === value;
            });
            return {
                value: value,
                count: (facet && facet.count) || 'x',
            };
        })
        .concat( // then add unselect facets (excluding the ones that are selected)
            facets.filter(function(facet){ 
                return selectedValues.indexOf(facet.value) === -1;
            })
        )
        .map(function(facet) {
            facet.type = type;
            return facet;
        });
}
    
})(); 