/**
 * angular-spinner version 0.5.1
 * License: MIT.
 * Copyright (C) 2013, 2014, Uri Shaked and contributors.
 */

(function (root) {
	'use strict';

	function factory(angular, Spinner) {

		angular
			.module('angularSpinner', [])

			.provider('usSpinnerService', function () {
				var config = {};
				var timeouts = {};

				config.timeout = 15000;

				this.$get = ['$rootScope', '$timeout', function ($rootScope, $timeout) {
					config.spin = function (key) {
						$rootScope.$broadcast('us-spinner:spin', key);
						timeoutStart(key);
					};

					config.stop = function (key) {
						$rootScope.$broadcast('us-spinner:stop', key);
						timeoutStop(key);
					};

					var timeoutStart = function (key) {
						timeouts[key] = $timeout(function () {
							$rootScope.$broadcast('us-spinner:timeout');
						}, config.timeout);
					};

					var timeoutStop = function (key) {
						$timeout.cancel(timeouts[key]);
					};


					return config;
				}];
			})

			.directive('btn', function () {
				return {
					restrict: 'C',
					link: function postLink(scope, element, attrs) {

						if (attrs.ngDisabled || attrs.noSpinnerDisable) {
							return;
						}
						scope.$on('us-spinner:spin', function (event, key) {
							element.attr('disabled', true);
						});

						scope.$on('us-spinner:stop', function (event, key) {
							element.attr('disabled', false);
						});

						scope.$on('$destroy', function () {
							element.attr('disabled', false);
						});
					}
				};
			})

			.directive('usSpinner', ['$window', function ($window) {
				return {
					scope: true,
					link: function (scope, element, attr) {
						var SpinnerConstructor = Spinner || $window.Spinner;

						scope.spinner = null;

						scope.key = angular.isDefined(attr.spinnerKey) ? attr.spinnerKey : false;

						scope.startActive = angular.isDefined(attr.spinnerStartActive) ?
							scope.$eval(attr.spinnerStartActive) : scope.key ?
							false : true;

						function stopSpinner() {
							if (scope.spinner) {
								scope.spinner.stop();
							}
						}

						scope.spin = function () {
							if (scope.spinner) {
								scope.spinner.spin(element[0]);
							}
						};

						scope.stop = function () {
							scope.startActive = false;
							stopSpinner();
						};

						scope.$watch(attr.usSpinner, function (options) {
							stopSpinner();
							scope.spinner = new SpinnerConstructor(options);
							if (!scope.key || scope.startActive) {
								scope.spinner.spin(element[0]);
							}
						}, true);

						scope.$on('us-spinner:spin', function (event, key) {
							if (key === scope.key) {
								scope.spin();
							}
						});

						scope.$on('us-spinner:stop', function (event, key) {
							if (key === scope.key) {
								scope.stop();
							}
						});

						scope.$on('$destroy', function () {
							scope.stop();
							scope.spinner = null;
						});
					}
				};
			}]);
	}

	if (typeof define === 'function' && define.amd) {
		/* AMD module */
		define(['angular', 'spin'], factory);
	} else {
		/* Browser global */
		factory(root.angular);
	}
}(window));
