sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, Controller) {
        "use strict";

        return BaseController.extend("com.accenture.demo.empleadosui.controller.App", {

            onInit: function () {

                this.getRouter().navTo("Main");

            },

        });
    });
