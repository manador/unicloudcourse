'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)

	/* 
	//传递的参数
	{
		data:{
			image:XXXXX
		}
	} 
	*/
   
	var image = event.image;
	
	// var res = await uni.request({
	// 	url:"https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=5HDVku5jVWeFKEWFLmX7oTWB&client_secret=TqcuKWrKTUuWpqDTAM6xgGPCbzdkpX0e"
	// })
	
	var auth_res =  await uniCloud.httpclient.request("https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=5HDVku5jVWeFKEWFLmX7oTWB&client_secret=TqcuKWrKTUuWpqDTAM6xgGPCbzdkpX0e",{
		dataType:"json"
	})
	
	// console.log(res);
	
	var access_token = auth_res.data.access_token;
	
	var classify_res = await uniCloud.httpclient.request("https://aip.baidubce.com/rest/2.0/image-classify/v2/advanced_general",{
		header:{
			"Content-Type":"application/x-www-form-urlencoded"
		},
		method:"POST",
		data:{
			access_token:access_token,
			image:image
		},
		dataType:"json"
	})
	
	//返回数据给客户端
	return classify_res.data;
};
