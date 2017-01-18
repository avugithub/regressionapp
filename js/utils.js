Transamerica.Utils = (function () {
    var recordAttributes = {};
    var elasticSearchQueryObj = {
        "attributes": [],
        "custom_query": ""
    };
    var sampleQuery = {
        filtered: {
            query: {},
            filter: {
                bool: {
                    must: [],
                    must_not: [],
                    should: [],
                }
            }
        }
    };

    var getAllkeys = function (obj) {
        //going over all keys until exhausted
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof (obj[key]) == "object" && obj[key] instanceof Array == false) //if it is an object not array, go down one more level
                {
                    var subkeys = getAllkeys(obj[key]);
                    var i = 0;
                    var len = subkeys.length;
                    for (i; i < len; i++) {
                        keys.push(key + "." + subkeys[i]);
                    }
                }
                else {
                    keys.push(key);
                }
            }
        }
        return keys;
    };
    var changePriorityOne = function (ScenarioGuid, comparisonResult) {
        try {
            var baseURl = "http://ladbsqldev02/App5/Services/SHARPAriesAutoTestCacheService.asmx/DoCOMUpdateScenarioPriority";
            var value = "NotSet"; // NotSet = Normal
            if (comparisonResult === false) {
                value = "High";
            }

            var url = baseURl + "?systemID=" + "1" + "&scenarioGUID=" + ScenarioGuid + "&priorityCode=" + value + "&userID=" + "RBEWERNI";
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                xhrFields: { withCredentials: true },
                success: function (data, status) {
                    try {
                        if (data.d != "" && status.toLowerCase() == "success") {

                        }
                        else {
                            //alert("FAILED");
                        }
                    } catch (err) {
                        if (level1Alert == 1) {
                            alert(err);
                        }
                    }
                },
                error: function (request, status, error) {
                    console.log("FAILED Product Update: " + error);
                }
            });
        }
        catch (err) {

            console.log("Error Caught" + err.message);
        }
        var errorcallback = function (data) {
            console.log("");

        }
    };

    //AJAX
    var AjaxCallCORS = function (url, data, type, callback, errorcallback) {
        $.ajax(
		{
		    contentType: 'application/json; charset=utf-8',
		    url: url,
		    type: type,
		    data: data,
		    dataType: 'jsonp',
		    crossDomain: true,
		    success: function (d) {
		        if (callback != null) {
		            callback(d);
		        }
		        else {
		            console.log("no callback provided");
		            console.log(d);
		        }
		    },
		    error: function (data) {
		        if (data.status == 404) {
		            if (errorcallback != undefined) {
		                errorcallback(data);
		            }
		        }

		    }
		});
    };

    var AjaxCall = function (url, data, type, callback, errorcallback) {
        console.log(url);
        $.ajax(
		{
		    contentType: 'application/json; charset=utf-8',
		    url: url,
		    type: type,
		    data: data,
		    dataType: 'json',
		    success: function (d) {
		        if (callback != null) {
		            callback(d);
		        }
		        else {
		            console.log("no callback provided");
		            console.log(d);
		        }
		    },
		    error: function (data) {
		        if (data.status == 404) {
		            if (errorcallback != undefined) {
		                errorcallback(data);
		            }
		        }

		    }
		});
    };

    var getIndexAttributeDistribution = function (tableName, domContainer) {
        var requestUrl = "https://m7kx722wp8.execute-api.us-west-2.amazonaws.com/prod/getindexdistribution?tableName=" + tableName;

        AjaxCall(requestUrl, "", "GET", function (data) {
            buildProductIndexAttributes(data, domContainer);
        });
    };

    var buildProductIndexAttributes = function (data) {
        var tbody = $("#attributeTable");
        tbody.empty();
        if (data.hasOwnProperty("errorMessage")) {
            //print out the error
        }
        else {
            console.log(data);
            var aggregations = data["response"]["aggregations"];
            for (var attribute in aggregations) {
                if (aggregations.hasOwnProperty(attribute)) {
                    var buckets = aggregations[attribute]["buckets"];
                    var len = buckets.length;
                    var i;
                    var row = $("<tr id='" + attribute + "'><td>" + attribute + "</td><td>" + categorizeAttribute(attribute) + "</td></tr>");
                    recordAttributes[attribute] = {}
                    for (i = 0; i < len; i++) {
                        recordAttributes[attribute][buckets[i]["key"]] = buckets[i]["doc_count"];
                    }
                    rowClickHandler(attribute, row);
                    tbody.append(row);
                }
            }
        }
    }

    var categorizeAttribute = function categorizeAttribute(attribute) {
        var availableCategories = Transamerica.Globals.myTWInputCategories;
        if (attribute.includes("InputJSON")) {
            var myTWkey = attribute.replace("InputJSON.", "");
            if (availableCategories.hasOwnProperty(myTWkey)) {
                return availableCategories[myTWkey];
            } else {
                return "Other Inputs";
            }

        } else {
            return "";
        }
    }

    var rowClickHandler = function (attribute, row) {
        row.click(function () {
            //highlight the row clicked
            var selected = $(this).hasClass("highlight");
            var values = recordAttributes[attribute];
            var tbody = $("#distribution");
            tbody.empty();
            for (var key in values) {
                if (values.hasOwnProperty(key)) {
                    var value = key;
                    var count = values[key];
                    var row = $("<tr><td><b>" + value + "</b></td><td>" + count + " records</td><td>" +
    						"<a class='add'><span class='glyphicon glyphicon-plus' style='color:green'>&nbsp;</span></a><a class='remove'><span style='color:red' class='glyphicon glyphicon-minus'></span></a></td></tr>");
                    valueSelectHandler(row, attribute, key);
                    tbody.append(row);
                }
            }
        });
    };

    var valueSelectHandler = function (row, attribute, value) {
        row.find("a").click(function () {
            var tbody = $("#attributeSelection");
            var queryType = "include";
            if ($(this).attr("class") == "remove") {
                queryType = "exclude"
            }
            if (attributeExists(attribute, value)) {
                return false;
            }
            else {
                elasticSearchQueryObj.attributes.push({ name: attribute, value: value, queryType: queryType });
                var selectedAttributeRow = $("<tr><td>" + attribute + "</td><td>" + value + "</td><td>" + queryType.toUpperCase() +
	    			"<a class='removeSelectedAttribute'>  <span style='color:red' class='glyphicon glyphicon-remove'></span></a></td></tr>");
                selectedAttributeRow.find("a").click(function () {
                    if ($(this).attr("class") == "removeSelectedAttribute") {
                        selectedAttributeRow.remove();
                        removeAttribute(attribute, value);
                    }
                });
                tbody.append(selectedAttributeRow);
            }
        });
    };

    var removeAttribute = function (attribute, value) {
        var attArr = elasticSearchQueryObj.attributes;
        for (var i = 0; i < attArr.length; i++) {
            if (attArr[i].name === attribute && attArr[i].value === value) {
                elasticSearchQueryObj.attributes.splice(i, 1);
                return;
            }
        }
    }

    var attributeExists = function (attribute, value) {
        var attArr = elasticSearchQueryObj.attributes;
        var obj = attArr.filter(function (x) { return (x.name === attribute && x.value === value); });
        if (obj.length === 0) {
            return false;
        }
        else {
            return true;
        }
    }

    var buildQuery = function (queryString) {
        //must -> AND
        //must not -> EXCEPT
        //should -> OR
        var includedAttributes = elasticSearchQueryObj.attributes.filter(function (x) { return (x.queryType === "include"); });
        var attributes = includedAttributes.map(function (item) { return item.name; });
        var classifiedAttributes = classifyDuplicates(attributes);
        var must_query = classifiedAttributes.unique.map(function (name) {
            return matchStatement(name, includedAttributes.find(function (x) { return x.name == name }).value);
        });
        var should_query = [];
        var len = classifiedAttributes.duplicates.length;

        for (var i = 0; i < len ; i++) {
            var name = classifiedAttributes.duplicates[i];
            var objects = includedAttributes.filter(function (x) { return x.name == name });

            for (var j = 0; j < objects.length ; j++) {
                console.log(objects[i]);
                should_query.push(matchStatement(name, objects[j].value));
            }
        }
        //exclude
        var exludedAttributes = elasticSearchQueryObj.attributes.filter(function (x) { return (x.queryType === "exclude"); });
        console.log(exludedAttributes);
        exludedAttributes = exludedAttributes.map(function (x) {
            return matchStatement(x.name, x.value);
        });

        
        var newQuery = sampleQuery;
        newQuery.filtered.query = {
            query_string: {
                query: queryString || "*"
            }
        };
        newQuery.filtered.filter.bool.must = must_query;
        newQuery.filtered.filter.bool.must_not = exludedAttributes;
        newQuery.filtered.filter.bool.should = should_query;

        
        var fields = classifiedAttributes.unique.concat(classifiedAttributes.duplicates);
        fields = fields.concat(["ScenarioGuid", "ScenarioName", "InputJSON"]);

        return {
            _source: fields,
            size: 9999,
            query: newQuery
        };
    };


    var classifyDuplicates = function classifyDuplicates(arr) {

        var response = {
            duplicates: [],
            unique: []
        };

        for (var i = 0; i < arr.length; i++) {
            if (arr.indexOf(arr[i], i + 1) > -1) {
                if (response.duplicates.indexOf(arr[i]) === -1) {
                    response.duplicates.push(arr[i]);
                }
            } else if (response.duplicates.indexOf(arr[i]) == -1) {
                response.unique.push(arr[i]);
            }
        }
        return response;
    };

    var getUniqueVals = function getUniqueVals(arr) {
        var object = arr.reduce(function (h, v) {
            h[v] = true;
            return h;
        }, {});
        return Object.keys(object);
    }

    var matchStatement = function matchStatement(attribute, value) {
        var query =
		{
		    "query": {
		        "match": {}
		    }
		};
        query.query.match[attribute] = {
            query: value,
            type: "phrase"
        }
        return query
    };

    var processQuery = function processQuery(tableName, customQuery, callBack) {
        var server = "search-scenarios-llsguds6zuyl7hl4gfsomx4pxi.us-west-2.es.amazonaws.com";
        var query = buildQuery(customQuery);
        callES(server, tableName + "/_search", "GET", JSON.stringify(query), callBack);
    };

    var getAllCases = function getAllCases(tableName, callBack) {
        var server = "search-scenarios-llsguds6zuyl7hl4gfsomx4pxi.us-west-2.es.amazonaws.com";
        var query = {
            "_source": ["ScenarioGuid", "ScenarioName", "InputJSON"],
            "size": 9999
        };
        callES(server, tableName + "/_search", "GET", JSON.stringify(query), callBack);
    };

    var callES = function callES(server, url, method, data, successCallback, completeCallback) {
        url = constructESUrl(server, url);
        var uname_password_re = /^(https?:\/\/)?(?:(?:(.*):)?(.*?)@)?(.*)$/;
        var url_parts = url.match(uname_password_re);

        var uname = url_parts[2];
        var password = url_parts[3];
        url = url_parts[1] + url_parts[4];
        if (data && method == "GET") method = "POST";

        $.ajax({
            url: url,
            data: method == "GET" ? null : data,
            password: password,
            username: uname,
            crossDomain: true,
            type: method,
            dataType: "json",
            complete: completeCallback,
            success: successCallback
        });
    }

    var constructESUrl = function constructESUrl(server, url) {
        if (url.indexOf("://") >= 0) return url;
        if (server.indexOf("://") < 0) server = "http://" + server;
        if (server.substr(-1) == "/") {
            server = server.substr(0, server.length - 1);
        }
        if (url.charAt(0) === "/") url = url.substr(1);

        return server + "/" + url;
    }


    var zip = function (arr1, arr2) {
        var zipArr = [];
        var maxLen = Math.max(arr1.length, arr2.length);
        var i;
        for (i = 0; i < maxLen; i++) {
            zipArr.push([arr1[i], arr2[i]]);
        }
        return zipArr;
    };

    var zipByKeys = function (obj1, obj2) {
        var zip = {};
        for (var key in obj1) {
            zip[key] = [];
            if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
                zip[key].push(obj1[key], obj2[key]);
            } else if (obj2.hasOwnProperty(key) == false) {
                zip[key].push(obj1[key], undefined);
            }
        }
        return zip;
    };

    var getCompRowsMarkup = function getCompRowsMarkup(source1, source2)
    {
        var markup = "";
        if (source1 instanceof Array == false && source1 instanceof Array == false)
        {
            markup = `<tr><td>${source1}</td><td>${source2}</td></tr>`;
        }
        else if (source1 instanceof Array == true && source1 instanceof Array == true)
        {
            if (source1.length > 0 && source2.length > 0) {
                var valuePairs = zip(source1, source2);
                var len = valuePairs.length;
                for (var i = 0; i < len; i++) {
                    var source1Val = valuePairs[i][0];
                    var source2Val = valuePairs[i][1];
                    if (typeof (source1Val) != "object" && typeof (source2Val) != "object")
                    {
                        var translatedVals = valuePairs[i].map(function (val) {
                            return val == undefined ? "MISSING" : val
                        });
                        var style = translatedVals[0] !== translatedVals[1] ? "style='background-color:yellow'" : "";
                        var difference = "";
                        if (typeof (source1Val) == "number" && typeof (source2Val) == "number") {
                            difference = (source1Val - source2Val).toFixed(4);
                        }
                        markup += `<tr ${style}><td>${translatedVals[0]}</td><td>${difference}</td><td>${translatedVals[1]}</td></tr>`;
                    } else if (source1Val instanceof Array == true && source2Val instanceof Array == true) {
                        var _markup = getCompRowsMarkup(source1Val, source2Val);
                        var style = _markup.includes("yellow") ? "style='background-color:yellow'" : "";
                        markup += "<tr><td><table border='1' cell-padding='2' class='table-condensed'><thead><tr " + style + "><th colspan='3'>index: " + i +
                            "&nbsp;<a href='#' class='viewData' >View</a></th></tr></thead>" +
                            "<tbody class='dataBox' style='display:none'><tr><td>Endpoint1</td><td>Difference</td><td>Endpoint2</td></tr>" +
                            _markup + "</tbody></table></tr></td>";
                    } else {
                        var _markup = "";
                        var a = zipByKeys(source1Val, source2Val);
                        for (var key in a) {
                            _markup += "<tr style='background-color:#7FE55C'><th colspan='2'>" + key + "</th></tr>";
                            _markup += getCompRowsMarkup(a[key][0], a[key][1]);
                        }
                        markup += "<tr><td><table border='1'><thead><tr><th colspan='2'>index: " + i + " <a href='#' class='viewData' >View Data</a></th></tr></thead><tbody class='dataBox' style='display:none'>" + _markup + "</tbody></table></tr></td>";
                    }
                }
            } else {
                markup = `<tr><td>Empty Array</td><td>Empty Array</td></tr>`;
            }
        } else {

        }
        return markup;
    };


    //export function 
    return {
        changePriorityOne: changePriorityOne,
        AjaxCallCORS: AjaxCallCORS,
        AjaxCall: AjaxCall,
        getAllkeys: getAllkeys,
        getIndexAttributeDistribution: getIndexAttributeDistribution,
        processQuery: processQuery,
        getAllCases: getAllCases,
        getUniqueVals:getUniqueVals,
        callES: callES,
        elasticSearchQueryObj: elasticSearchQueryObj,
        recordAttributes: recordAttributes,
        getCompRowsMarkup: getCompRowsMarkup,
    }
})();