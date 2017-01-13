Transamerica.Utils = (function(){
	var recordAttributes = {};
	var elasticSearchQueryObj = {
		"attributes": [],
		"custom_query": ""
	};
	var sampleQuery = {
		filtered:{
			query : {},
			filter:{
				bool:{
					must:[],
					must_not:[],
					should:[],
				}
			}	
		}
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

    

    var  getIndexAttributeDistribution = function(tableName, domContainer){
    	var requestUrl = "https://m7kx722wp8.execute-api.us-west-2.amazonaws.com/prod/getindexdistribution?tableName=" + tableName; 
    	AjaxCall(requestUrl, "", "GET",function(data){buildProductIndexAttributes(data,domContainer);});	
    };

    var buildProductIndexAttributes = function(data){
    	var table = $("#attributeTable");
    	table.empty();
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
    				var value = key;
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
    		var queryType = "include";
    		if($(this).attr("class") == "remove"){
    				queryType = "exclude"
	    	}
    		if (attributeExists(attribute, value))
    		{
    			return false;
    		}
    		else
    		{	
	    		elasticSearchQueryObj.attributes.push({name: attribute, value: value , queryType: queryType });
	    		var selectedAttributeRow = $("<tr><td>"+attribute+"</td><td>"+value+"</td><td>"+queryType.toUpperCase()+
	    			"<a class='removeSelectedAttribute'>  <span style='color:red' class='glyphicon glyphicon-remove'></span></a></td></tr>");
    			selectedAttributeRow.find("a").click(function(){
    				if($(this).attr("class") == "removeSelectedAttribute")
    				{
    					selectedAttributeRow.remove();
    					removeAttribute(attribute, value);
    				}
    			});
    			tbody.append(selectedAttributeRow);
    		}
    	});
    };

    var removeAttribute = function (attribute,  value ) {
    	var	attArr =  elasticSearchQueryObj.attributes;
    	for (var i = 0; i < attArr.length; i++) {
    		if(attArr[i].name === attribute && attArr[i].value === value){
    			elasticSearchQueryObj.attributes.splice(i, 1);
    			return;
    		}
    	}
    }

    var attributeExists = function (attribute, value) {
    	var attArr = elasticSearchQueryObj.attributes;
    	var obj = attArr.filter(function(x){ return (x.name === attribute && x.value === value); });
    	if(obj.length === 0)
    	{
    		return false;
    	}
    	else
    	{
    		return true;
    	}
    }

    var buildQuery = function (queryString) {
    	//must -> AND
    	//must not -> EXCEPT
    	//should -> OR
    	var includedAttributes = elasticSearchQueryObj.attributes.filter(function(x){ return (x.queryType === "include"); });
    	var attributes = includedAttributes.map(function(item){return item.name;});
    	var classifiedAttributes = classifyDuplicates(attributes);
    	var must_query = classifiedAttributes.unique.map(function(name){
			return matchStatement(name,includedAttributes.find(function(x){return x.name == name}).value);
    	});
    	var should_query = [];
    	var len = classifiedAttributes.duplicates.length;

    	for (var i = 0; i < len ; i++) {
    		var name = classifiedAttributes.duplicates[i];
    		var objects = includedAttributes.filter(function(x){return x.name == name});

    		for (var j = 0; j < objects.length ; j++)
    		{
    			console.log(objects[i]);
				should_query.push(matchStatement(name, objects[j].value));   			
    		}
    	}
    	//exclude
    	var exludedAttributes = elasticSearchQueryObj.attributes.filter(function(x){ return (x.queryType === "exclude"); });
    	exludedAttributes = exludedAttributes.map(function(x){
    		return matchStatement(x.name, x.value);
    	});

    	var newQuery = sampleQuery;
    	newQuery.filtered.query = {
    		query_string : {
    			query: queryString || "*"
    		}
    	};
    	newQuery.filtered.filter.bool.must = must_query;
    	newQuery.filtered.filter.bool.must_not = exludedAttributes;
    	newQuery.filtered.filter.bool.should = should_query;

        var fields = classifiedAttributes.unique.concat(classifiedAttributes.duplicates);
        fields = fields.concat(["ScenarioGuid", "ScenarioName", "InputJSON" ]);     

        console.log(fields)
    	return {
            _source : fields,
            size: 9999,
            query : newQuery 


        };
    };


    var classifyDuplicates  = function classifyDuplicates(arr){

    	var response = { duplicates : [],
    					 unique: []
    					};

    	for (var i = 0; i < arr.length; i++) 
    	{
    		if (arr.indexOf(arr[i], i + 1) > -1) 
    		{
    			if(response.duplicates.indexOf(arr[i]) === -1)
    			{
    				response.duplicates.push(arr[i]);
    			}
    		}else if(response.duplicates.indexOf(arr[i]) == -1)
        	{
        		response.unique.push(arr[i]);
        	}
    	}
    	return response;
    };

    var matchStatement = function matchStatement(attribute, value){
		var query = 
		{
		  	"query" : {
		    	"match" : {}
			}  
		};
		query.query.match[attribute] = {
			query: value,
			type: "phrase"
		}
		return query
    };

    var processQuery = function(tableName, customQuery, callBack){
  
        //the following code calls lambda function - for security purposes 
        //var paramString = JSON.stringify(buildQuery(customQuery));
    	//var requestUrl = "https://m7kx722wp8.execute-api.us-west-2.amazonaws.com/prod/queryelasticsearch?tableName=" + tableName + 
    	//"&queryString="+ encodeURI(paramString); 
    	//AjaxCall(requestUrl,"","GET");

        //use the follow code to call es directly - as long as the endpoint is open to public
        var server = "search-scenarios-llsguds6zuyl7hl4gfsomx4pxi.us-west-2.es.amazonaws.com";
        var query =  buildQuery(customQuery);
        
                console.log(JSON.stringify(query));
    
        callES(server, tableName + "/_search", "GET",  JSON.stringify(query), callBack);
    	
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

    var constructESUrl =  function constructESUrl(server, url) {
        if (url.indexOf("://") >= 0) return url;
        if (server.indexOf("://") < 0) server = "http://" + server;
        if (server.substr(-1) == "/") {
            server = server.substr(0, server.length - 1);
        }
        if (url.charAt(0) === "/") url = url.substr(1);

        return server + "/" + url;
	}
	//export function 
	return {
		changePriorityOne : changePriorityOne,
		AjaxCallCORS : AjaxCallCORS,
		AjaxCall: AjaxCall,
		comparisionTable:comparisionTable,
		getAllkeys: getAllkeys,
		getIndexAttributeDistribution: getIndexAttributeDistribution,
		processQuery:processQuery,
        callES : callES
	}
})();