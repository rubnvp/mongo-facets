(function() {
"use strict";

var API_ENDPOINT = '/api';
    
var app = new Vue({
    el: '#main',
    template: '#app',
    data: function() {
        return {
            answer: '',
        };
    },
    methods: {
        helloAsk: function() {
            var self = this;
            axios.get(API_ENDPOINT + '/hello').then(function(response) {
                self.answer = response.data;
            });
        },
    },
});
    
})(); 