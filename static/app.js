(function() {
"use strict";

var API_ENDPOINT = '/api';
    
var app = new Vue({
    el: '#main',
    template: '#app',
    data: function() {
        return {
            page: 0,
            selectedFacets: {
                cuisine: [],
                borough: [],
            },
            facets: {
                cuisine: [],
                borough: [],
            },
            restaurants: [],
            restaurantsCount: '',
        };
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
                    cuisines: this.selectedFacets.cuisine.join(','),
                    boroughs: this.selectedFacets.borough.join(','),
                }
            };
            if (this.page <= 0) delete options.params.page;
            if (!options.params.cuisines.length) delete options.params.cuisines;
            if (!options.params.boroughs.length) delete options.params.boroughs;
            return options;
        },
        fetchRestaurants: function() {
            var self = this;
            var options = this.getQueryOptions();
            axios.get(API_ENDPOINT + '/restaurants', options).then(function(response) {
                self.restaurants = response.data;
            });
        },
        fetchFacets: function() {
            var self = this;
            var options = this.getQueryOptions();
            delete options.params.page;
            axios.get(API_ENDPOINT + '/restaurants/facets', options).then(function(response) {
                self.facets.cuisine = response.data.cuisines;
                self.facets.borough = response.data.boroughs;
            });
        },
        fetchRestaurantsCount: function() {
            var self = this;
            return axios.get(API_ENDPOINT + '/restaurants/count').then(function(response) {
                self.restaurantsCount = response.data;
            });
        },
    },
    mounted: function() {
        this.fetchRestaurantsCount();
        this.fetchRestaurants();
        this.fetchFacets();
    }
});
    
})(); 