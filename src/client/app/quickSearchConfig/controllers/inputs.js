//TODO: DH
(function () {
    'use strict';

    angular
        .module('app.quickSearchConfig')
        .controller('InputsController', InputsController);

    InputsController.$inject = ['logger', '$scope', '$stateParams', '$state', '$rootScope', 'quickSearchConfigService'];
    /* @ngInject */
    function InputsController(logger, $scope, $stateParams, $state, $rootScope, quickSearchConfigService) {
        var vm = this;
        vm.editMode = false;
        vm.formId = null;

        vm.go = go;
        vm.next = next;
        vm.previous = previous;
        vm.state = '';
        vm.cancel = cancel;
        vm.save = save;
        vm.resetForm = resetForm;

        vm.title = 'Inputs';
        vm.header = "";
        vm.footer = "";
        vm.isLoading = false;
        $rootScope.isDirty = false;
        vm.formState = {
            inputsForm: {}
        };

        vm.previewModel = {};
        vm.previewFields = [];
        vm.optionsVisible = [];

        vm.setPreview = setPreview;
        vm.moveRowUp = moveRowUp;
        vm.moveRowDown = moveRowDown;
        vm.toggleOptions = toggleOptions;
        vm.updatePreview = updatePreview;
        vm.updateOptionDefault = updateOptionDefault;
        vm.closeOptions = closeOptions;

        activate();

        $scope.$watch('vm.formState.inputsForm.$dirty', function (newVal, oldVal) {
            if (!_.isUndefined(newVal)) {
                if (newVal) {
                    $rootScope.isDirty = true;
                }
            }
        });

        function activate() {
            logger.info('Activated Inputs View');

            vm.editMode = $stateParams.editMode;
            vm.formId = $stateParams.formId;
            vm.state = $state.current.name;

            initialize();
        }

        function initialize() {
            quickSearchConfigService.getInputs().then(function (data) {
                vm.data = data;
                //vm.formFields = data.fields;
                vm.updatePreview();
            });
        }

        function setPreview(index) {
            vm.data.fields[index].templateOptions.visible = !vm.data.fields[index].templateOptions.visible;
            console.log("Index: " + index + ", visible:" + vm.data.fields[index].templateOptions.visible);
            vm.updatePreview();
            $rootScope.isDirty = true;
        }

        function moveRowUp(index) {
            console.log("UP: Index: " + index);
            var ff = vm.data.fields;
            var pf = vm.previewFields;

            var fItem = ff.slice(0)[index];
            var pItem = pf.slice(0)[index];

            if (index != 0) {
                ff.splice(index, 1);
                ff.splice(index - 1, 0, fItem);
                pf.splice(index, 1);
                pf.splice(index - 1, 0, pItem);
            } else {
                ff.shift();
                ff.push(fItem);
                pf.shift();
                pf.push(pItem);
            }
            for (var i = 0; i < ff.length; i++) {
                ff[i].templateOptions.order = i;
            }
            vm.updatePreview();
            closeOptions();
            $rootScope.isDirty = true;
        }

        function moveRowDown(index) {
            console.log("DOWN: Index: " + index);
            var ff = vm.data.fields;
            var pf = vm.previewFields;

            var fItem = ff.slice(0)[index];
            var pItem = pf.slice(0)[index];

            if (index + 1 != ff.length) {
                ff.splice(index, 1);
                ff.splice(index + 1, 0, fItem);
                pf.splice(index, 1);
                pf.splice(index + 1, 0, pItem);
            } else {
                ff.pop();
                ff.unshift(fItem);
                pf.pop();
                pf.unshift(pItem);
            }
            for (var i = 0; i < ff.length; i++) {
                ff[i].templateOptions.order = i;
            }
            vm.updatePreview();
            closeOptions();
            $rootScope.isDirty = true;
        }

        function updatePreview() {
            var ff = vm.data.fields;
            var pf = vm.previewFields = [];

            for (var i = 0; i < ff.length; i++) {
                var pItem = {};
                angular.copy(ff[i], pItem);

                if (pItem.templateOptions.visible == true) {
                    if (pItem.templateOptions.options) {
                        var options = _.clone(pItem.templateOptions.options);

                        var newOptions = [];
                        for (var j = 0; j < options.length; j++) {

                            var optionsItem = _.clone(options[j]);
                            if (optionsItem.visible == true) {
                                newOptions.push(optionsItem);
                            }
                        }

                        pItem.templateOptions.options = newOptions;
                        console.log(ff[0].templateOptions.options);
                    }
                    pf.push(pItem);
                }
            }

            console.log(ff[0].templateOptions.options);
            console.log(pf.length);
        }

        function closeOptions() {
            var ff = vm.data.fields;
            for (var i = 0; i < ff.length; i++) {
                vm.optionsVisible[i] = false;
            }
        }

        function toggleOptions(index, e) {

            var onOff = vm.optionsVisible[index];
            vm.optionsVisible[index] = !onOff;
            var target = $(e.target);
            if (target.is("button")) {
                target = target.find("i");
            }
            console.log(target.is('i'));
            if (onOff == true) {
                target.removeClass("fa-angle-double-up").addClass("fa-angle-double-down");
            } else {
                target.removeClass("fa-angle-double-down").addClass("fa-angle-double-up");
            }
        }

        function updateOptionDefault(field, option) {
            _.each(field.templateOptions.options, function(item){
                if(item == option){
                    field.defaultValue = option.value;
                    vm.previewModel[field.key] = option.value;
                }else{
                    item.selected = false;
                }
            });
            vm.updatePreview();
            //var ff = vm.data.fields[parentIndex];
            //var checked = $(e.target).prop("checked");
            //console.log($(e.target).prop("checked"));
            //if (checked == true) {
            //    ff.templateOptions.defaultValue = ff.templateOptions.options[index].value;
            //} else {
            //    ff.templateOptions.defaultValue = '';
            //}
            //$(e.target).closest("div").parent().find("input")
            //    .not(e.target).attr("checked", false);
            //console.log(parentIndex + ", " + index + ", " + ff.templateOptions.defaultValue);
        }

        function go(state) {
            if (vm.editMode.toLowerCase() == 'true') {
                $state.go(state, {editMode: vm.editMode, formId: vm.formId});
            }
        }

        function next() {
            $state.go('quickSearchConfigDefaults', {
                editMode: vm.editMode,
                formId: vm.formId
            });
        }

        function previous() {
            $state.go('quickSearchConfig');
        }

        function resetForm() {
            _.each(vm.data.fields, function (item) {
                item.templateOptions.label = item.templateOptions.defaultLabel;
                item.templateOptions.order = item.templateOptions.defaultOrder;
            });

            vm.data.fields = vm.data.fields.sort(function(obj1, obj2){
                return obj1.templateOptions.order - obj2.templateOptions.order;
            });

            $rootScope.isDirty = true;
            vm.updatePreview();
        }

        function cancel() {
            initialize();
            vm.formState.inputsForm.$setPristine(true);
            $rootScope.isDirty = false;
        }

        function save() {
            //TODO post vm.data
            vm.formState.inputsForm.$setPristine(true);
            $rootScope.isDirty = false;
        }
    }
})();
