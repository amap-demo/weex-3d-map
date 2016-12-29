package com.alibaba.weex.extend.component;

import android.content.Context;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.View;

import com.amap.api.maps.AMap;
import com.amap.api.maps.MapView;
import com.amap.api.maps.UiSettings;
import com.taobao.weex.WXSDKInstance;
import com.taobao.weex.dom.WXDomObject;
import com.taobao.weex.ui.component.WXComponent;
import com.taobao.weex.ui.component.WXVContainer;

/**
 * create by 2016/12/15
 *
 * @author guibao.ggb
 * @email guibao.ggb@alibaba-inc.com
 *
 */
public class WXMapViewComponent extends WXComponent {

    private MapView mMapView;
    private AMap mAMap;

    public WXMapViewComponent(WXSDKInstance instance, WXDomObject dom, WXVContainer parent, boolean isLazy) {
        super(instance, dom, parent, isLazy);
    }

    @Override
    protected View initComponentHostView(@NonNull Context context) {
        mMapView = new MapView(context);
        mMapView.onCreate(null);
        initMap();
        return mMapView;
    }

    private void initMap() {
        if (mAMap == null) {
            mAMap = mMapView.getMap();
            setUpMap();
        }
    }

    private void setUpMap() {
        UiSettings uiSettings = mAMap.getUiSettings();
        uiSettings.setScaleControlsEnabled(true);
        uiSettings.setZoomControlsEnabled(true);
        uiSettings.setCompassEnabled(true);

    }

    @Override
    public void onActivityCreate() {
        Log.e("weex", "onActivityCreate");
    }

    @Override
    public void onActivityPause() {
        mMapView.onPause();
        Log.e("weex", "onActivityPause");
    }

    @Override
    public void onActivityResume() {
        mMapView.onResume();
        Log.e("weex", "onActivityResume");
    }

    @Override
    public void onActivityDestroy() {
        mMapView.onDestroy();
        Log.e("weex", "onActivityDestroy");
    }


}
