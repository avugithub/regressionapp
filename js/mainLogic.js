var Transamerica = Transamerica || {};

Transamerica.ARIESRegression = (function() {
	//private 
	var selectedProduct = "";
	var sampleJSON = 
{
          "pcName":" Client   ",
          "pcBdate":" ",
          "pcAgeId":"35",
          "pcStateId":"California",
          "pcSexId":"Male",
          "pcRiskClassId":"PreferredPlus",
          "pcSubStdId":"TableNo",
          "pcFlatExtra":"0",
          "pcFlatExtraYrs":"0",
          "svGoalTrackerId":"false",
          "svSolveId":"ManualInput",
          "svFaceAmount":"381,329",
          "svPlanTypeId":"CVATLevel",
          "ioGPTViolations":"MaximumAllowable",
          "psLumpSum":"0",
          "psLumpSumMonth":"1",
          "psPremiumModeId":"Annual",
          "psAvoidMEC":"on",
          "psPremium":"3850.00",
          "psStartYer":"1",
          "psEndYer":"86",
          "pfTargetCVAmount":"",
          "pfTargetCVYear":"",
          "pfSearchBasisId":"CurrentRate",
          "ioLoanInterestId":"Capitalize",
          "ioActivityFrequencyId":"Annual",
          "ioScheduleActivityAct":"",
          "ioScheduleActivityStartYer":"",
          "ioScheduleActivityEndYer":"",
          "ioScheduleActivityAmount":"",
          "pyScheduleChangeYear":"",
          "pyScheduleChangeOptionId":"",
          "pyScheduleChangeFace":"",
          "pyScheduleChangeType":"",
          "acLTCEnable":"No",
			"acLTCAgentNumber":"foo",
          "acLTCRiskClass":"Standard",
          "acLTCSubstandard":"TableNo",
          "acLTCIllustrate":"No",
          "acLTCEstimatedGrowthRate":"0",
          "acLTCBenefitStartingAge":"0",
          "acLTCDesiredDailyBenefit":"Desired",
          "acLTCDesiredBenefitAmt":"0",
          "acLTCPayInterest":"No",
          "acAmount":"0",
          "aiIndex":"",
          "aiRelationship":"",
          "aiRiskClass":"",
          "aiName":"",
          "aiSubstandard":"",
          "aiAge":"",
          "aiFlatExtra":"",
          "aiFEXYears":"",
          "aiSex":"",
          "aiSmoker":"",
          "aiFaceAmount":"",
          "aiDuration":"",
          "biAmount":"163,427",
          "biDuration":"65",
          "cbAge":"0",
          "cbUnits":"0",
          "cbBirthdate":"",
          "ciUnits":"0",
          "dpPremiumWaiverId":"No",
          "mdPremiumWaiverId":"Standard",
          "giAmount":"0",
          "opChecked":"off",
          "1035lumpsum":"0",
          "exAmount1035":"0",
          "exCostBasis1035":"",
          "exType1035":"",
          "exMEC1035":"",
          "ioIndex":["0", "2", "4"],
          "ioRate":[8.400,7.9400,4.20],
          "ioPercent":[1.000,98.000,1.000],
          "ioAllocation":"SpecificAllocation",
          "ipSolve":"None",
          "ipInitialLumpSum":"175000",
          "ipMonthlyPayAmt":"2000",
          "ipMonthlyPayYearsId":"20",
          "ipBackendLumpSum":"12500",
          "ipSumPaymentAmt":"0",
          "ipBasePolicyPercentage":"70",
          "ipBIRPercentage":"30",
          "prBackDate":"05/14/2012",
          "svNetWorth":"0",
          "svAnnualEarnedIncome":"0",
          "svMaxEstimatedFaceAmount":"0",
          "svAgeId":"0",
          "pyAutoSwitchId":"None",
          "rpChecked":"off",
          "diAmount":"0",
          "hmProvision":"NoProvision",
          "usBackDate":"05/14/2012",
          "usRunDate":"05/14/2012",
          "urUserName":"FC8E612603214C17A7646B3966E66C76",
          "urSiteCode":"ushome",
          "ProductId":"FUR16"
	};
	//load this dynamically - hardcoded 
	var products = ["FEBII", "ACCUMIULr" ,"FFIULII", "IUL09", "LB201701", "Super201701"];
	
	var testCases = [{ScenarioName: "test case 1", InputJSON: sampleJSON}];
	
	var displayCases = function(data){
		console.log(data);
	};
	var outputNodes = [];
	var selectedNodes = { "endpoint1": [], "endpoint2":[]};
	var outputs = {};

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
		var tbody = $("#result_tbody");
		
		for(i; i<len;i++){
			var row = $("<tr></tr>");
			testCase = testCases[i];
			var name = testCase["ScenarioName"];
			var inputJSON  = testCase["InputJSON"];
			
			row.append($("<td>"+(i+1)+"</td>"));
			row.append($("<td>"+name+"</td>"));
			
			
			var url1  = getMyTranswareServiceURL($("#endpoint1").val(),inputJSON);
			var url2  = getMyTranswareServiceURL($("#endpoint2").val(),inputJSON);
		
			outputs[name] = {};
			//send 2 ajax requests in order in the same ajax call - do not refactor
			AjaxCallCORS(url1,"","GET", function(data){
				outputs[name]["version1"] = JSON.parse(data);
				AjaxCallCORS(url2,"","GET", function(data){
					outputs[name]["version2"] = JSON.parse(data);
					outputs[name]["results"] = {};
					var version1 = outputs[name]["version1"];
					var version2 = outputs[name]["version2"];
					if(version1 != null & version2 != null){
						if(version1.ErrorCode == 0 & version2.ErrorCode == 0 ){
						   //start compare
							var len = selectedNodes["endpoint1"].length; //for each selected key
							var outputString = "";
							for(var j =0; j< len; j++){
							   var currentNode1 = selectedNodes["endpoint1"][j].split(".");
							   var currentNode2 = selectedNodes["endpoint2"][j].split(".");
							   console.log(currentNode1 , currentNode2)
							   var version1Values = getValueForNode(version1,currentNode1);
							   var version2Values = getValueForNode(version2,currentNode2);
							   var result = compareTwoNodes(version1Values,version2Values)
							   result =  result == true ? "green" : "red";
							   outputString ="<span class='glyphicon glyphicon-stop' style='color:"+result +"'></span> ";
							   row.append($("<td>"+outputString+"</td>"));
							   tbody.append(row);
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
			});
		}		
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
		});
	};
	
	var displaySchema = function (data, endpointDOMId) {
		var parsedData = JSON.parse(data);
		var errorCode = parsedData.ErrorCode;
		console.log(parsedData);
		if(errorCode == 0)
		{
			var selectBox = $("#"+endpointDOMId+"Select");
			var Quote = parsedData.Quote;
			var Illustration = parsedData.Illustration;
			outputNodes = getAllkeys(parsedData);
			var len = outputNodes.length;
			var  i = 0;
			for(i; i < len; i++){
				var option = $("<option val="+outputNodes[i]+">"+outputNodes[i]+"</option>");
				selectBox.append(option);
			}
			selectBox.select2(); // make select box searchable
			selectBox.change(function(){
				//add selected nodes to an array
				var value = selectBox.val();
				if(value != ""){
					selectedNodes[endpointDOMId].push(value);
					displaySelectedNode("selected_nodes_" + endpointDOMId,selectedNodes[endpointDOMId]);
				}else{
					return;
				}
			});

			$("#clear_"+endpointDOMId).click(function(){
					selectedNodes[endpointDOMId] = [];
					var tbody = $("#selected_nodes_" + endpointDOMId);
					tbody.empty();
					$("#resultTable").empty();
			});
		}
		else if(errorCode == null || errorCode!=0)
		{
			//TODO : customize this for each url
			$("#notification").html("<h4 style='color:red'>Error! Error: " + parsedData.Messages + "</h4>");
		}
	}

	var getMyTranswareServiceURL = function(endpoint,caseJSON){
		var calServiceUrl = endpoint;
		var paramString = JSON.stringify(caseJSON);
		var url = endpoint + "?key=f19d590dcc2b" + "&configuration=&jsWebIllustration=" + paramString;
		return url;
	};
	
	var testEndPoint = function(endpoint, sampleJSON, endpointDOMId){
		var url = getMyTranswareServiceURL(endpoint,sampleJSON);
		var callback = function(data){
			displaySchema(data, endpointDOMId);
		}
		var errorcallback = function(data){
			console.log(data);
			$.notify("Status : "+ data.status+" !No response received from !" + $("#"+endpointDOMId).val());
			$("#nodeSelectBox").hide();
		}
		if(url.includes("http")){
			AjaxCallCORS(url,"","GET",callback,errorcallback);
		}else if(url.includes("https")){
			AjaxCall(url,"","GET",callback,errorcallback);
		}else{
			var newUrl = "http://" + url;
			AjaxCallCORS(newUrl,"","GET",callback,errorcallback);
			$("#"+endpointDOMId).val("http://"+ endpoint);
		}
	}

	//public
	var initialize = function (){
		$("#nodeSelectBox").hide();
		$("#compare").click(function(){
			$("#resultTable").empty();
			var selectedNodesArray1 = selectedNodes["endpoint1"];
			var selectedNodesArray2 = selectedNodes["endpoint2"];

			//validation
			if(selectedNodesArray1.length == 0 && selectedNodesArray2.length == 0){
				alert("Please select node for both end points");
				return false;
			}
			else if(selectedNodesArray1.length != selectedNodesArray2.length)
			{
				alert("Can't compare ! Make sure the number of selected nodes for both endpoints are the same");
				return false;
			}

			var table = $("#resultTable");
			var header = "<tr><th>No.</th><th>Name</th>";
			for(var o = 0 ; o < selectedNodesArray1.length; o++){
				header += "<th>"+ selectedNodesArray1[o] + " vs "+ selectedNodesArray2[o]+"</th>";
			}
			header = header + "</tr>";
			table.append($(header));
			table.append($("<tbody id='result_tbody'></tbody>"));
			compareTwoEndPoints();
		});

		$("#pressNext").click(function(){
			var endpoint1 = $("#endpoint1").val();			
			//send over 1 case for testing
			var endpoint2 = $("#endpoint2").val();

			if(endpoint1 === "" || endpoint2 === ""){
				alert("One of the end point is left blank !");
				return false;
			}
			
			var json= sampleJSON;
			$("#nodeSelectBox").show();
			testEndPoint(endpoint1, json ,"endpoint1");
			testEndPoint(endpoint2, json ,"endpoint2");
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
			selectedProduct = value;


			//change this when move to company domain	
			var kibanaUrl = "https://search-scenarios-llsguds6zuyl7hl4gfsomx4pxi.us-west-2.es.amazonaws.com/_plugin/kibana/#/discover?_g=(refreshInterval:(display:Off,pause:!f,section:0,value:0),time:(from:now-30d,mode:quick,to:now))&_a=(columns:!(_source),\
index:"+value.toLowerCase()+",interval:auto,query:(query_string:(analyze_wildcard:!t,query:'*')),sort:!(ComparisonLog.endTime,desc))";
			window.open(kibanaUrl);

			$("#productTitle").text(selectedProduct);
			
		});

		$("#kibana_url").on( "change", function(){
			if(selectedProduct === ""){
				$.notify("Please select a product");
			}else{
				var value = $(this).val();

				//take out query 
				var tableName = selectedProduct.toLowerCase();
				var baseURl = "https://m7kx722wp8.execute-api.us-west-2.amazonaws.com/prod/gettestcasesfromkibanaurl";
				var url = baseURl + "?tableName=" + tableName + "&url=" +encodeURIComponent(value.replace(",","")); 

				AjaxCall(url, "", "GET" );

			}
		});

	};
	return {
		loadProducts : loadProducts,
		initialize: initialize
	};
})();


