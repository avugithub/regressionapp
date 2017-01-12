Transamerica.Utils = (function(){
	var recordAttributes = {};
	var elasticSearchQueryObj = {
		"included" : {},
		"excluded" :{},
		"custom_query": ""
	};
	var getAllkeys = function(obj)
	{
		//going over all keys until exhausted
		var keys = [];
		for (var key in obj)
		{
			if (obj.hasOwnProperty(key))
			{
				if(typeof(obj[key]) == "object" && obj[key] instanceof Array == false) //if it is an object not array, go down one more level
				{
					var subkeys = getAllkeys(obj[key]);
					var i = 0;
					var len = subkeys.length;
					for(i; i < len; i++){
						keys.push(key+"."+subkeys[i]);
					}
				}
				else
				{
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
		    
		    var url = baseURl + "?systemID=" + "1" + "&scenarioGUID=" + ScenarioGuid + "&priorityCode=" + value  + "&userID=" + "RBEWERNI";
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
        catch(err)
        {
          
            console.log("Error Caught"+ err.message);
        }
        var errorcallback = function (data) {
            console.log("");
         
        } 
    };

	//AJAX
	var  AjaxCallCORS = function(url, data, type, callback,errorcallback)
	{
		$.ajax(
		{
			contentType : 'application/json; charset=utf-8',
			url : url,
			type: type,
			data : data,
			dataType: 'jsonp',
			crossDomain: true,
			success : function(d)
			{
				if(callback != null)
				{
					callback(d);
				}
				else
				{
					console.log("no callback provided");
					console.log(d);
				}
			},
			error: function ( data){
				if(data.status == 404){
					if(errorcallback != undefined){
						errorcallback(data);
					}
				}

			} 
		});
	};
	
	var  AjaxCall = function(url, data, type, callback, errorcallback)
	{
		console.log(url);
		$.ajax(
		{
			contentType : 'application/json; charset=utf-8',
			url : url,
			type: type,
			data : data,
			dataType: 'json',
			success : function(d)
			{
				if(callback != null)
				{
					callback(d);
				}
				else
				{
					console.log("no callback provided");
					console.log(d);
				}
			},
			error: function ( data){
				if(data.status == 404){
					if(errorcallback != undefined){
						errorcallback(data);
					}
				}

			} 
		});
	};

	var comparisionTable = function (scenarioGUID) {
        $("#testCaseName").html("- Test Case: " + testCaseName);
        var table = $("#comparisonTable");
        var outputs = Transamerica.ARIESRegression.outputs;
        console.log(outputs);
        table.empty();
    
        var num = Object.keys(outputs).length;
      //  console.log(num);

        // add header 

        table.append($("<thead></thead>"));


        var comparedOutputs = outputs[scenarioGUID]["version1"]["selectedKeyOutputs"];
        for (var key in comparedOutputs) {
            if (comparedOutputs.hasOwnProperty(key)) {
           
                    var tbody = $("<tbody></tbody");
                    var currentNode = key;
                    var currentNodeData = comparedOutputs[currentNode];
                    var currentNodeData2 = outputs[scenarioGUID]["version2"]["selectedKeyOutputs"][currentNode];

                    var len = currentNodeData.length;
                    var j;
                    tbody.append($("<tr style='background:yellow;'><td colspan='2'>" + key + "</td></tr>"));
                    for (j = 0; j < len; j++) {

                        var row = $("<tr><td>" + currentNodeData[j] + "</td>" +
                            "<td>" + currentNodeData2[j] + " </td>" +
                            "</tr>");
                        tbody.append(row);
                    }                
                    table.append(tbody);                    
            }
        }
    };

    var searchCases = function(selectedProduct, url){
		var value = url;
		var splitTerms = value.split("),");
		var queryStatement  = [];
		var len = splitTerms.length;
		for(var i = 0 ; i < len ; i++){
			if(splitTerms[i].includes("query:(match:(")){
		  queryStatement.push(splitTerms[i]);

		  }
		} 
		var tableName = selectedProduct.toLowerCase();
		var baseURl = "https://m7kx722wp8.execute-api.us-west-2.amazonaws.com/prod/gettestcasesfromkibanaurl";
		var requestUrl = baseURl + "?tableName=" + tableName + "&url="+queryStatement.join();
		AjaxCall(requestUrl, "", "GET",displayCases );
	};

    var  getIndexAttributeDistribution = function(tableName, domContainer){
    	var requestUrl = "https://m7kx722wp8.execute-api.us-west-2.amazonaws.com/prod/getindexdistribution?tableName=" + tableName; 
    	AjaxCall(requestUrl, "", "GET",function(data){buildProductIndexAttributes(data,domContainer);});	
    };

    var buildProductIndexAttributes = function(data){

    	var table = $("#attributeTable");
    	
    	if(data.hasOwnProperty("errorMessage")){
    		//print out the error
    	}
    	else{
    		console.log(data);
    		var aggregations = data["response"]["aggregations"];
    		for (var attribute in aggregations){
    			if(aggregations.hasOwnProperty(attribute)){
    				var buckets = aggregations[attribute]["buckets"];
    				var len = buckets.length;
    				var i;
    				var row = $("<tr id='"+attribute+"'><td>"+attribute+"</td></tr>");
    				recordAttributes[attribute] = {  }
    				for (i = 0; i< len; i++){
    					recordAttributes[attribute][buckets[i]["key"]] = buckets[i]["doc_count"];
    				}
    				rowClickHandler(attribute, row);
    				table.append(row);
    			}
    		}
    	}


    	
    }

    var rowClickHandler= function(attribute, row){
    	row.click(function(){
		    //highlight the row clicked
		    var selected = $(this).hasClass("highlight");
    		var values = recordAttributes[attribute];
    		var tbody = $("#distribution");
    		tbody.empty();
    		for(var key in values){
    			if(values.hasOwnProperty(key)){
    				var value = key == " " ? "No Data" : key;
    				var count =  values[key];
    				var row = $("<tr><td><b>"+value+"</b></td><td>"+count+" records</td><td>"+
    						"<a class='add'><span class='glyphicon glyphicon-plus' style='color:green'>&nbsp;</span></a><a class='remove'><span style='color:red' class='glyphicon glyphicon-minus'></span></a></td></tr>");
    				valueSelectHandler(row, attribute, key);
    				tbody.append(row);
    					
    			}
    		}
    	});
    };

    var valueSelectHandler = function (row, attribute, value) {
    	row.find("a").click(function(){
    		var tbody	= $("#attributeSelection");
    		var queryType = "included";
    		if($(this).attr("class") == "remove"){
    				queryType = "excluded"
	    	}
    		if (elasticSearchQueryObj[queryType].hasOwnProperty(attribute))
    		{
    			return false;
    		}
    		else
    		{	
	    		elasticSearchQueryObj[queryType][attribute] = value;
	    		var selectedAttributeRow = $("<tr><td>"+attribute+"</td><td>"+value+"</td><td>"+queryType.toUpperCase()+"<a class='removeSelectedAttribute'><span style='color:red' class='glyphicon glyphicon-remove'></span></a></td></tr>");
    			selectedAttributeRow.find("a").click(function(){
    				if($(this).attr("class") == "removeSelectedAttribute")
    				{
    					selectedAttributeRow.remove();
    					delete elasticSearchQueryObj[queryType][attribute];
    				}
    			});
    			tbody.append(selectedAttributeRow);
    		}
    	});
    };




	//export function 
	return {
		changePriorityOne : changePriorityOne,
		AjaxCallCORS : AjaxCallCORS,
		AjaxCall: AjaxCall,
		comparisionTable:comparisionTable,
		getAllkeys: getAllkeys,
		searchCases : searchCases,
		getIndexAttributeDistribution: getIndexAttributeDistribution,
		buildProductIndexAttributes: buildProductIndexAttributes
	}
})();