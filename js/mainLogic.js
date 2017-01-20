Transamerica.ARIESRegression = (function () {
    //const
    const products = ["FEBII", "ACCUMIULr", "FFIULII", "IUL09", "LB201701", "Super201701"];
    const myTWJSONkeys = Transamerica.Globals.myTWJSONkeys;
    //variables
    var selectedProduct = "",
        selectedNodes = [],
        outputs = {},
        testCases = [],
        userCustomQuery = "",
        endpoint1 = "",
        endpoint2 = "",
        searchHistoryData = {},
        selectedRecord = {};

    var displayCases = function displayCases(data) {
        testCases = data["hits"]["hits"];
        console.log(testCases);
        var searchParams = Transamerica.ElasticSearch.getLocals();
        if (testCases.length > 0 && (JSON.stringify(searchParams.query) != selectedRecord.searchQuery || $("#searchName").val() != selectedRecord.name)) {
            
            Transamerica.Utils.saveSearchQuery(selectedProduct, $("#searchName").val(), searchParams.query, searchParams.elasticSearchQueryObj);
        }
        buildScenarioTable(testCases, "testCases");

    };

    var displayAllCases = function displayCases(data) {
        testCases = data["hits"]["hits"];
        if (testCases.length == 0) {
            $.notify("No Cases Found For " + selectedProduct);
        }
        buildScenarioTable(testCases, "testCases");
    };

    var displaySearchHistory = function displaySearchHistory(data){
        console.log(data);
        var searchHistoryTbody = $("#searchHistoryTbody");
        searchHistoryTbody.empty();
        if(data["hits"]["hits"].length > 0)
        {
            searchHistoryData = data["hits"]["hits"];
            var len = searchHistoryData.length;
            var i;
            for (i = 0; i < len; i++)
            {
                var obj = searchHistoryData[i]["_source"];
                var row = $(`<tr><td>${i + 1} <a class='loadHistRecord' data-index ="${i}">Select</a></td><td>${obj.SearchGUID}</td><td></td><td>${obj.name}</td></tr>`);
                searchHistoryTbody.append(row);                
            }

            $(".loadHistRecord").click(function () {
                var index = Number($(this).attr("data-index"));
                selectedRecord = searchHistoryData[index]["_source"];
                $("#attributeSelection").empty();

                if (selectedRecord.elasticSearchObj)
                {
                    var searchQuery = JSON.parse(selectedRecord.searchQuery);
                    var elasticSearchObj = JSON.parse(selectedRecord.elasticSearchObj);
                    //populate data to input fields
                    $("#searchName").val(selectedRecord.name);
                    Transamerica.ElasticSearch.loadSelectedRecord(searchQuery, elasticSearchObj);
                }
                
            });

        }
        else
        {
            searchHistoryTbody.append($("<tr><td>No Record Found !</td></tr>"));
        }
    };

    var displayUserActivity = function () {

        // Displaying the activity
        var baseurl = "https://sl0r1qavql.execute-api.us-west-2.amazonaws.com/prod/displayuseractivity/";
        //var URL = baseurl + JSON.stringify(ip_address);
        Transamerica.Utils.AjaxCall(baseurl, "", "GET", function (data) {
            console.log(data);
            populateSelectedKeys(data);
        });

    };

    var populateSelectedKeys = function (data) {
        var tbody = $("#selectedKeyTable");
        tbody.empty();
        if (data.hasOwnProperty("key")) {
            //print out the error
        }
        else {
            console.log(data);
            var obj = data;
            var j = data.length;
            for (i = 0; i < j; i++) {
                var keys = obj[i]["key"];
                keys = keys.charAt(0).toUpperCase() + keys.substr(1).toLowerCase();
                var row = $("<tr id=" + obj[i]["key"] + "><td>" + (i + 1) +
                   "</td><td>" + keys + "</td></tr>");
                row.click(function () {
                    var attribute = $(this).attr("id");
                    selectedNodes.push(attribute);
                    displaySelectedNode("selected_nodes_tbody", selectedNodes);
                });
                tbody.append(row);

            }
        }
    }

    var buildScenarioTable = function buildScenarioTable(dataArr, tbodyId) {
        var tbody = $("#" + tbodyId),
            num = dataArr.length,
            i,
            queryAttributes = Transamerica.ElasticSearch.getLocals().elasticSearchQueryObj.attributes,
            attributeNames = Transamerica.Utils.getUniqueVals(queryAttributes.map(function (x) {
                return x.name
            }));
        tbody.empty();

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
        var i = 0,
            len = testCases.length;
        for (i; i < len; i++) {
            testCase = testCases[i];
            console.log(i, testCase["_source"]["ScenarioGuid"]);
            var scenarioID = testCase["_source"]["ScenarioGuid"];
            var inputJSON = testCase["_source"]["InputJSON"];
            if (!testCase["_source"]["InputJSON"]) {
                $("#" + scenarioID).css("background-color", "red");
                $("#" + scenarioID).notify("No Input JSON found", {
                    position: "left-center"
                });
                continue;
            }
            processComparisonV2(scenarioID, inputJSON);
        }
    };

    var processComparisonV2 = function (scenarioID, inputJSON) {
        //the reason I moved the code is closure in JS is only created inside function
        //refer to http://www.w3schools.com/js/js_function_closures.asp


        var error1;
        var error2;

        $.when(
            $.ajax(
		    {
		        contentType: 'application/json; charset=utf-8',
		        url: getMyTranswareServiceURL(endpoint1, inputJSON),
		        type: "GET",
		        dataType: 'jsonp',
		        success: function (d) {
		            $("#" + scenarioID).append($("<td><span class='glyphicon glyphicon-stop' style='color:green'></span></td>"));
		        },
		        error: function (data) {
		            error1 = data;

		        }
		    }),
            $.ajax(
		    {
		        contentType: 'application/json; charset=utf-8',
		        url: getMyTranswareServiceURL(endpoint2, inputJSON),
		        type: "GET",
		        dataType: 'jsonp',
		        success: function (d) {
		            $("#" + scenarioID).append($("<td><span class='glyphicon glyphicon-stop' style='color:green'></span></td>"));
		        },
		        error: function (data) {
		            error2 = data;

		        }
		    })
        ).done(function (response1, response2) {
            var row = $("#" + scenarioID);
            try {
                response1 = JSON.parse(response1[0]);
                response2 = JSON.parse(response2[0]);

                var len = selectedNodes.length;
                outputString = "";
                if (response1 != null & response2 != null) {
                    if (response1.ErrorCode !== 9 & response2.ErrorCode !== 9) {
                        var finalResult = true;
                        for (var j = 0; j < len; j++) {
                            var currentNode = selectedNodes[j];
                            var response1Values = getValueForNode(response1, currentNode);
                            var response2Values = getValueForNode(response2, currentNode);

                            //console.log(`Comparing : (${currentNode})`, response1Values, response2Values)
                            var result = compareTwoNodes(response1Values, response2Values)
                            if (result === false) {
                                finalResult = false;
                            }
                            outputString = `<span class='glyphicon glyphicon-stop' style="color:` + colorCode(result) + `"></span>`;
                            var domID = `details_${scenarioID}_${j}`;
                            row.append($(`<td id='${domID}' style="background:#FAFFD1">${outputString}</td>`));
                            rowClickEventHandler(domID, scenarioID, currentNode, response1Values, response2Values);
                        }
                        row.append($(`<td style="color:` + colorCode(finalResult) + `">${finalResult === true ? "PASS" : "FAIL"}</td>`));
                    }
                    else if (response1.ErrorCode === 9 || response2.ErrorCode === 9) {
                        for (var j = 0; j < len; j++) {
                            var currentNode = selectedNodes[j];
                            outputString = `<span class='glyphicon glyphicon-stop' style="color:red"></span>`;
                            row.append($(`<td>${outputString}</td>`));
                        }
                        var message = response1.ErrorCode === 9 ? "ENDPOINT A returns an Error Message : " + response1.Messages : "ENDPOINT B returns an Error Message : " + response2.Messages;
                        if (response1.ErrorCode === 9 && response2.ErrorCode === 9) {
                            message = "BOTH ENDPOINTS RETURN ERROR. ENDPOINT A: " + response1.Messages + "| ENDPOINT B :" + response2.Messages;
                        }
                        row.append($(`<td style="color:red">FAIL</td><td>${message}</td>`));
                    }
                } else {
                    row.css("background-color", "yellow");
                    $.notify("No Data Received From Endpoint" + response1 != null ? endpoint1 : endpoint2);
                }
            }
            catch (e) {
                row.css("background-color", "yellow");
                $.notify("Error: ", e);
            }
        }).fail(function (data, s) {
            var row = $("#" + scenarioID);
            if (error1 != null && error2 == null) {
                $.notify("ENDPOINT 1 - ERROR : Got error from the webervice. Status: " + data.status);
                row.append($("<td><span class='glyphicon glyphicon-stop' style='color:red'></span></td>"));
            } else if (error2 != null && error1 == null) {
                $.notify("ENDPOINT 2 - ERROR : Got error from the webervice. Status: " + data.status);
                row.append($("<td><span class='glyphicon glyphicon-stop' style='color:red'></span></td>"));
            } else if (error2 != null && error1 != null) {
                $.notify("ENDPOINT 1 & 2 - ERROR : Got error from the webervice. Status: " + data.status);
                row.append($("<td><span class='glyphicon glyphicon-stop' style='color:red'></span></td>"));
                row.append($("<td><span class='glyphicon glyphicon-stop' style='color:red'></span></td>"));
            }
        });
    };

    var colorCode = function colorCode(bool) {
        if (bool === true) {
            return "green";
        } else {
            return "red";
        }
    }

    var rowClickEventHandler = function rowClickEventHandler(domID, scenarioID, currentNode, version1, version2) {
        $("#" + domID).click(function () {
            var caseName = document.getElementById(scenarioID).getElementsByClassName("ScenarioName")[0].innerHTML;
            $("#testCaseName").text("- Test Case: " + caseName + " Comparison Data For: " + currentNode);
            $("#comparisonTable").empty();
            $("#comparisonTable").append($(Transamerica.Utils.getCompRowsMarkup(version1, version2)));
            $(".viewData").click(function () {
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
            if (typeof (arr1[i]) == "object" && typeof (arr2[i]) == "object") {
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
        selectBox.change(function () {
            //add selected nodes to an array
            var value = selectBox.val();
            if  (value != "" && (selectedNodes.indexOf(value)==-1)) {
                selectedNodes.push(value);
                displaySelectedNode("selected_nodes_tbody", selectedNodes);
            } else {
                return;
            }
        });
        $("#clear_endpoint").click(function () {
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

        $("#endpoint1_popular_key").click(function () {
            displayUserActivity();
            $("#popularKeysBox").toggle();
        });

        $("#compare").click(function () {
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
            Transamerica.Utils.saveSelectedJSONKeys(selectedNodesArray, endpoint1, endpoint2);
            compareTwoEndPoints();
        });

        //TEST CASES
        $("#getAllCases").click(function () {
            $(this).attr("disabled", true);
            $("#tableTitle").notify("Loading test cases for " + selectedProduct, {
                position: "left-center",
                className: "success"
            });
            Transamerica.ElasticSearch.getAllCases(selectedProduct.toLowerCase(),function(data){
                displayAllCases(data);
                $("#getAllCases").attr("disabled", false);
            });
        });
        $("#queryElastic").click(function () {
            userCustomQuery = $("#queryBox").val();
            $("#tableTitle").notify("Loading test cases for " + selectedProduct, {
                position: "left-center",
                className: "success"
            });
            Transamerica.ElasticSearch.processQuery(selectedProduct.toLowerCase(), userCustomQuery || "*", displayCases);
        });

        $("#discoverTestCase").click(function () {
            $("#attributeTable").empty();
            $("#distribution").empty();
            $.notify("Loading available attributes & search history", {
                className: "success"
            });
            Transamerica.ElasticSearch.loadSearchHistory(selectedProduct, displaySearchHistory);
            Transamerica.ElasticSearch.getIndexAttributeDistribution(selectedProduct);
        });


        //TODO: REFACTOR
        $('input[name=endpoint1]').focusin(function () {
            $('input[name=endpoint1]').val('');
        });

        $('input[name=endpoint1]').change(function () {
            endpoint1 = $(this).val();
        });
        $('input[name=endpoint2]').change(function () {
            endpoint2 = $(this).val();
        });
        $('input[name=endpoint2]').focusin(function () {
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
        selectBox.change(function () {
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
        removeSelectedNode: removeSelectedNode,
    };
})();