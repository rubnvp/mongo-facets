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
        },
        nextPage: function() {
            this.page++;
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
        },
        isFacetSelected: function(facet) {
            var facetList = this.selectedFacets[facet.type];
            if (!facetList) return false;
            return facetList.indexOf(facet.value) !== -1;
        },
        fetchRestaurantsAndFacets: function() {
            var self = this;
            var options = {
                params: {
                    page: this.page,
                    cuisines: this.selectedFacets.cuisine.join(','),
                    boroughs: this.selectedFacets.borough.join(','),
                }
            };

            if (!options.params.cuisines.length) delete options.params.cuisines;
            if (!options.params.boroughs.length) delete options.params.boroughs;

            axios.get(API_ENDPOINT + '/restaurants', options).then(function(response) {
                self.restaurants = response.data.restaurants;
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
    computed: {
        filters: function() { // computed property to watch
            return {
                page: this.page,
                cuisine: this.selectedFacets.cuisine,
                borough: this.selectedFacets.borough,
            };
        },
    },
    watch: {
        filters: function() { // fetch restaurants every time filters change
            this.fetchRestaurantsAndFacets();
        },
    },
    mounted: function() {
        this.fetchRestaurantsCount();
        this.fetchRestaurantsAndFacets();
    }
});
    
})(); 