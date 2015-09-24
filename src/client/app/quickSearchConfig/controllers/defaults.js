//TODO: DH
(function () {
    'use strict';

    angular
        .module('app.quickSearchConfig')
        .controller('DefaultsController', DefaultsController);

    DefaultsController.$inject = ['$scope', '$rootScope', '$stateParams', '$state', 'quickSearchConfigService'];
    /* @ngInject */
    function DefaultsController($scope, $rootScope, $stateParams, $state, quickSearchConfigService) {
        var vm = this;
        vm.editMode = false;
        vm.formId = null;
        vm.state = '';
        vm.go = go;
        vm.next = next;
        vm.previous = previous;
        vm.save = save;
        vm.cancel = cancel;
        vm.isLoading = false;
        $rootScope.isDirty = false;
        vm.formState = {
            defaultsForm: {}
        };

        vm.toggleSections = toggleSections;
        vm.sectionsOpen = false;

        vm.model = {};

        vm.fields = [];

        activate();

        $scope.$watch('vm.formState.defaultsForm.$dirty', function (newVal, oldVal) {
            if (!_.isUndefined(newVal)) {
                if (newVal) {
                    $rootScope.isDirty = true;
                }
            }
        });

        function activate() {
            vm.editMode = $stateParams.editMode;
            vm.formId = $stateParams.formId;
            vm.state = $state.current.name;
            initialize();
        }

        function initialize() {
            vm.model = {};
            quickSearchConfigService.getDefaults().then(function (data) {
                vm.clientId = data.clientId;
                vm.formId = data.formId;
                vm.model = data.data;
                vm.fields = data.form.pages.$values[0].fields.$values;
                _.each(vm.fields, function(field){
                   field.data.fields = field.data.fields.$values;
                    _.each(field.data.fields, function(item){
                        if(item.type === 'select'){
                            item.templateOptions.options = item.templateOptions.options.$values;
                        }
                    });
                });
            });
        }

        function toggleSections() {
            vm.sectionsOpen = !vm.sectionsOpen;
            _.each(vm.fields, function (field) {
                field.templateOptions.open = vm.sectionsOpen;
            });
        }

        function go(state) {
            if (vm.editMode.toLowerCase() == 'true') {
                $state.go(state, {editMode: vm.editMode, formId: vm.formId});
            }
        }

        function next() {
            $state.go('quickSearchConfigProducts', {editMode: vm.editMode, formId: vm.formId});
        }

        function previous() {
            $state.go('quickSearchConfigInputs', {editMode: vm.editMode, formId: vm.formId});
        }

        function cancel() {
            initialize();
            vm.formState.defaultsForm.$setPristine(true);
            $rootScope.isDirty = false;
        }

        function save() {
            quickSearchConfigService.postDefaults(vm.clientId, vm.formId, vm.model).then(function (data) {
                vm.formState.defaultsForm.$setPristine(true);
                $rootScope.isDirty = false;
            });
        }
    }
})();