var Transamerica = Transamerica || {};

Transamerica.ARIESRegression = (function() {
	//private 
	//load this dynamically - hardcoded 
	var products = ["FEBII", "ACCUMIULr" ,"FFIULII", "IUL09", "LB201701", "Super201701"];	
	var testCases = [];
	var displayCases = function(data){
		console.log(data);
		
		//data is from json
		//display cases from api
	};
	var QuoteKeys = [];
	var SelectedNodes = [];
	
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
				var quoteArr = getAllkeys(Quote);
				var illuArr = getAllkeys(Illustration);
				QuoteKeys = quoteArr.concat(illuArr);
				selectBox = $("#nodeSelect");
				var len = QuoteKeys.length;
				var  i = 0;
				for(i; i < len; i++){
					var option = $("<option val="+QuoteKeys[i]+">"+QuoteKeys[i]+"</option>");
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
			}
			$("#schemaBox").show();
		}
		else if(errorCode == null || errorCode!=0)
		{
			console.log("Error!");
			console.log(parsedData.Messages);
		}
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
		
	var callMyTranswareService = function(endpoint,caseJSON, callback){
		var calServiceUrl = endpoint;
		var key = "f19d590dcc2b";
		var paramString = JSON.stringify(caseJSON);
		var url = endpoint + "?key=" + key + "&configuration=&jsWebIllustration=" + paramString;
		
		if(callback == null){
			callback = processJSON;
		}
		
		AjaxCall(url, "", "GET", callback );
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
			var endpoint2 = $("#endpoint2").val();	
			console.log(endpoint1);
			console.log(endpoint2);
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
			//send over 1 case for testing
			callMyTranswareService(endpoint1,sampleJSON,displaySchemaSelection);
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



