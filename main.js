
import './style.css';
import { Map, Overlay, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

// geoserver에서 WFS 방식으로 가져오기 위해
import { Vector as VectorLayer } from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import { GeoJSON } from 'ol/format';
import { Style } from 'ol/style';
import { Circle } from 'ol/style';
import { Stroke } from 'ol/style';
import { Fill } from 'ol/style';
// hover 관련 작동을 위해
import { Select, defaults } from 'ol/interaction';
import { pointerMove, click } from 'ol/events/condition';
// (popup 관련 작동을 위해)
import {toLonLat} from 'ol/proj.js';
import {toStringHDMS} from 'ol/coordinate.js';


// url을 변수로 빼서 따로 설정해 줘도 됨
const g_url = "http://localhost:42888";

var wfsLayer;
var wfsSource;

// CQL 필터 만드는 함수 추가
function makeFilter1(method) {
  let filter1 = "";
 
  if ('sido01' == method)
    filter1 = "donm in ('서울시', '인천시', '경기도')";
  else if ('sido02' == method)
    filter1 = "donm in ('대전시', '충청남도', '충청북도', '세종시')";
  else if ('sido03' == method)
    filter1 = "donm in ('강원도')";
  else if ('sido04' == method)
    filter1 = "donm in ('대구시', '경상북도')";
  else if ('sido05' == method)
    filter1 = "donm in ('부산시', '울산시', '경상남도')";
  else if ('sido06' == method)
    filter1 = "donm in ('전라북도')";
  else if ('sido07' == method)
    filter1 = "donm in ('전라남도', '광주시')";
  else if ('sido08' == method)
    filter1 = "donm in ('제주도')";

  for(let i=1;i<=12;i++){
    if (i < 10){
      i = '0'+i
      if ('induty'+ i == method)
        filter1 = "induty"+i+" in ('1')";
      if ('theme'+ i == method)
        filter1 = "theme"+i+" in ('1')";
    }
    else{
      if ('induty'+ i == method)
        filter1 = "induty"+i+" in ('1')";
      if ('theme'+ i == method)
        filter1 = "theme"+i+" in ('1')";
    }
  };    

  // console.log("filter1=" + filter1)
  return filter1;
}

function makeFilter() {
  
  let filter = "";

  // 각 클릭할 수 있는 것들 모두 챙겨오기(여기서 지역은 제외되었음)
  const field01 = document.getElementById("field01");
  const field02 = document.getElementById("field02");
  const field03 = document.getElementById("field03");
  const field04 = document.getElementById("field04");
  const animal01 = document.getElementById("animal01");
  const animal02 = document.getElementById("animal02");
  const animal03 = document.getElementById("animal03");
  const brazierco1 = document.getElementById("brazierco1");
  const brazierco2 = document.getElementById("brazierco2");
  const brazierco3 = document.getElementById("brazierco3");
  const gnlsiteco = document.getElementById("gnlsiteco");
  const num = document.getElementById("num");


  //운영여부에 조건이 있으면 열기 (를 붙임.
  if ((true == run01.checked) || (true == run02.checked)) {

    filter += "(";
  }
  if (true == run01.checked) {
    filter = filter + "managestatus='운영'"
  }
  if (true == run02.checked) {
    if (filter.charAt(filter.length - 1) != '(')
      filter += " or "
    filter = filter + "managestatus='휴장'"
  }
  // 운영여부에 조건이 있으면 닫기 )를 붙임
  if ((true == run01.checked) || (true == run02.checked))
    filter += ")"



  // 운영시설에 조건이 있으면 열기 (를 붙임.
  if ((true == field01.checked) || (true == field02.checked) || (true == field03.checked) || (true == field04.checked)){
    if (0 < filter.length)
      filter += " and "
    filter += "(";
  }
  if (true == field01.checked) {
    filter = filter + "induty01=1"
  }
  if (true == field02.checked) {
    if (filter.charAt(filter.length - 1) != '(')
      filter += " or "
    filter = filter + "induty02=1"
  }
  if (true == field03.checked) {
    if (filter.charAt(filter.length - 1) != '(')
      filter += " or "
    filter = filter + "induty03=1"
  }
  if (true == field04.checked) {
    if (filter.charAt(filter.length - 1) != '(')
      filter += " or "
    filter = filter + "induty04=1"
  }
  // 운영시설에 조건이 있으면 닫기 )를 붙임
  if ((true == field01.checked) || (true == field02.checked) || (true == field03.checked) || (true == field04.checked))
    filter += ")"




  // 애완견 동반 여부에 조건이 있으면 열기 (를 붙임.
  if ((true == animal01.checked) || (true == animal02.checked) || (true == animal03.checked)){
    if (0 < filter.length)
      filter += " and "
    filter += "(";
  }
  if (true == animal01.checked) {
    filter = filter + "animalcmgcl='가능'"
  }
  if (true == animal02.checked) {
    if (filter.charAt(filter.length - 1) != '(')
      filter += " or "
    filter = filter + "animalcmgcl='가능(소형견)'"
  }
  if (true == animal03.checked) {
    if (filter.charAt(filter.length - 1) != '(')
      filter += " or "
    filter = filter + "animalcmgcl='불가능'"
  }
  // 애완견 동반 여부이 있으면 닫기 )를 붙임
  if ((true == animal01.checked) || (true == animal02.checked) || (true == animal03.checked)){
    filter += ")"
  }


  // 조리대 여부에 조건이 있으면 열기 (를 붙임.
  if ((true == brazierco1.checked) || (true == brazierco2.checked) || (true == brazierco3.checked)){
    if (0 < filter.length)
      filter += " and "
    filter += "(";
  }
  if (true == brazierco1.checked) {
    filter = filter + "brazierco='개별'"
  }
  if (true == brazierco2.checked) {
    if (filter.charAt(filter.length - 1) != '(')
      filter += " or "
    filter = filter + "brazierco='공동취사장'"
  }
  if (true == brazierco3.checked) {
    if (filter.charAt(filter.length - 1) != '(')
      filter += " or "
    filter = filter + "brazierco='불가능'"
  }
  // 조리대 여부 있으면 닫기 )를 붙임
  if ((true == brazierco1.checked) || (true == brazierco2.checked) || (true == brazierco3.checked)){
    filter += ")"
  }

  if ((true == gnlsiteco.checked)){
    if (0 < filter.length)
      filter += " and "
    filter += "(";
  }
  if (true == gnlsiteco.checked) {
    filter = filter + "gnlsiteco <" + num
  }
  
  if ((true == gnlsiteco.checked)){
    filter += ")"
  }


  console.log(filter)



  return filter;
}


function makeWFSSource(method) {
  if(method == undefined){
    wfsSource = new VectorSource
    (
      {
        format: new GeoJSON(),
        url: encodeURI(g_url +"/geoserver/campWS/ows?service=WFS&version=1.0.0&request=GetFeature" +
          "&typeName=campWS:v_campinfo7&outputFormat=application/json&CQL_FILTER=" + makeFilter())
      }
    );
  }else if(makeFilter().length == 0){
    wfsSource = new VectorSource
    (
      {
        format: new GeoJSON(),
        url: encodeURI(g_url +"/geoserver/campWS/ows?service=WFS&version=1.0.0&request=GetFeature" +
          "&typeName=campWS:v_campinfo7&outputFormat=application/json&CQL_FILTER=" + makeFilter1(method))
      }
    );

  }else{
    wfsSource = new VectorSource
    (
      {
        format: new GeoJSON(),
        url: encodeURI(g_url +"/geoserver/campWS/ows?service=WFS&version=1.0.0&request=GetFeature" +
          "&typeName=campWS:v_campinfo7&outputFormat=application/json&CQL_FILTER=" + makeFilter1(method)+"and"+makeFilter())
      }
    );

  }


  if (null != wfsLayer)
    wfsLayer.setSource(wfsSource);
};

makeWFSSource("");


wfsLayer = new VectorLayer({
  source: wfsSource,
  style: new Style({
    image: new Circle({
      stroke: new Stroke({
        color: 'rgba(255, 221, 235, 1.0)',
        width: 1,
      }),
      radius: 3,
      fill: new Fill({
        color: 'rgba(250, 0, 101, 0.5)',
      })
    }),
    stroke: new Stroke({
      color: 'rgba(250, 0, 101, 1.0)',
      width: 2
    }),
    fill: new Fill({
      color: 'rgba(250, 0, 101, 0.5)'
    })
  })

});

const osmLayer = new TileLayer({
  source: new OSM()
});

const mouseHoverSelect = new Select({
  condition: pointerMove,
  style: new Style({
    image: new Circle({
      stroke: new Stroke({
        color: 'rgba(0, 221, 235, 1.0)',
        width: 5,
      }),
      radius: 3,
      fill: new Fill({
        color: 'rgba(0, 0, 101, 0.5)',
      })
    }),
    stroke: new Stroke({
      color: 'rgba(0, 0, 101, 1.0)',
      width: 2
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 101, 0.5)'
    })
  })
})

