import MapComponent from "./components/map"

const mapdataTag = document.getElementById("data-map")||{}

// for JSON validation inner #map-data tag
function isJsonString(str) {
    let JsonData;
    try {
        JsonData= JSON.parse(str)
    } catch (e) {
        return false;
    }
    return JsonData;
}

const mapData =isJsonString(mapdataTag.innerHTML)

const App = () => {
    if(mapdataTag && mapData){
        return (
            <MapComponent mapData={mapData}/>
        )
    }else{
        return null
    }
}
export default App
