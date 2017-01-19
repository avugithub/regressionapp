Transamerica.Utils = (function () {
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

    var getUniqueVals = function getUniqueVals(arr) {
        var object = arr.reduce(function (h, v) {
            h[v] = true;
            return h;
        }, {});
        return Object.keys(object);
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
        getUniqueVals:getUniqueVals,
        getCompRowsMarkup: getCompRowsMarkup,
    }
})();