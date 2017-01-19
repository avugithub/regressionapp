Transamerica.ARIESRegression = (function() {
    //const
    const products = ["FEBII", "ACCUMIULr", "FFIULII", "IUL09", "LB201701", "Super201701"];
    const myTWJSONkeys = Transamerica.Globals.myTWJSONkeys;
    //variables
    var selectedProduct = "";
    var selectedNodes = [];
    var outputs = {};
    var testCases = [];
    var userCustomQuery = "";
    var endpoint1 = "";
    var endpoint2 = "";

    var displayCases = function displayCases(data) {
        testCases = data["hits"]["hits"];
        console.log(testCases);
        buildScenarioTable(testCases, "testCases");
    }

    var buildScenarioTable = function buildScenarioTable(dataArr, tbodyId) {
        var tbody = $("#" + tbodyId);
        tbody.empty();
        var num = dataArr.length;
        var i;
        var queryAttributes = Transamerica.ElasticSearch.elasticSearchQueryObj.attributes;
        var attributeNames = Transamerica.Utils.getUniqueVals(queryAttributes.map(function(x) {
            return x.name
        }));

        var trthead = $("#tableTitle").find("tr");
        $(".attrName").remove();
        //for (var j = 0; j < attributeNames.length; j++)
        //{
        //    trthead.append($("<th class='attrName'>" + attributeNames[j] + "</th>"));
        //}

        for (i = 0; i < num; i++) {
            var record = dataArr[i]["_source"];
            var row = $("<tr id=" + dataArr[i]["_source"]["ScenarioGuid"] + "><td>" + (i + 1) + "</td><td class='ScenarioName'>" + dataArr[i]["_source"]["ScenarioName"] + "</td></tr>");
            //for (var j = 0; j < attributeNames.length; j++)
            //{

            //    row.append($("<td>" +getValueForNode(dataArr[i]["_source"],attributeNames[j]) + "</td>"));

            //}
            tbody.append(row);
        }
        $("#num_cases").html("( num: " + dataArr.length + " cases)");
    }

    var compareTwoEndPoints = function compareTwoEndPoints() {
        var i = 0;
        var len = testCases.length;
        for (i; i < len; i++) {
            testCase = testCases[i];
            var scenarioID = testCase["_source"]["ScenarioGuid"];
            var inputJSON = testCase["_source"]["InputJSON"];
            if (!testCase["_source"]["InputJSON"]) {
                $("#" + scenarioID).css("background-color", "red");
                $("#" + scenarioID).notify("No Input JSON found", {
                    position: "left-center"
                });
                continue;
            }
            processComparison(scenarioID, inputJSON);
        }
    };

    //COMPARING
    var processComparison = function processComparison(scenarioID, inputJSON) {
        //the reason I moved the code is closure in JS is only created inside function
        //refer to http://www.w3schools.com/js/js_function_closures.asp
        var url1 = getMyTranswareServiceURL(endpoint1, inputJSON);
        var url2 = getMyTranswareServiceURL(endpoint2, inputJSON);

        var row = $("#" + scenarioID);

        outputs[scenarioID] = {};

        //send 2 ajax requests in order
        Transamerica.Utils.AjaxCallCORS(url1, "", "GET", function(data) {

            outputs[scenarioID]["version1"] = {};
            var version1 = JSON.parse(data);
            row.append($("<td><span class='glyphicon glyphicon-stop' style='color:green'></span></td>"));

            Transamerica.Utils.AjaxCallCORS(url2, "", "GET", function(data) {
                row.append($("<td><span class='glyphicon glyphicon-stop' style='color:green'></span></td>"));
                outputs[scenarioID]["version2"] = {};
                var version2 = JSON.parse(data);

                //object for storing comparison data
                outputs[scenarioID]["version1"]["selectedKeyOutputs"] = {};
                outputs[scenarioID]["version2"]["selectedKeyOutputs"] = {};

                var len = selectedNodes.length;
                var outputString = "";


                if (version1 != null & version2 != null) {
                    if (version1.ErrorCode !== 9 & version2.ErrorCode !== 9) {
                        //start compare
                        var finalResult = true;

                        for (var j = 0; j < len; j++) {
                            var currentNode = selectedNodes[j];
                            var version1Values = getValueForNode(version1, currentNode);
                            var version2Values = getValueForNode(version2, currentNode);

                            //cache the  values for current node so we can display later
                            outputs[scenarioID]["version1"]["selectedKeyOutputs"][currentNode] = version1Values;
                            outputs[scenarioID]["version2"]["selectedKeyOutputs"][currentNode] = version2Values;

                            console.log(`Comparing : (${currentNode})`, version1Values, version2Values)
                            var result = compareTwoNodes(version1Values, version2Values)
                            if (result === false) {
                                finalResult = false;
                            }
                            outputString = `<span class='glyphicon glyphicon-stop' style="color:` + colorCode(result) + `"></span>`;
                            var domID = `details_${scenarioID}_${j}`;
                            row.append($(`<td id='${domID}' style="background:#FAFFD1">${outputString}</td>`));
                            rowClickEventHandler(domID, scenarioID, currentNode);
                        }
                        row.append($(`<td style="color:` + colorCode(finalResult) + `">${finalResult === true ? "PASS" : "FAIL"}</td>`));
                    } else if (version1.ErrorCode === 9 || version2.ErrorCode === 9) {
                        for (var j = 0; j < len; j++) {
                            var currentNode = selectedNodes[j];
                            outputString = `<span class='glyphicon glyphicon-stop' style="color:red"></span>`;
                            row.append($(`<td>${outputString}</td>`));
                        }
                        var message = version1.ErrorCode === 9 ? "ENDPOINT A returns an Error Message : " + version1.Messages : "ENDPOINT B returns an Error Message : " + version2.Messages;
                        if (version1.ErrorCode === 9 && version2.ErrorCode === 9) {
                            message = "BOTH ENDPOINTS RETURN ERROR. ENDPOINT A: " + version1.Messages + "| ENDPOINT B :" + version2.Messages;
                        }
                        row.append($(`<td style="color:red">FAIL</td><td>${message}</td>`));
                    }
                } else {
                    $.notify("No Data Received From Endpoint" + version1 != null ? endpoint1 : endpoint2);
                }
            }, function(data) {
                $.notify(" ENDPOINT 2 - ERROR : Got error from the webervice. Status: " + data.status);
                row.append($("<td><span class='glyphicon glyphicon-stop' style='color:red'></span></td>"));
            });
        }, function(data) {
            $.notify("ENDPOINT 1 - ERROR : Got error from the webervice. Status: " + data.status);
            row.append($("<td><span class='glyphicon glyphicon-stop' style='color:red'></span></td>"));
        });

        Transamerica.ARIESRegression.outputs = outputs;
    };

    var colorCode = function colorCode(bool) {
        if (bool === true) {
            return "green";
        } else {
            return "red";
        }
    }

    var rowClickEventHandler = function rowClickEventHandler(domID, scenarioId, currentNode) {
        $("#" + domID).click(function() {

            var caseName = document.getElementById(scenarioId).getElementsByClassName("ScenarioName")[0].innerHTML;
            var endpoint1Data = outputs[scenarioId]["version1"]["selectedKeyOutputs"][currentNode];
            var endpoint2Data = outputs[scenarioId]["version2"]["selectedKeyOutputs"][currentNode];
            $("#testCaseName").html("- Test Case: " + caseName + " Comparison Data For: " + currentNode);
            $("#comparisonTable").empty();
            $("#comparisonTable").append($(Transamerica.Utils.getCompRowsMarkup(endpoint1Data, endpoint2Data)));
            $(".viewData").click(function() {
                $(this).parent().parent().parent().parent().find(".dataBox").toggle();
            });
            $("#detailsModal").modal("show");
        });
    };



    var getValueForNode = function getValueForNode(grandObj, nodeString) {
        var nodes = nodeString.split(".");
        var obj = grandObj;
        for (var i = 0, len = nodes.length; i < len; i++) {
            obj = obj[nodes[i]];
        }
        return obj;
    }

    var compareTwoNodes = function compareTwoNodes(obj1, obj2) {
        var result = true;
        if (obj1 instanceof Array == true && obj2 instanceof Array == true) {
            if (obj1.len == obj2.len) {
                result = compareTwoArrays(obj1, obj2)
            } else {
                result = false;
            }
        } else {
            if (obj1 == obj2) {
                result = true;
            } else {
                result = false;
            }
        }
        return result;
    }

    var compareTwoArrays = function compareTwoArrays(arr1, arr2) {
        result = true;
        var len = arr1.length;
        var i = 0;
        for (i; i < len; i++) {
            if (typeof(arr1[i]) == "object" && typeof(arr2[i]) == "object") {
                result = JSON.stringify(arr1[i]) === JSON.stringify(arr2[i]); // we can go deeper 
            } else {
                if (arr1[i] != arr2[i]) {
                    return false;
                }
            }
        }
        return result;
    };

    var displaySelectedNode = function displaySelectedNode(tbodyId, currentSelectedNodes) {
        var i = 0,
            tbody = $("#" + tbodyId),
            len = currentSelectedNodes.length;
        tbody.empty();

        for (i; i < len; i++) {
            tbody.append($("<tr id='index_" + i + "'><td>" + (i + 1) + "</td><td>" + currentSelectedNodes[i] +
                "&nbsp<a class='remove' onclick='Transamerica.ARIESRegression.removeSelectedNode(this)'><span style='color:red' class='glyphicon glyphicon-remove'></span></a></td></tr>"
            ));
        }
    };

    var removeSelectedNode = function removeRow(element) {
        var tr = $(element).closest("tr");
        var index = Number(tr.attr("id").replace("index_", ""));
        selectedNodes.splice(index, 1);
        tr.remove();
    }

    var getMyTranswareServiceURL = function getMyTranswareServiceURL(endpoint, caseJSON) {
        var calServiceUrl = endpoint;
        var paramString = JSON.stringify(caseJSON);
        var re = new RegExp("\" \"", 'g');
        paramString = paramString.replace(re, "\"\"");

        endpoint = endpoint.includes("http") == true ? endpoint : "http://" + endpoint;

        var url = endpoint + "?key=f19d590dcc2b" + "&configuration=&jsWebIllustration=" + paramString;
        return url;
    };

    var fillSelectBox = function fillSelectBox() {
        var selectBox = $("#endpointSelect");
        var myTWNodes = myTWJSONkeys;
        var len = myTWNodes.length;
        var i = 0;
        for (i; i < len; i++) {
            var option = $("<option val=" + myTWNodes[i] + ">" + myTWNodes[i] + "</option>");
            selectBox.append(option);
        }
        selectBox.select2({
            placeholder: "Select one or more attributes to compare"
        });
        selectBox.change(function() {
            //add selected nodes to an array
            var value = selectBox.val();
            if (value != "") {
                selectedNodes.push(value);
                displaySelectedNode("selected_nodes_tbody", selectedNodes);
            } else {
                return;
            }
        });
        $("#clear_endpoint").click(function() {
            selectedNodes = [];
            var tbody = $("#selected_nodes_tbody");
            var testCasestbody = $("#testCases");
            testCasestbody.empty();
            tbody.empty();
            buildScenarioTable(testCases, "testCases");
        });
    }

    //public
    var initialize = function initialize() {
        loadProducts();
        fillSelectBox();
        $("#optionBox").hide();
        $("#compare").click(function() {
            var selectedNodesArray = selectedNodes;
            //validation
            if (endpoint1 == "" || endpoint2 == "") {
                $.notify("Please provide 2 endpoints to compare");
                return false;
            }
            if (testCases.length == 0) {
                $.notify("There is no test case for testing.")
                return false;
            }


            if (selectedNodesArray.length == 0) {
                alert("Please select node to compare");
                return false;
            }
            var testCasestbody = $("#testCases");
            testCasestbody.empty();

            buildScenarioTable(testCases, "testCases");
            var thead = $("#tableTitle");
            thead.empty();
            var header = "<tr><th>No</th><th>Name</th><th>Endpoint 1</th><th>Endpoint 2</th>";
            for (var o = 0; o < selectedNodesArray.length; o++) {
                header += "<th>" + selectedNodesArray[o] + "</th>";
            }
            header += "<th>Final Result</th></tr>";
            thead.append($(header));
            compareTwoEndPoints();
        });

        //TEST CASES
        $("#getAllCases").click(function() {
            $("#tableTitle").notify("Loading test cases for " + selectedProduct, {
                position: "left-center",
                className: "success"
            });
            Transamerica.ElasticSearch.getAllCases(selectedProduct.toLowerCase(), displayCases);
        });
        $("#queryElastic").click(function() {
            userCustomQuery = $("#queryBox").val();
            Transamerica.ElasticSearch.processQuery(selectedProduct.toLowerCase(), userCustomQuery || "*", displayCases);
        });

        $("#discoverTestCase").click(function() {
            $("#attributeBox").notify("Loading available attributes", {
                position: "top-center",
                className: "success"
            });
            Transamerica.ElasticSearch.getIndexAttributeDistribution(selectedProduct);
        });
        //TODO: REFACTOR
        $('input[name=endpoint1]').focusin(function() {
            $('input[name=endpoint1]').val('');
        });

        $('input[name=endpoint1]').change(function() {
            endpoint1 = $(this).val();
        });
        $('input[name=endpoint2]').change(function() {
            endpoint2 = $(this).val();
        });
        $('input[name=endpoint2]').focusin(function() {
            $('input[name=endpoint2]').val('');
        });

    };
    var updateProduct = function updateProduct(value) {
        selectedProduct = value;
        $("#productTitle").text(value);
    }
    var loadProducts = function loadProducts() {
        var selectBox = $("#productSelect");
        selectBox.select2({
            data: products
        });
        selectBox.change(function() {
            var value = $(this).val();
            if (value == "") {
                $("#productTitle").text("Please select a product !");
                return;
            }
            updateProduct(value);
            $("#optionBox").show();
        });
    };
    return {
        initialize: initialize,
        removeSelectedNode: removeSelectedNode
    };
})();