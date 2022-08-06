<template>
	<view class="content">
		<button type="primary" @click="btnTakephote">
			<!-- #ifdef H5 -->
			PC选择一张图片
			<!-- #endif -->
			<!-- #ifdef MP-WEIXIN -->
			微信选择一张图片
			<!-- #endif -->
			<!-- #ifdef APP -->
			APP选择一张图片
			<!-- #endif -->
		</button>
		<image :src="imagepath" mode="widthFix" style="width: 100%;"></image>
		<view style="text-align: center;width: 100%;color: aqua;font-size: 18px;">{{keyword}}</view>
		<view v-if="searchResults">
			<view v-if="searchResults.matched" style="color: green;font-size: 24px;">{{searchResults.matched.typename}}</view>
			<view v-else style="font-size: 14px;">
				<view v-for="( item,index) in searchResults.similars" style="display: flex;">
					<view style="flex: 1;">{{item.keywords}}</view>
					<view>{{item.typename}}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				imagepath:"",
				keyword:"",
				searchResults:null
			}
		},
		onLoad() {

		},
		methods: {
			// 实现一个横跨三端（iOS、Android、微信小程序）的牌照识别垃圾分类应用
			// 1、从手机相册获得一张照片
			btnTakephote(){
				this.keyword = "";
				this.searchResults = null;
				
				uni.chooseImage({
					count:1,
					success: (res) => {
						console.log(res);
						this.imagepath = res.tempFilePaths[0];
						this.image2base64(this.imagepath);
					}
				})
			},
			// 2、将照片显示在应用中，并转为Base64的格式
			image2base64(path){
				console.log(typeof path);
				// #ifdef H5
				var blob = new Blob([path],{
					type:"image/jpeg"
				});
				console.log('blob',blob);
				const fileReader = new FileReader();
				fileReader.onLoad = (e) => {
					console.log('s',e.target.result);
				};
				
				fileReader.readAsDataURL(blob);
				
				fileReader.onerror= (e) => {
					console.log(e);
				};
				// var b64 = path;
				// this.imageClassify(b64);
				// #endif
				
				// #ifdef MP-WEIXIN
				uni.getFileSystemManager().readFile({
					filePath:path,
					encoding:"base64",
					success: (res) => {
						console.log(res);
						var b64 = res.data;
						this.imageClassify(b64);
					}
				})
				// #endif
				
				// #ifdef APP 
				plus.io.resolveLocalFileSystemURL(
					path,
					(entry)=>{
						var reader = null;
						entry.file( ( file ) => {
							reader = new plus.io.FileReader();
							reader.onloadend = ( e ) => {
								// console.log( "Read success" );
								// console.log( e.target.result );
								var b64 = e.target.result.substr(22);
								this.imageClassify(b64);
							};
							reader.readAsDataURL( file );
						}, ( e ) => {
							alert( e.message );
						} );
					}
				)
				// #endif
			},
			// 3、调用图像识别的API来识别图像主体内容
			async imageClassify(b64){
				console.log(b64);
				uniCloud.callFunction({
					name:"ImageClassify",
					data:{
						image:b64
					},
					success: (res) => {
						// console.log(res.result);
						this.parseResults(res.result.result);
					}
				})
			},
			parseResults(result){
				console.log(result);
				var itemList = [];
				
				// {keyword,score,root}
				for (var i = 0; i<result.length; i++) {
					itemList.push(result[i].keyword+'|'+result[i].score.toString());
				}
				
				console.log(itemList);
				uni.showActionSheet({
					itemList:itemList,
					success: (res) => {
						console.log(res);
						this.searchKeword(result[res.tapIndex].keyword);
					}
				})
			},
			// 4、将识别到的图像主体内容用户查询垃圾分类接口
			searchKeword(kw){
				this.keyword = kw;
				
				uniCloud.callFunction({
					name:"TrashClassify",
					data:{
						keyword:kw
					},
					success: (res) => {
						console.log(res.result);
						this.searchResults = res.result;
					}
				});
			}
			// 5、发布横跨三端（iOS、Android、微信小程序）的应用包
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
