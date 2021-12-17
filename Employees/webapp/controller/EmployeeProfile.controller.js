sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",

],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, Controller) {
        "use strict";

        return BaseController.extend("com.accenture.demo.empleadosui.controller.EmployeeProfile", {


            onInit: function () {

                var oModel = new sap.ui.model.odata.v2.ODataModel({ serviceUrl: "/employee" });

                this.getView().setModel(oModel, "oEmpleados");
                

                var oRouter = this.getRouter();

                oRouter.getRoute("EmployeeProfile").attachMatched(this._onRouteMatched, this); /* Recoge la ruta definida en el manifest */

            },

            /* Coge el ID del perfil seleccionado en la tabla Main y muestra los datos del OData */
            _onRouteMatched: function (oEvent) {
                
                this.getView().getModel("oEmpleados").refresh()
                var oArgs, oView;
                oArgs = oEvent.getParameter("arguments"); /* Recoge el argumento ID, el cual recoge de App.controller onPressNavigation */
                oView = this.getView();

                oView.bindElement({
                    path: "oEmpleados>/Employees(" + oArgs.employeeId + ")", /* employeeID corresponde a la ruta definida en el manifest */
                    parameters: { expand: 'location,category' } 

                });
            },


            /* Boton que nos lleva al Edit View para poder editar el perfil */
            onPressNavigationEdit: function (oEvent) {

                var oItem = oEvent.getSource();

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("EmployeeProfileEdit", {
                    employeeId: oItem.getBindingContext("oEmpleados").getProperty("ID")
                });

            },


            /* Boton para volver al Main View */
            onCancelProfile: function (oEvent) {

                this.getRouter().navTo("Main");
                

            },


            




        });
    });
