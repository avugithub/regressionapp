var Transamerica = Transamerica || {};

Transamerica.ARIESRegression = (function() {
	//private 
	var sampleJSON = 
			{
			  "pcName":" Dr. Trinh Nellie Moreira    ",
			  "pcBdate":"",
			  "pcAgeId":"55",
			  "pcStateId":"NewYork",
			  "pcSexId":"Female",
			  "pcRiskClassId":"PreferredSmoker",
			  "pcSubStdId":"TableNo",
			  "pcFlatExtra":"0.00",
			  "pcFlatExtraYrs":"0",
			  "svSolveId":"SolveforFace",
			  "ipSolve":"None",
			  "svFaceAmount":"1364",
			  "psPremiumModeId":"BiWeekly26",
			  "aiAmount":"0",
			  "cbAge":"0",
			  "cbUnits":"0",
			  "ciUnits":"0",
			  "pwPremiumWaiverId":"No",
			  "dpPremiumWaiverId":"No",
			  "mdPremiumWaiverId":"No",
			  "prBackDate":"10/26/2014",
			  "svNetWorth":"0",
			  "svAnnualEarnedIncome":"0",
			  "svMaxEstimatedFaceAmount":"0",
			  "svAgeId":"0",
			  "pyAutoSwitchId":"None",
			  "rpChecked":"off",
			  "diAmount":"0",
			  "hmProvision":"NoProvision",
			  "usBackDate":"10/26/2014",
			  "usRunDate":"10/26/2014",
			  "urUserName":"FC8E612603214C17A7646B3966E66C76",
			  "urSiteCode":"ushome",
			  "ProductId":"TS115"
			};
	//load this dynamically - hardcoded 
	var products = ["FEBII", "ACCUMIULr" ,"FFIULII", "IUL09", "LB201701", "Super201701"];	
	var testCases = [{ScenarioName: "test", InputJSON: sampleJSON}];
	var displayCases = function(data){
		console.log(data);
		
		//data is from json
		//display cases from api
	};
	var ReponseNodes = [];
	var SelectedNodes = [];
	var outputs = {};
	var processJSON = function(data){
		console.log(JSON.parse(data));
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
	
	var displaySchemaSelection = function(data){
		console.log(JSON.parse(data));
		var parsedData = JSON.parse(data);
		var errorCode = parsedData.ErrorCode;
		console.log(errorCode);
		if(errorCode == 0)
		{
			//display the schema of Quote Object so user can select the nodes
			var Quote = parsedData.Quote;
			var Illustration = parsedData.Illustration;
			if(Illustration == null || Quote == null)
			{
				
				alert("No Quote or Illustration");
				return;
			}
			else
			{
				ReponseNodes = getAllkeys(parsedData);
				selectBox = $("#nodeSelect");
				var len = ReponseNodes.length;
				var  i = 0;
				for(i; i < len; i++){
					var option = $("<option val="+ReponseNodes[i]+">"+ReponseNodes[i]+"</option>");
					selectBox.append(option);
				}
				$("#selectNode").click(function(){
					//add selected nodes to an array
					var value = $("#nodeSelect").val();
					if(value != ""){
						SelectedNodes.push(value);
						displaySelectedNode();
					}else{
						return;
					}
				});

				$("#clearSelectedNode").click(function(){
					SelectedNodes = [];
					var tbody = $("#selected_nodes");
					tbody.empty();
				});
				
				$("#compare").click(function(){
					if(SelectedNodes.length == 0){
						alert("Please select a node to select");
						return;
					}
					var i = 0;
					var len = testCases.length;
					for(i; i<len;i++){
						
						compareTwoEndPoints(testCases[i])
					}
				});
			}
			$("#schemaBox").show();
		}
		else if(errorCode == null || errorCode!=0)
		{
			console.log("Error!");
			console.log(parsedData.Messages);
		}
	};
	var compareTwoEndPoints = function(testCase){//mother function
		var name = testCase["ScenarioName"];
		var inputJSON  = testCase["InputJSON"];
			
		var endpoint1 = $("#endpoint1").val();
		var url1  = getMyTranswareServiceURL(endpoint1,inputJSON);
		var endpoint2 = $("#endpoint2").val();
		var url2  = getMyTranswareServiceURL(endpoint2,inputJSON);
		
		outputs[name] = {};
		//send 2 ajax requests in order in the same ajax call - do not refactor
		AjaxCall(url1,"","GET", function(data){
			outputs[name]["version1"] = JSON.parse(data);
			AjaxCall(url2,"","GET", function(data){
				outputs[name]["version2"] = JSON.parse(data);
				outputs[name]["results"] = {};
				var version1 = outputs[name]["version1"];
				var version2 = outputs[name]["version2"];
					if(version1 != null & version2 != null){
						if(version1.ErrorCode == 0 & version2.ErrorCode == 0 ){
						   //start compare
						    var len = SelectedNodes.length; //for each selected key
							var outputString = "";
							for(var i =0; i< len; i++){
							   var currentNodes = SelectedNodes[i].split(".");
							   var version1Values = getValueForNode(version1,currentNodes);
							   var version2Values = getValueForNode(version2,currentNodes);
							   var result = compareTwoNodes(version1Values,version2Values)
							   outputs[name]["results"][SelectedNodes[i]] = result;
							   result =  result == true ? "green" : "red";
							   outputString += SelectedNodes[i]+": <span class='glyphicon glyphicon-stop' style='color:"+result +"'></span> ";
							}
							$("#result_test1").html(outputString); //replace with result_caseGuid
					    }
					   else{
						   //print out which version has error
					   }
					}else{
					   //print out Error/ both end points
					}
				
			});
		})
		
	};
	
	var getValueForNode = function(grandObj, nodes){
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
				result = JSON.stringify(arr1[i]) === JSON.stringify(arr2[i]);
			}else{
				if(arr1[i] != arr2[i])
				{	
					return false;
				}
			}
		}
		return result;
	};
	
	var displaySelectedNode = function(){
		var tbody = $("#selected_nodes");
		tbody.empty();
		var i = 0;
		var len  = SelectedNodes.length;
		for (i; i<len; i++){
			tbody.append($("<tr><td>"+ i +"</td><td>"+SelectedNodes[i]+"</td></tr>"));
		}
	};
	
	var getMyTranswareServiceURL = function(endpoint,caseJSON){
		var calServiceUrl = endpoint;
		var key = "f19d590dcc2b";
		var paramString = JSON.stringify(caseJSON);
		var url = endpoint + "?key=" + key + "&configuration=&jsWebIllustration=" + paramString;
		return url;
	};
	var AjaxCall = function(url, data, type, callback)
	{
		console.log("Calling AJAX");
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
		});
	};
	
	//public
	var initialize = function (){
		$("#schemaBox").hide();
		
		$("#pressNext").click(function(){
			var endpoint1 = $("#endpoint1").val();
			console.log(endpoint1);
			
			//send over 1 case for testing
			var url = getMyTranswareServiceURL(endpoint1,sampleJSON);
			AjaxCall(url,"","GET",displaySchemaSelection);
		});
	};
	
	var loadProducts = function(selectBoxId){
		if(selectBoxId == "undefined"){
		return; 
		}
		console.log("selectBoxId", selectBoxId);
		selectBox = $("#"+selectBoxId);
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
			$("#productTitle").text(value);
			var url = "https://c9e4efey8d.execute-api.us-west-2.amazonaws.com/prod/sample_api";
			var data = {
				tableName : value.toLowerCase()
			};
			var jsonString = JSON.stringify(data);
			AjaxCall(url,jsonString,'GET',displayCases);
		});	
	};
	return {
		loadProducts : loadProducts,
		initialize: initialize
	};
})();



