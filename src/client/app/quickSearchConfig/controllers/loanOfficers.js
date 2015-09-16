(function () {
    'use strict';

    angular
        .module('app.quickSearchConfig')
        .controller('LoanOfficersController', LoanOfficersController);

    LoanOfficersController.$inject = ['logger', '$stateParams', '$state', 'modalService'];
    /* @ngInject */
    function LoanOfficersController(logger, $stateParams, $state, modalService) {
        var vm = this;
        vm.editMode = false;
        vm.formId = null;

        vm.state = '';
        vm.go = go;
        vm.next = next;
        vm.previous = previous;
        vm.cancel = cancel;
        vm.save = save;
        vm.isDirty = false;

        vm.filterText = '';
        vm.list1 = buildList();
        vm.list2 = [];
        vm.moveRight = moveRight;
        vm.selectCategory = selectCategory;
        vm.removeCategory = removeCategory;
        vm.removeItem = removeItem;
        vm.sortCategory = sortCategory;
        vm.sortItem = sortItem;
        vm.filterCategory = filterCategory;
        vm.filterItems = filterItems;

        activate();

        function activate() {
            //TODO call initialize and make some http call
            vm.editMode = $stateParams.editMode;
            vm.formId = $stateParams.formId;
            vm.state = $state.current.name;
        }

        var vm = this;
        vm.title = 'Admin';

        function buildList() {
            var cat = 1;
            var id = 1;
            var arr = [];

            for (var x = 0; x < 3; x++) {
                var items = [];

                for (var y = 0; y < 20; y++) {
                    items.push({
                        id: id,
                        name: 'Person ' + id,
                        selected: false,
                        picked: false,
                        sortOrder: 1
                    });
                    id = id + 1;
                }

                arr.push({
                    category: 'Location ' + cat,
                    selected: false,
                    sortOrder: 0,
                    items: items
                });
                cat = cat + 1;
            }
            return arr;
        }

        function moveRight() {
            //var currentCategory;
            //var itemsToMove = [];
            if (!_.isEmpty(vm.list2)) {
                var selectedCategories = getSelectedCategories();
            }
            //var biff = _.flatten(_.pluck(vm.list1, 'items'));
            //_.each(biff, function (item) {
            //    if (item.selected == true && !_.contains(pickedIds, item.id)) {
            //        var newItem = _.clone(item);
            //        newItem.selected = false;
            //        itemsToMove.push(newItem);
            //    }
            //});
            //vm.list2 = _.union(vm.list2, itemsToMove);

            _.each(vm.list1, function (category) {
                //currentCategory = category;
                _.each(category.items, function (item) {
                    if (item.selected == true) {
                        //if category does not exist add it
                        if (!_.contains(selectedCategories, category.category)) {
                            var newCategory = _.clone(category);
                            newCategory.items = [];
                            newCategory.selected = false;
                            vm.list2.push(newCategory);
                            selectedCategories = getSelectedCategories();
                        }
                        //add selected items to correct category
                        _.each(vm.list2, function (pickedCategory) {
                            var itemIds = _.pluck(pickedCategory.items, 'id');
                            if (pickedCategory.category == category.category && !_.contains(itemIds, item.id)) {
                                var newItem = _.clone(item);
                                newItem.selected = false;
                                item.picked = true;
                                pickedCategory.items.push(newItem);
                                return null;
                            }
                        });
                    }
                });
            });
            vm.isDirty = true;
        }

        function selectCategory(category) {
            category.selected = !category.selected;
            _.each(category.items, function (item) {
                item.selected = category.selected;
            });
        }

        function removeCategory(index, category) {
            unPickItems(category);
            vm.list2.splice(index, 1);
            vm.isDirty = true;
        }

        function removeItem(index, category, cIndex) {
            if (category.items.length > 1) {
                var x = category.items.splice(index, 1);
                unPickItem(x[0], category);
            } else {
                vm.list2.splice(cIndex, 1);
                unPickItems(category);
            }
            vm.isDirty = true;
        }

        function sortCategory(index, increment) {
            var num = index + increment;
            if ((num <= vm.list2.length - 1) && num >= 0) {
                vm.list2[index] = vm.list2.splice(num, 1, vm.list2[index])[0];
            }
            vm.isDirty = true;
        }

        function sortItem(index, increment, list) {
            var num = index + increment;
            if ((num <= list.length - 1) && num >= 0) {
                list[index] = list.splice(num, 1, list[index])[0];
            }
            vm.isDirty = true;
        }

        function filterCategory(category) {
            if (vm.filterText === undefined || vm.filterText.length < 3) {
                return true;
            }
            var found = false;
            if (category.category.indexOf(vm.filterText) > -1) {
                found = true;
            }
            _.each(category.items, function (item) {
                if (item.name.indexOf(vm.filterText) > -1) {
                    found = true;
                    return null;
                }
            });

            return found;
        }

        function filterItems(cat) {
            return function (item) {
                if (vm.filterText === undefined || vm.filterText.length < 3) {
                    return true;
                }
                var found = false;
                if (item.name.indexOf(vm.filterText) > -1) {
                    found = true;
                }
                var catCheck = false;

                _.forEach(cat.items, function (obj) {
                    if (catCheck) {
                        return null;
                    }
                    if (obj.name.indexOf(vm.filterText) > -1) {
                        catCheck = true;
                    }
                });

                if (!catCheck) {
                    found = true;
                }
                return found;
            }
        }

        function getSelectedCategories() {
            return _.pluck(vm.list2, 'category');
        }

        function unPickItems(category) {
            var srcCat = _.findWhere(vm.list1, {
                category: category.category
            });

            _.each(category.items, function (item) {
                _.each(srcCat.items, function (srcItem) {
                    if (item.id === srcItem.id) {
                        srcItem.picked = false;
                        return null;
                    }
                });
            });
        }

        function unPickItem(item, category) {
            var srcCat = _.findWhere(vm.list1, {
                category: category.category
            });

            _.each(srcCat.items, function (srcItem) {
                if (item.id === srcItem.id) {
                    srcItem.picked = false;
                    return null;
                }
            });
        }

        function go(state) {
            if (vm.editMode.toLowerCase() == 'true') {
                if (vm.isDirty) {
                    var template = 'app/blocks/modal/templates/confirm.html';
                    var controller = 'confirmModalController';
                    var title = 'Confirm';
                    var message = 'Navigating away from this page will discard your current changes. Do you wish to proceed?';

                    modalService.openConfirmModal(template, controller, null, title, message, null)
                        .then(function (isConfirmed) {
                            if (isConfirmed) {
                                $state.go(state, {editMode: vm.editMode, formId: vm.formId});
                            }
                        });
                } else {
                    $state.go(state, {editMode: vm.editMode, formId: vm.formId});
                }
            }
        }

        function next() {
            $state.go('quickSearchConfigResults', {
                editMode: vm.editMode,
                formId: vm.formId
            });
        }

        function previous() {
            $state.go('quickSearchConfigProducts', {
                editMode: vm.editMode,
                formId: vm.formId
            });
        }

        function cancel() {
            vm.isDirty = false;
        }

        function save() {
            //TODO post vm.data
            vm.isDirty = false;
        }
    }
})();
