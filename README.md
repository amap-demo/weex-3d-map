# Weex 高德地图组件扩展
## Android 之 WXMapViewComponent
0. 高德地图配置 gradle dependencies 中添加地图的依赖：
	* compile 'com.amap.api:map3d-native:latest.integration'
	* compile 'com.amap.api:map3d:latest.integration'
0. WXApplication 中添加插件注册
	* WXSDKEngine.registerComponent("mapview", WXMapViewComponent.class);

## iOS 之 WXMapViewComponent
0. 高德地图配置 Podfile中添加地图的依赖：
	* pod 'AMap3DMap'
0. AppDelegate 中添加插件注册
	* [WXSDKEngine registerComponent:@"mapview" withClass:NSClassFromString(@"WXMapViewComponent")];
	
## Weex 配置
0. 添加mapview_demo.we文件，具体内容：
>		<template>
>	 	<mapview style="width: 750;"></mapView>
>	 	</template>

0. index.we 中添加地图项：
	* {name: 'component/mapview-demo', title: 'MapView'},

# Weex 介绍及安装
> Weex具体介绍及安装请参见 [Weex 官方地址](https://github.com/alibaba/weex)
