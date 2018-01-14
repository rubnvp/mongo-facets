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
            },
            facetCusine: [
                {label: 'American (100)', value: 'American', type: 'cuisine'},
                {label: 'Delicatessen (100)', value: 'Delicatessen', type: 'cuisine'},
            ],
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
        fetchRestaurants: function() {
            var self = this;
            var options = {
                params: {
                    page: this.page,
                    cuisines: this.selectedFacets.cuisine.join(','),
                }
            };
            if (!options.params.cuisines.length) delete options.params.cuisines;
            return axios.get(API_ENDPOINT + '/restaurants/', options).then(function(response) {
                self.restaurants = response.data;
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
            };
        },
    },
    watch: {
        filters: function() { // fetch restaurants every time filters change
            this.fetchRestaurants();
        },
    },
    mounted: function() {
        this.fetchRestaurantsCount();
        this.fetchRestaurants();
    }
});
    
})(); 