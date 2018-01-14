(function() {
"use strict";

var API_ENDPOINT = '/api';
    
var app = new Vue({
    el: '#main',
    template: '#app',
    data: function() {
        return {
            restaurantsCount: '',
        };
    },
    methods: {
        fetchRestaurantsCount: function() {
            var self = this;
            axios.get(API_ENDPOINT + '/restaurants/count').then(function(response) {
                self.restaurantsCount = response.data;
            });
        },
    },
    mounted: function() {
        this.fetchRestaurantsCount();
    }
});
    
})(); 