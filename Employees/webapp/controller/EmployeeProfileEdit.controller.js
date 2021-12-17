sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    'sap/m/MessageToast',

],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, Controller, MessageToast) {
        "use strict";

        return BaseController.extend("com.accenture.demo.empleadosui.controller.EmployeeProfileEdit", {


            onInit: function () {

                var oModel = new sap.ui.model.odata.v2.ODataModel({ serviceUrl: "/employee" });

                this.getView().setModel(oModel, "oEmpleados");

                var oRouter = this.getRouter();

                oRouter.getRoute("EmployeeProfileEdit").attachMatched(this._onRouteMatched, this); /* Recoge la ruta definida en el manifest */

            },

            /* Coge el ID del perfil seleccionado en la tabla Main y muestra los datos del OData */
            _onRouteMatched: function (oEvent) {
                this.getView().getModel("oEmpleados").refresh()
                
                var oArgs, oView;
                oArgs = oEvent.getParameter("arguments"); /* Recoge el argumento ID, el cual recoge de App.controller onPressNavigationEdit*/
                oView = this.getView();

                oView.bindElement({
                    path: "oEmpleados>/Employees(" + oArgs.employeeId + ")", /* employeeID corresponde a la ruta definida en el manifest */
                    parameters: { expand: 'location,category' }

                });
            },
            


            /* Boton para guardar el perfil una vez ha sido editado */
            onSaveProfile: function () {

                /* Recogemos los valores introducidos en los Inputs */
                let ID = parseInt(this.getView().byId("idUpdate").getValue());
                let employee_name = this.getView().byId("nameUpdate").getValue();
                let location_ID = parseInt(this.getView().byId("locationUpdate").getSelectedItem().getProperty("key"));
                let category_ID = parseInt(this.getView().byId("categoryUpdate").getSelectedItem().getProperty("key"));
                let employee_age = parseInt(this.getView().byId("ageUpdate").getValue());
                let employee_salary = parseInt(this.getView().byId("salaryUpdate").getValue());

                /* Actualizamos el perfil por el metodo UPDATE, siempre especificando la ID */
                this.getView().getModel('oEmpleados').update("/Employees("+ID+")", { employee_name, location_ID, category_ID, employee_age, employee_salary }, {
                    
                    success: function (data) {

                        const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                        MessageToast.show(oBundle.getText("EmployeeUpdated"));

                        this.getView().getModel("oEmpleados").refresh()


                    }.bind(this)
                    , error: function (error) {

                        console.log(error)
                        alert("Error")

                        let oErrorMessage = JSON.parse(error.messageText)

                        sap.m.MessageBox.error(oErrorMessage.content, {
                            title: "{i18n>Error}",
                            initialFocus: null
                        });

                    }
                })


            },


            /* Boton BACK para volver al Main View */
            onCancelProfile: function () {

                this.getRouter().navTo("Main");

            },

            /* Boton CANCEL para volver al Employee Profile View */
            onPressNavigation: function (oEvent) {

                var oItem = oEvent.getSource();

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("EmployeeProfile", {
                    employeeId: oItem.getBindingContext("oEmpleados").getProperty("ID")
                });
                

            },

            /* Crea el fragment para editar la URL de la foto de perfil */
            _getDialog: function () {
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment("com.accenture.demo.empleadosui.view.EditPhoto", this);
                    this.getView().addDependent(this._oDialog);
                }
                return this._oDialog;
            },

            /* Abre el fragmento de la foto */
            onPressPictureDialog: function() {
                this._getDialog().open();
            },

            /* Cierra el fragmento de la foto */
            onCloseDialog: function () {
                this._getDialog().close();
                this._oDialog.destroy();
                this._oDialog = undefined
            },

            /* Guarda la nueva foto por el método UPDATE en el perfil */
            onSubmitButton: function() {

                let profile_image = sap.ui.getCore().byId("photoEdit").getValue();
                let ID = parseInt(this.getView().byId("idUpdate").getValue());

                this.getView().getModel('oEmpleados').update("/Employees("+ID+")", { profile_image }, {
                    
                    success: function (data) {

                        const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                        MessageToast.show(oBundle.getText("PhotoUpdated"));

                        this.onCloseDialog()
                        this.getView().getModel("oEmpleados").refresh()
                        

                    }.bind(this)
                    , error: function (error) {

                        console.log(error)
                        alert("{i18n>Error}")

                        let oErrorMessage = JSON.parse(error.messageText)

                        sap.m.MessageBox.error(oErrorMessage.content, {
                            title: "{i18n>Error}",
                            initialFocus: null
                        });

                    }
                })
            }

        });
    });
