Transamerica.ElasticSearch = (function() {
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

    var getIndexAttributeDistribution = function(tableName, domContainer) {
        var requestUrl = "https://m7kx722wp8.execute-api.us-west-2.amazonaws.com/prod/getindexdistribution?tableName=" + tableName;

        Transamerica.Utils.AjaxCall(requestUrl, "", "GET", function(data) {
            buildProductIndexAttributes(data, domContainer);
        });
    };

    var buildProductIndexAttributes = function(data) {
        var tbody = $("#attributeTable");
        tbody.empty();
        if (data.hasOwnProperty("errorMessage")) {
            //print out the error
        } else {
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

    var rowClickHandler = function(attribute, row) {
        row.click(function() {
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

    var valueSelectHandler = function(row, attribute, value) {
        row.find("a").click(function() {
            var tbody = $("#attributeSelection");
            var queryType = "include";
            if ($(this).attr("class") == "remove") {
                queryType = "exclude"
            }
            if (attributeExists(attribute, value)) {
                return false;
            } else {
                elasticSearchQueryObj.attributes.push({
                    name: attribute,
                    value: value,
                    queryType: queryType
                });
                var selectedAttributeRow = $("<tr><td>" + attribute + "</td><td>" + value + "</td><td>" + queryType.toUpperCase() +
                    "<a class='removeSelectedAttribute'><span style='color:red' class='glyphicon glyphicon-remove'></span></a></td></tr>");
                selectedAttributeRow.find("a").click(function() {
                    if ($(this).attr("class") == "removeSelectedAttribute") {
                        selectedAttributeRow.remove();
                        removeAttribute(attribute, value);
                    }
                });
                tbody.append(selectedAttributeRow);
            }
        });
    };

    var removeAttribute = function(attribute, value) {
        var attArr = elasticSearchQueryObj.attributes;
        for (var i = 0; i < attArr.length; i++) {
            if (attArr[i].name === attribute && attArr[i].value === value) {
                elasticSearchQueryObj.attributes.splice(i, 1);
                return;
            }
        }
    }

    var attributeExists = function(attribute, value) {
        var attArr = elasticSearchQueryObj.attributes;
        var obj = attArr.filter(function(x) {
            return (x.name === attribute && x.value === value);
        });
        if (obj.length === 0) {
            return false;
        } else {
            return true;
        }
    }
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
    var buildQuery = function buildQuery(queryString) {
        //must -> AND
        //must not -> EXCEPT
        //should -> OR
        var includedAttributes = elasticSearchQueryObj.attributes.filter(function(x) {
            return (x.queryType === "include");
        });
        var attributes = includedAttributes.map(function(item) {
            return item.name;
        });
        var classifiedAttributes = classifyDuplicates(attributes);
        var must_query = classifiedAttributes.unique.map(function(name) {
            return matchStatement(name, includedAttributes.find(function(x) {
                return x.name == name
            }).value);
        });
        var should_query = [];
        var len = classifiedAttributes.duplicates.length;

        for (var i = 0; i < len; i++) {
            var name = classifiedAttributes.duplicates[i];
            var objects = includedAttributes.filter(function(x) {
                return x.name == name
            });

            for (var j = 0; j < objects.length; j++) {
                console.log(objects[i]);
                should_query.push(matchStatement(name, objects[j].value));
            }
        }
        //exclude
        var exludedAttributes = elasticSearchQueryObj.attributes.filter(function(x) {
            return (x.queryType === "exclude");
        });
        console.log(exludedAttributes);
        exludedAttributes = exludedAttributes.map(function(x) {
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




    var matchStatement = function matchStatement(attribute, value) {
        var query = {
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

    return {
        getIndexAttributeDistribution: getIndexAttributeDistribution,
        processQuery: processQuery,
        getAllCases: getAllCases,
        callES: callES,
        elasticSearchQueryObj: elasticSearchQueryObj,
        recordAttributes: recordAttributes,
    }
})();