
var ARIESRegression = (function() {
	//private 
	//load this dynamically - hardcoded 
	var products = ["FEBII", "ACCUMIULr" ,"FFIULII", "IUL09", "LB201701", "Super201701"];	
	var testCases = [];
	var displayCases = function(data){
		console.log(data);
		//data is from json
		//display cases from api
	};
	//public
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
			var data = {};
			var jsonString = JSON.stringify(data);

			Utility.AjaxCall(url,jsonString,'GET',displayCases);
		});	
	};
	return {
		loadProducts : loadProducts
	};
})();

var Utility = (function(){
	
	var AjaxCall = function(url, data, type, callback){
		console.log("Calling AJAX");
		$.ajax({
			contentType : 'application/json; charset=utf-8',
			url : url,
			type: type,
			data : "",
			dataType: 'jsonp',
			crossDomain: true,
			success : function(d){
				console.log(d.data);
				if(callback != null){
					//callback(d);
				}else{
					//do something with data
					
				}
			},
		});
	};
	
	return {
		AjaxCall: AjaxCall
		
	}
})();

