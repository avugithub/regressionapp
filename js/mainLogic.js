

Transamerica.ARIESRegression = (function() {
	//private 
	var selectedProduct = "";
	var products = ["FEBII", "ACCUMIULr" ,"FFIULII", "IUL09", "LB201701", "Super201701"];
	var selectedNodes = [];
	var outputs = {};	
	var testCases = [];
	var isSameSystem = true;

	var displayCases = function(data){
		var response = data["response"];
		if(Array.isArray(response) == false){
			table.notify("No Test Case Received For the Given Query Url");
		}else{
			testCases = [];
			testCases = response;
			buildScenarioTable();
		}
	};

	var buildScenarioTable = function (){
		var tbody = $("#testCases");
		tbody.empty();
		var num = testCases.length;
		var i;
		for (i =0 ; i < num; i++ ){
			var row = $("<tr id="+testCases[i]["_source"]["ScenarioGuid"]+"><td>"+(i+1)+
				"</td><td>"+testCases[i]["_source"]["ScenarioName"] +
				"</tr>");
			tbody.append(row);
		}
		$("#num_cases").html("( num: " + testCases.length + " cases)");
	}

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

	var compareTwoEndPoints = function(){
		var i = 0;
		var len = testCases.length;
		for(i; i<len;i++){
			testCase = testCases[i];
			var scenarioID = testCase["_source"]["ScenarioGuid"];
			var inputJSON  = testCase["_source"]["InputJSON"]
			processComparison(scenarioID, inputJSON);
		}		
	};
	
	var processComparison = function(scenarioID, inputJSON){
		//the reason I moved the code is closure in JS is only created inside function
		//refer to http://www.w3schools.com/js/js_function_closures.asp
		var url1  = getMyTranswareServiceURL($("#endpoint1").val(),inputJSON);
		console.log(url1);
		var url2  = getMyTranswareServiceURL($("#endpoint2").val(),inputJSON);

		var row = $("#"+scenarioID);

		outputs[scenarioID] = {};
		//send 2 ajax requests in order in the same ajax call - do not refactor
		AjaxCallCORS(url1,"","GET", function(data){
			outputs[scenarioID]["version1"] = {};
			outputs[scenarioID]["version1"]["response"] = JSON.parse(data);

			AjaxCallCORS(url2,"","GET", function(data){

				outputs[scenarioID]["version2"] = {};
				outputs[scenarioID]["version2"]["response"] = JSON.parse(data);
				

				var version1 = outputs[scenarioID]["version1"]["response"];
				var version2 = outputs[scenarioID]["version2"]["response"];
				
				outputs[scenarioID]["version1"]["selectedKeyOutputs"] = {};
				outputs[scenarioID]["version2"]["selectedKeyOutputs"] = {};

				if(version1 != null & version2 != null){
					if(version1.ErrorCode == 0 & version2.ErrorCode == 0 ){
					   //start compare
						var len = selectedNodes.length; //for each selected key
						var outputString = "";
						var tds = "";

						var finalResults = true;

						for(var j =0; j< len; j++){
						   var currentNode = selectedNodes[j];
						   var version1Values = getValueForNode(version1,currentNode);
						   var version2Values = getValueForNode(version2,currentNode);

						   //store the  values for current node so we can display later
						   outputs[scenarioID]["version1"]["selectedKeyOutputs"][currentNode] = version1Values;
						   outputs[scenarioID]["version2"]["selectedKeyOutputs"][currentNode] = version2Values;

						   var result = compareTwoNodes(version1Values,version2Values)
						   if(result == false){ // if the output of any key is failing -> final result should fail
						   		finalResults = false;
						   }
						   outputString ="<span class='glyphicon glyphicon-stop' style='color:"+ (result == true ? "green" : "red") +"'></span> ";
						   tds += "<td>"+outputString+"</td>";
						}	
						row.append($(tds));
					}
				   else{
					   //print out which version has error
				   }
				}else{
				   //print out Error/ both end points
				}
			});
		});

		//update global object
		Transamerica.ARIESRegression.outputs = outputs;
	};

	var getValueForNode = function(grandObj, nodeString){
		var nodes  = nodeString.split(".");
		var obj = grandObj;
		for (var i = 0, len = nodes.length; i < len; i++) {
			obj = obj[nodes[i]]; 
		}
		return obj;
	}
	
	var compareTwoNodes = function(obj1 , obj2)
	{
		console.log("Comparing :" , obj1, obj2)
		var result = true; 
		if(obj1 instanceof Array == true){
			if(obj1.len == obj2.len){
				result = compareTwoArrays(obj1,obj2)
			}else{
				result = false;
			}
		}
		else
		{
			if (obj1 == obj2){
				result =true;
			}else{
				result = false;
			}
		}
		return result;
	}
	
	var compareTwoArrays = function (arr1, arr2){
		result = true;
		var len = arr1.length;
		var i = 0;
		for(i; i< len; i++){
			if(typeof(arr1[i]) == "object" && typeof(arr2[i]) == "object"){
				result = JSON.stringify(arr1[i]) === JSON.stringify(arr2[i]); // we can go deeper !
			}else{
				if(arr1[i] != arr2[i])
				{	
					return false;
				}
			}
		}
		return result;
	};
	
	var displaySelectedNode = function(tbodyId, currentSelectedNodes){
		var tbody = $("#" + tbodyId);
		tbody.empty();
		var i = 0;
		var len  = currentSelectedNodes.length;
		for (i; i<len; i++){
			tbody.append($("<tr><td>"+(i+1)+"</td><td>"+currentSelectedNodes[i]+"</td></tr>"));
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
	
	var getMyTranswareServiceURL = function(endpoint,caseJSON){
		var calServiceUrl = endpoint;
		var paramString = JSON.stringify(caseJSON);
		var re = new RegExp("\" \"" , 'g');
		paramString = paramString.replace(re, "\"\"");
		var url = endpoint + "?key=f19d590dcc2b" + "&configuration=&jsWebIllustration=" + paramString;
		return url;
	};

	var fillSelectBox = function(){
		var selectBox = $("#endpointSelect");
		var myTWNodes = Transamerica.Globals.myTWJSONkeys;
		var len = myTWNodes.length;
		var  i = 0;
		for(i; i < len; i++){
			var option = $("<option val="+myTWNodes[i]+">"+myTWNodes[i]+"</option>");
			selectBox.append(option);
		}
		selectBox.select2();
		selectBox.change(function(){
				//add selected nodes to an array
				var value = selectBox.val();
				if(value != ""){
					selectedNodes.push(value);
					displaySelectedNode("selected_nodes_tbody", selectedNodes);
				}else{
					return;
				}
		});
		$("#clear_endpoint").click(function(){
			selectedNodes = [];
			var tbody = $("#selected_nodes_tbody");
			var testCasestbody = $("#testCases");
			testCasestbody.empty();
			tbody.empty();
			buildScenarioTable();
		});	
	}

	//public
	var initialize = function (){
		fillSelectBox();
		$("#nodeSelectBox").hide();
		$("#kibanaBox").hide();

		$("#compare").click(function(){
			var selectedNodesArray = selectedNodes;
			//validation
			if(selectedNodesArray.length == 0){
				alert("Please select node to compare");
				return false;
			}

			var testCasestbody = $("#testCases");
			testCasestbody.empty();
			buildScenarioTable();

			var thead = $("#tableTitle");
			thead.empty();
			var header = "<tr><th>No</th><th>Name</th>";
			for(var o = 0 ; o < selectedNodesArray.length; o++){
				header += "<th>"+ selectedNodesArray[o] +"</th>";
			}
			header = header + "</tr>";
			thead.append($(header));
			compareTwoEndPoints();
		});

		$("#pressNext").click(function(){
			var endpoint1 = $("#endpoint1").val();			
			var endpoint2 = $("#endpoint2").val();

			if(endpoint1 === "" || endpoint2 === ""){
				alert("One of the end point is left blank !");
				return false;
			}
			if(testCases.length == 0){
				$.notify("There is no test case for testing. Please provide the kibana url and press Search")
				return false;
			}
			else if(isSameSystem === false)
			{	
				//do this for if the systems are different
				//actually get a case that is currently passing 
			}else if(isSameSystem === true)
			{
				$("#nodeSelectBox").show();
			}
		});

		$('input[type=radio][name=sameSystem]').change(function() {
	        if (this.value == 'yes') 
	        {
	            isSameSystem = true;
	        }
	        else if (this.value == 'no') 
	        {
	            isSameSystem = false;
	        }
   		});
	};

	var loadProducts = function(selectBoxId){

		selectBox = $("#productSelect");
		var  i = 0;
		for(i; i < products.length; i++){
			var option = $("<option val="+products[i]+">"+products[i]+"</option>");
			selectBox.append(option);
		}
		selectBox.change(function(){
			var value = $(this).val();
			if(value == ""){
				$("#productTitle").text("Please select a product !");
				return;
			}
			selectedProduct = value;
			$("#kibanaBox").show();

			//change this when move to company domain	
			$("#productTitle").text(selectedProduct);
			
		});

		$("#redirectKibana").click(function(){
			if(selectedProduct === ""){
				$.notify("Please Select A Product");
				return false;
			}
			var kibanaUrl = "https://search-scenarios-llsguds6zuyl7hl4gfsomx4pxi.us-west-2.es.amazonaws.com/_plugin/kibana/#/discover?_g=(refreshInterval:(display:Off,pause:!f,section:0,value:0),time:(from:now-30d,mode:quick,to:now))&_a=(columns:!(_source),\
index:"+selectedProduct.toLowerCase()+",interval:auto,query:(query_string:(analyze_wildcard:!t,query:'*')),sort:!(ComparisonLog.endTime,desc))";
			window.open(kibanaUrl);
		});

		$("#search").click(function(){
			if(selectedProduct === ""){
				$.notify("Please select a product");
			}else{
				var value = $("#kibana_url").val();
				var splitTerms = value.split("),");
				var queryStatement  = [];
				var len = splitTerms.length;
				for(var i = 0 ; i < len ; i++){
					if(splitTerms[i].includes("query:(match:(")){
				  queryStatement.push(splitTerms[i]);

				  }
				}
				console.log(splitTerms);
				//take out query 
				var tableName = selectedProduct.toLowerCase();
				var baseURl = "https://m7kx722wp8.execute-api.us-west-2.amazonaws.com/prod/gettestcasesfromkibanaurl";
				var url = baseURl + "?tableName=" + tableName + "&url="+queryStatement.join();
				AjaxCall(url, "", "GET",displayCases );

			}
		});


	};
	return {
		loadProducts : loadProducts,
		initialize: initialize,
		outputs:outputs // for testing - remove 
	};
})();


