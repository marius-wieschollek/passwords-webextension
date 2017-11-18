import Vue from 'vue';
import $ from "jquery";
import Manager from '@vue/Manager.vue';

$(window).on('load', function () {
    new Vue(Manager);
});