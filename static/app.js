(function() {
"use strict";

var API_ENDPOINT = '/api';
    
var app = new Vue({
    el: '#main',
    template: '#app',
    data: function() {
        return {
            page: 0,
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
        fetchRestaurants: function() {
            var self = this;
            var options = {
                params: {
                    page: this.page,
                }
            };
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