// (점 클릭 시 굵게 표시)
const mouseClickSelect = new Select({
  condition: click,
  style: new Style({
    image: new Circle({
      stroke: new Stroke({
        color: 'rgba(100, 255, 0, 1.0)',
        width: 8
      }),
      radius: 10,
      fill: new Fill({
        color: 'rgba(100, 0, 0, 1.0)'
      })
    }),
    stroke: new Stroke({
      color: 'rgba(100, 0, 255, 1.0)',
      width: 5
    }),
    fill: new Fill({
      color: 'rgba(100, 0, 255, 0.5)'
    })
  })
});

const info = document.getElementById('info');

let currentFeature;
const displayFeatureInfo = function (pixel, target) {
  const feature = target.closest('.ol-control')
    ? undefined
    : map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
  if (feature) {
    info.style.left = pixel[0] + 'px';
    info.style.top = pixel[1] + 'px';
    if (feature !== currentFeature) {
      info.style.visibility = 'visible';
      info.innerText = feature.get('facltnm');
    }
  } else {
    info.style.visibility = 'hidden';
  }
  currentFeature = feature;
};

const popup = document.getElementById('popup');

const overlay = new Overlay({
  element: popup,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

const map = new Map
  ({
    // target: document.getElementById('map'),
    target: 'map',
    layers: [osmLayer, wfsLayer,],
    overlays: [overlay],
    view: new View
      ({
        // 지도 중심점 설정
        center: [14270476, 4300535],
        // 지도 확대 레벨 설정
        zoom: 7
      }),
      interactions: defaults().extend([mouseHoverSelect, mouseClickSelect])
  });

// 각 값들의 변화가 있는지 확인 //
document.getElementById('run01').onchange = () => {
  makeWFSSource();
}
document.getElementById('run02').onchange = () => {
  makeWFSSource();
}

document.getElementById('field01').onchange = () => {
  makeWFSSource();
}
document.getElementById('field02').onchange = () => {
  makeWFSSource();
}
document.getElementById('field03').onchange = () => {
  makeWFSSource();
}
document.getElementById('field04').onchange = () => {
  makeWFSSource();
}

document.getElementById('animal01').onchange = () => {
  makeWFSSource();
}
document.getElementById('animal02').onchange = () => {
  makeWFSSource();
}
document.getElementById('animal03').onchange = () => {
  makeWFSSource();
}


document.getElementById('brazierco1').onchange = () => {
  makeWFSSource();
}
document.getElementById('brazierco2').onchange = () => {
  makeWFSSource();
}
document.getElementById('brazierco3').onchange = () => {
  makeWFSSource();
}



for(let i=1;i<=8;i++){
  if (i < 10){
    i = '0'+i
    document.getElementById('sido'+i).onclick = () => {
      console.log('sido'+i +' clicked');
      makeWFSSource('sido'+i);
    };
  }
  else{
    document.getElementById('sido'+i).onclick = () => {
      console.log('sido'+i +' clicked');
      makeWFSSource('sido'+i);
    };
  }  
}

for(let i=1;i<=4;i++){
  if (i < 10)
    i = '0'+i
    document.getElementById('induty'+i).onclick = () => {
      console.log('induty'+i +' clicked');
      makeWFSSource('induty'+i);
    };
  document.getElementById('induty'+i).onclick = () => {
    console.log('induty'+i +' clicked');
    makeWFSSource('induty'+i);
  };    
}

for(let i=1;i<=12;i++){
  if (i < 10)
    i = '0'+i
    document.getElementById('theme'+i).onclick = () => {
      console.log('theme'+i +' clicked');
      makeWFSSource('theme'+i);
    };
  document.getElementById('theme'+i).onclick = () => {
    console.log('theme'+i +' clicked');
    makeWFSSource('theme'+i);
  };    
}

document.getElementById('gnlsiteco').onchange = () => {
  makeWFSSource();
}

document.getElementById('num').onchange = () => {
  makeWFSSource();
}


map.on('pointermove', function (evt) {
  if (evt.dragging) {
    info.style.visibility = 'hidden';
    currentFeature = undefined;
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel, evt.originalEvent.target);
});

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

map.getTargetElement().addEventListener('pointerleave', function () {
  currentFeature = undefined;
  info.style.visibility = 'hidden';
});
map.on('click', (e) =>
  {
    //console.log(e);

    // 일단 창을 닫음. 이렇게 하면 자료가 없는 곳을 찍으면 창이 닫히는 효과가 나옴
    overlay.setPosition(undefined);

    // 점찍은 곳의 자료를 찾아냄. geoserver에서는 WFS를 위해 위치 정보 뿐 아니라 메타데이터도 같이 보내고 있음
    map.forEachFeatureAtPixel(e.pixel, (feature, layer) =>
    {
      // point와 같이 넘어온 메타데이터 값을 찾음
      let clickedFeatureID = feature.get('id');
      let clickedFeatureName = feature.get('facltnm');
      let firstimageurl = feature.get('firstimageurl');
      let lineintro = feature.get('lineintro');

      // 메타데이터를 오버레이 하기 위한 div에 적음
      // document.getElementById("info-title").innerHTML = clickedFeatureName;
      document.getElementById("info-title").innerHTML = "[" + clickedFeatureID + "] " + clickedFeatureName;
      document.getElementById("lineintro").innerHTML = lineintro;
      document.getElementById("firstimage").src = firstimageurl;
      document.getElementById("campinfo_link").href = "./campinfo.jsp?id=" + clickedFeatureID;

      // 오버레이 창을 띄움
      overlay.setPosition(e.coordinate);
    })
  });