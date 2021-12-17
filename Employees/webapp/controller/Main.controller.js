sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "com/accenture/demo/empleadosui/utils/Formatter",
    "com/accenture/demo/empleadosui/utils/Validator",
    'sap/m/MessageToast',
    "sap/ui/model/SimpleType",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/m/MessageBox",
    "sap/ui/core/ValueState",
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (BaseController, Controller, Filter, FilterOperator, Formatter, Validator, MessageToast, SimpleType, Dialog, DialogType, Button, ButtonType, Text, MessageBox, ValueState) {
        "use strict";

        return BaseController.extend("com.accenture.demo.empleadosui.controller.Main", {
            Formatter: Formatter,

            onInit: function () {

                this.getRouter().navTo("Main");

                sap.ui.getCore().attachValidationError(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.Error);
                });
                sap.ui.getCore().attachValidationSuccess(function (oEvent) {
                    oEvent.getParameter("element").setValueState(ValueState.None);
                });

                var oModel = new sap.ui.model.odata.v2.ODataModel({ serviceUrl: "/employee" });

                this.getView().setModel(oModel, "oEmpleados");

                this.getRouter().getRoute("Main").attachMatched(this._onRouteMatched, this);


            },


            _onRouteMatched: function () {

                var oTable = this.getView().byId("tabla01");

                if (oTable) {
                    let oBinding = oTable.getBinding("items");
                    oBinding.filter([]);

                    this.getView().byId("slCategory").setSelectedKey("")
                    this.getView().byId("slLocation").setSelectedKey("")
                }

            },

            /* Filtrar por localización */
            onSelectChangeLocation: function (oEvent) {

                let bSelected = oEvent.getSource().getSelectedItem().getProperty("key");
                let oTable = this.getView().byId("tabla01");
                let oBinding = oTable.getBinding("items");

                console.log(bSelected)

                oBinding.filter(
                    new Filter({
                        path: "location_ID",
                        variable: "location",
                        operator: FilterOperator.EQ,
                        value1: bSelected
                    })
                );

            },

            /* Filtrar por categoria */
            onSelectChangeCategory: function (oEvent) {

                let bSelected = oEvent.getSource().getSelectedItem().getProperty("key");
                let oTable = this.getView().byId("tabla01");
                let oBinding = oTable.getBinding("items");


                oBinding.filter(
                    new Filter({
                        path: "category_ID",
                        variable: "category",
                        operator: FilterOperator.EQ,
                        value1: bSelected
                    })
                );


            },

            onSelectFilter: function () {

                let oTable = this.getView().byId("tabla01");
                let sSelectLocation = this.getView().byId("slLocation").getProperty("selectedKey");
                let sSelectCategory = this.getView().byId("slCategory").getProperty("selectedKey");
                let oBinding = oTable.getBinding("items");
                let aFilters = [];

                if (sSelectLocation) {

                    oBinding.filter(
                        aFilters.push(
                            new Filter({
                                path: "location_ID",
                                variable: "location",
                                operator: FilterOperator.EQ,
                                value1: sSelectLocation
                            })
                        )

                    );
                }

                if (sSelectCategory) {

                    oBinding.filter(
                        aFilters.push(
                            new Filter({
                                path: "category_ID",
                                variable: "category",
                                operator: FilterOperator.EQ,
                                value1: sSelectCategory
                            })
                        )

                    );
                }

                let allFilter = new Filter(aFilters, true);

                oBinding.filter(allFilter);


            },

            /* Boton predefinido del Filter Bar para resetear filtros */
            onReset: function (oEvent) {

                let oTable = this.getView().byId("tabla01");
                let oBinding = oTable.getBinding("items");

                oBinding.filter([]);

                this.getView().byId("slCategory").setSelectedKey("")
                this.getView().byId("slLocation").setSelectedKey("")

            },





            /* Funcion para llamar al Fragment de New Employee */
            _getDialogNewEmp: function () {
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment("com.accenture.demo.empleadosui.view.NewEmployee", this);
                    this.getView().addDependent(this._oDialog);
                } 
                
                return this._oDialog;
            },


            /* Abre el fragmento New Employee */
            onTableNewEmployee: function () {
                this._getDialogNewEmp().open();
            },

            /* Cierra el fragmento New Employee */
            onCloseDialog: function () {
                this._getDialogNewEmp().close();
                this._oDialog.destroy();
                this._oDialog = undefined
                
            },

            /* dialogAfterclose: function(oEvent) {//function called after Dialog is closed
                this._oDialog.destroy();//destroy only the content inside the Dialog
            }, */

            /* Acción del boton Save de New Employee - Crea un nuevo perfil de usuario */
            onSubmitButton: function () {

                /* Obtenemos los valores introducimos en los Inputs del fragment New Employee */
                let ID = parseInt(sap.ui.getCore().byId("idInput").getValue());
                let employee_name = sap.ui.getCore().byId("nameInput").getValue();
                let location_ID = parseInt(sap.ui.getCore().byId("locationInput").getSelectedItem().getProperty("key"));
                let category_ID = parseInt(sap.ui.getCore().byId("categoryInput").getSelectedItem().getProperty("key"));
                let profile_image = sap.ui.getCore().byId("photoInput").getValue();
                let employee_age = parseInt(sap.ui.getCore().byId("ageInput").getValue());
                let employee_salary = parseInt(sap.ui.getCore().byId("salaryInput").getValue());

                /* Usando los valores obtenidos, creamos un nuevo Empleado en nuestro OData metiante el método CREATE */
                this.getView().getModel('oEmpleados').create("/Employees", { ID, employee_name, location_ID, category_ID, profile_image, employee_age, employee_salary }, {

                    success: function (data) {

                        this._getDialogNewEmp().close()
                        /* var sMessage = "New Employee Created";
                        MessageToast.show(sMessage); */
                        const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                        MessageToast.show(oBundle.getText("EmployeeCreated"));
                        this._oDialog.destroy();
                        this._oDialog = undefined
                        

                    }.bind(this)
                    , error: function (error) {

                        console.log(error)

                        let oErrorMessage = JSON.parse(error.messageText)

                        sap.m.MessageBox.error(oErrorMessage.content, {
                            title: "{i18n>Error}",
                            initialFocus: null
                        });

                    }
                })

            },


            onSubmitTest: function () {

                


            },

            /* Boton de la Tabla para refrescar los datos */
            onTableRefresh: function () {

                let oTable = this.getView().byId("tabla01");
                let oBinding = oTable.getBinding("items");

                oBinding.filter([]);

                this.getView().byId("slCategory").setSelectedKey("")
                this.getView().byId("slLocation").setSelectedKey("")

            },


            /* Nos lleva la Vista de Employee Profile sacando el ID del empleado al que clicamos */
            onPressNavigation: function (oEvent) {

                var oItem = oEvent.getSource();

                this.getRouter().navTo("EmployeeProfile", {
                    employeeId: oItem.getBindingContext("oEmpleados").getProperty("ID")
                });

            },

            /* Nos lleva la Vista para Editar el Employee Profile sacando el ID del empleado al que clicamos */
            onPressNavigationEdit: function (oEvent) {

                var oItem = oEvent.getSource();

                this.getRouter().navTo("EmployeeProfileEdit", {
                    employeeId: oItem.getBindingContext("oEmpleados").getProperty("ID")
                });

            },

            /* Borrar Usuarios con Dialogo de confirmación */
            onApproveDialogPress: function (oEvent) {

                var oItem = oEvent.getSource().getBindingContext("oEmpleados").getProperty("ID");
                const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

                if (!this.oApproveDialog) {

                    this.oApproveDialog = new Dialog({
                        type: DialogType.Message,
                        title: oBundle.getText("Confirm"),
                        content: new Text({ text: oBundle.getText("DeleteDialog") }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: oBundle.getText("Delete"),
                            press: function () {

                                /* Usamos el método REMOVE para borrar el perfil */
                                this.getView().getModel('oEmpleados').remove("/Employees(" + oItem + ")", {
                                    success: function (data) {

                                        const oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
                                        MessageToast.show(oBundle.getText("EmployeeDeleted"));

                                        this.getView().byId('tabla01').getModel().refresh(true)
                                        //this.onTableRefresh()


                                    }.bind(this),
                                    error: function (e) {
                                        alert("error");
                                    }
                                })

                                this.oApproveDialog.close();
                                this.oApproveDialog = null;

                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: oBundle.getText("CancelButton"),
                            press: function () {
                                this.oApproveDialog.close();
                                this.oApproveDialog = null;

                            }.bind(this)
                        })
                    });
                }

                this.oApproveDialog.open();

            },


            onValidateInput: function () {

                var validator = new Validator();
                let bValidation = validator.validate(sap.ui.getCore().byId("newEmployee"));
                
            }




        });
    });
