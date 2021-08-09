var mapOptions = {
    center: new naver.maps.LatLng(37.3595704, 127.105399),
    zoom: 10
};
var map = new naver.maps.Map('map', mapOptions);

$.ajax({
    url: "/location",
    type: "GET",
}).done((response) => {
    if (response.message !=="success") return;
    const data = response.data;

    
var markerList = [];
var infowindowList= [];

for (var i in data) {
    var target = data[i];
    var latlng = new naver.maps.LatLng(target.lat,target.lng);
    marker = new naver.maps.Marker({
        map: map,
        position: latlng, 
        icon : {
            content: "<div class='marker'></div>",
            anchor: new naver.maps.Point(9,9)
        },
    });

    var content = `<div class='infowindow_wrap'>
        <div class='infowindow_title'>${target.title}</div>
        <div class='infowindow_content'>${target.address}</div>
    </div>`

    var infowindow = new naver.maps.InfoWindow({
        content: content, 
        backgroundColor: "#00ff0000",
        borderColor: "#00ff0000",
        anchorSize: new naver.maps.Size(0,0),
    })

    markerList.push(marker);
    infowindowList.push(infowindow);
}

for (var i = 0, ii=markerList.length; i<ii; i++) {
    naver.maps.Event.addListener(map, "click", ClickMap(i));
    naver.maps.Event.addListener(markerList[i], "click", getClickHandler(i));

}

function ClickMap(i) {
    return function() {
        var infowindow = infowindowList[i];
        infowindow.close()
    }
}

function getClickHandler(i) {
    return function() {
        var marker = markerList[i];
        var infowindow = infowindowList[i];
        if (infowindow.getMap()) {
            infowindow.close();
        } else {
            infowindow.open(map, marker)
        }
    }
} 
const cluster1 = {
    content: `<div class="cluster1"></div>`
};

const cluster2 = {
    content: `<div class="cluster2"></div>`
};

const cluster3 = {
    content: '<div class="cluster3"></div>'
};

const markerClustering = new MarkerClustering({
    minClusterSize: 2,
    maxZoom: 12, 
    map: map, 
    markers: markerList,
    disableClickZoom: false, 
    gridSize: 20, 
    icons:[cluster1, cluster2, cluster3], 
    indexGernerator: [2,5,10], 
    stylingFunction: (clusterMarker, count) => {
        $(clusterMarker.getElement()).find("div:first-child").text(count)
    }
});



});

let ps = new kakao.maps.services.Places();
let search_arr = []
let latlng_arr = []

$("#search_input").on("keydown",function(e){
    if(e.keyCode === 13){
        let content = $(this).val();
        ps.keywordSearch(content, placeSearchCB)
    }
})

$("#search_button").on("click", function(e){
    let content = $("#search_input").val() 
    ps.keywordSearch(content, placeSearchCB);
})

var markerList = [];
var infowindowList= [];

function placeSearchCB(data, status, pagination){
    if(status === kakao.maps.services.Status.OK){
        let listE1 = document.getElementById("placesList");
        
        removeMarker();
        removeAllChildNodes(listE1);

        for (let i = 0; i<data.length;i++){
            let target = data[i]
            const lat = target.y;
            const lng = target.x;
            const place_name = target["place_name"];
            const address_name = target["address_name"];
            const latlng = new naver.maps.LatLng(lat, lng)
            marker = new naver.maps.Marker({
                position: latlng,
                map: map
            })
            
            var content = `<div class='infowindow_wrap'>
                <div class='infowindow_title'>${target["place_name"]}</div>
                <div class='infowindow_address'>${target["address_name"]}</div>
            </div>`

            var infowindow = new naver.maps.InfoWindow({
                content: content, 
                backgroundColor: "#00ff0000",
                borderColor: "#00ff0000", 
                anchorSize: new naver.maps.Size(0,0),
            })

            markerList.push(marker);
            infowindowList.push(infowindow);

            search_arr.push(marker)
            latlng_arr.push(latlng)

            const el = document.createElement("div");
            const itemStr=`
                <div class="info">
                    <div class ="info_title">
                        ${place_name}
                    </div>
                    </span>${address_name}</span>
                </div>
            `;
            
            el.innerHTML=itemStr;
            el.className="item";
            el.onclick = getClickHandler(i)
            listE1.appendChild(el);
        }
        map.setZoom(14,false);
        map.panTo(latlng_arr[0])
        for (var i =0, ii=markerList.length; i<ii; i++) {
            naver.maps.Event.addListener(markerList[i], "click", getClickHandler(i));
            naver.maps.Event.addListener(map, "click", ClickMap(i));
            
        }
    }else{
        alert("검색결과가 없습니다.")
    }
}

function getClickHandler(i) {
    return function() {
        var marker = markerList[i];
        var infowindow = infowindowList[i];
        if (infowindow.getMap()) {
            infowindow.close();
        } else {
            infowindow.open(map, marker)
        }
    }
} 

function ClickMap(i) {
    return function() {
        var infowindow = infowindowList[i];
        infowindow.close()
    }
}

function removeMarker(){
    for(let i = 0; i< search_arr.length; i++) {
        search_arr[i].setMap(null);
    }
    search_arr = [];
    latlng_arr = [];
}

function removeAllChildNodes(el) {
    while(el.hasChildNodes()){
        el.removeChild(el.lastChild);
    }
}
let currentUse = true;

    $("#current").click(() => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latlng = new naver.maps.LatLng(lat, lng);
          if (currentUse) {
            marker = new naver.maps.Marker({
              map: map,
              position: latlng,
              icon : {
                content:
                  '<img class="pulse" draggable="false" unselectable="on" src="https://myfirstmap.s3.ap-northeast-2.amazonaws.com/circle.png">',
                anchor: new naver.maps.Point(11, 11),
              },
            });
            currentUse = false;
          }
          map.setZoom(14, false);
          map.panTo(latlng);
        });
      } else {
        alert("위치정보 사용 불가능");
      }
    });

