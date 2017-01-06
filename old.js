var displaySchema = function (data, endpointDOMId) {
		var parsedData = JSON.parse(data);
		var errorCode = parsedData.ErrorCode;
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
					
			});
		}
		else if(errorCode == null || errorCode!=0)
		{
			//TODO : customize this for each url
			$("#notification").html("<h4 style='color:red'>Error! Error: " + parsedData.Messages + "</h4>");
		}
	}

	
	
	var testEndPoint = function(endpoint, sampleJSON, endpointDOMId){
		var url = getMyTranswareServiceURL(endpoint,sampleJSON);
		var callback = function(data){
			displaySchema(data, endpointDOMId);
		}
		var errorcallback = function(data){
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

	$("#compare").click(function(){
			var selectedNodesArray = selectedNodes["endpoint1"];
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

			var thead = $("#tableTitle");
			thead.empty();
			var header = "<tr><th>No</th><th>Name</th>";
			for(var o = 0 ; o < selectedNodesArray1.length; o++){
				header += "<th>"+ selectedNodesArray1[o] + " vs "+ selectedNodesArray2[o]+"</th>";
			}
			header = header + "</tr>";
			thead.append($(header));
			compareTwoEndPoints();
		});