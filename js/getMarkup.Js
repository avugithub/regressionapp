var zip = function(arr1, arr2) {
    var zipArr = [];
    var maxLen = Math.max(arr1.length, arr2.length);
    var i;
    for (i = 0; i < maxLen; i++) {
        zipArr.push([arr1[i], arr2[i]]);
    }
    return zipArr;
};

var zipByKeys = function(obj1, obj2) {
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

var getCompRowsMarkup = function(source1, source2) {
    //source1 and source2 are either primitives or arrays - they are "leaf nodes"
    var markup = "";
    if (source1 instanceof Array == false && source1 instanceof Array == false) {
        markup = `<tr><td>${source1}</td><td>${source2}</td></tr>`;
    } else if (source1 instanceof Array == true && source1 instanceof Array == true) {
        if (source1.length > 0 && source2.length > 0) {
            var valuePairs = zip(source1, source2);
            var len = valuePairs.length;
            for (var i = 0; i < len; i++) {
                if (typeof(valuePairs[i][0]) != "object" && typeof(valuePairs[i][1]) != "object") {
                    var translatedVals = valuePairs[i].map(function(val) {
                        return val == undefined ? "MISSING" : val
                    });
                    var style = translatedVals[0] !== translatedVals[1] ? "style='background-color:yellow'" : "";
                    var difference = "";
                    if (typeof(valuePairs[i][0]) == "number" && typeof(valuePairs[i][1]) == "number") {
                        difference = (valuePairs[i][0] - valuePairs[i][1]).toFixed(4);
                    }
                    markup += `<tr ${style}><td>${translatedVals[0]}</td><td>${difference}</td><td>${translatedVals[1]}</td></tr>`;
                } else if (valuePairs[i][0] instanceof Array == true && valuePairs[i][1] instanceof Array == true) {
                    var _markup = getCompRowsMarkup(valuePairs[i][0], valuePairs[i][1]);
                    var style = _markup.includes("yellow") ? "style='background-color:yellow'" : "";
                    markup += "<tr><td><table border='1'><thead><tr " + style + "><th colspan='2'>index: " + i + " <a href='#' class='viewData' >View Data</a></th></tr></thead><tbody class='dataBox' style='display:none'>" + _markup + "</tbody></table></tr></td>";
                } else {
                    var _markup = "";
                    var a = zipByKeys(valuePairs[i][0], valuePairs[i][1]);
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