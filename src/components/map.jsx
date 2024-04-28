import { useEffect, useRef, useState } from "react"

import Map from 'ol/Map';
import * as Proj from 'ol/proj'
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { Point } from "ol/geom";
import { Feature } from "ol";
import Style from "ol/style/Style";
import Icon from "ol/style/Icon";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Modify } from 'ol/interaction'
import axios from "axios";

const MapComponent = ({ onCange = () => { }, onSubmit = () => { }, isEnable = true, mapData }) => {
  
  
  const [enable, setEnable] = useState(isEnable)
  const [loading, setLoading] = useState(false)


  const mapElRef = useRef()

  const [LonLat, setLonLat] = useState([])

  const [mapTarget, setMapTarget] = useState(null)
  const [resultSearch, setResultSearch] = useState([])

  const [searchValue, setSearchValue] = useState("")

  const timeOutRef = useRef(null)
  const [markerVectorLayer, setMarkerVectorLayer] = useState(null)
  const [modifyInteraction, setModifyInteraction] = useState(null)


  const makeInterActionModify = (vectorLayer, vectorSource, map) => {

    const modify = new Modify({
      hitDetection: vectorLayer,
      source: vectorSource,
    });
    modify.on(['modifystart', 'modifyend'], function (evt) {
      mapElRef.current.style.cursor = evt.type === 'modifystart' ? 'grabbing' : 'move';
    });
    modify.on(['modifyend'], function (evt) {
      setLonLat(Proj.toLonLat(evt.mapBrowserEvent.coordinate))
    })
    const overlaySource = modify.getOverlay().getSource();
    overlaySource.on(['addfeature', 'removefeature'], function (evt) {
      mapElRef.current.style.cursor = evt.type === 'addfeature' ? 'move' : 'pointer';

    });
    map.addInteraction(modify);
    return modify
  }

  const createIconSrc = (pos) => {
    const iconFeature = new Feature({
      geometry: new Point(pos),
      name: 'Null Island',
      population: 4000,
      rainfall: 500,
    });
    iconFeature.setStyle(new Style({
      image: new Icon({
        anchor: [0.49, 30],
        anchorXUnits: 'fraction',
        anchorYUnits: 'pixels',
        src: mapData.selector_icon || '/images/location.svg',
      }),
    }));

    const vectorSource = new VectorSource({
      features: [iconFeature],
    });
    return vectorSource
  }

  const successCallback = (position) => {
    setLonLat([position.coords.longitude, position.coords.latitude])

    modifyInteraction && mapTarget.removeInteraction(modifyInteraction)

    markerVectorLayer.getSource().clear()

    const newVectorSrc = createIconSrc(Proj.fromLonLat([position.coords.longitude, position.coords.latitude]))

    markerVectorLayer.setSource(newVectorSrc)

    let modify = makeInterActionModify(markerVectorLayer, newVectorSrc, mapTarget)

    setModifyInteraction(modify)

    mapTarget.getView().fit(newVectorSrc.getExtent(), mapTarget.getSize(), { duration: 1000 });

  };
  const errorCallback = (error) => {
    console.log(error);
  };

  const getUserLocatio = () => {
    if (enable && !loading) navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  }


  function setAddressToInput(LonLat, data) {
    const { address, display_name } = data

    const address_Input = document.querySelector(mapData.address_1) || document.querySelector(mapData.address_2)
    const cityInput = document.querySelector(mapData.city)
    const stateInput = document.querySelector(mapData.state)
    const contryInput = document.querySelector(mapData.country)
    const longitude = document.querySelector(mapData.longitude)
    const latitude = document.querySelector(mapData.latitude)

    const addressState = address.state || address.province
    const addressCity = address.county || address.city || address.town
    const addressCountry = address.country

    const moreAddress = display_name.replace(`${address.postcode},`, '').split(",").map(item => item.trim()).reverse()
    moreAddress.shift()

    if (contryInput) {
      contryInput.value = addressCountry
    }
    if (stateInput) {
      stateInput.value = addressState
    }
    if (cityInput) {
      cityInput.value = addressCity
    }
    if (address_Input) {
      address_Input.value = moreAddress.join()
    }
    if (longitude && latitude) {
      longitude.value = LonLat[0]
      latitude.value = LonLat[1]
    }

  }

  const getAddressFromLonLat = async () => {
    if (!loading && enable && LonLat.length === 2) {
      try {
        setLoading(true)
        const res = await axios.get("https://nominatim.openstreetmap.org/reverse?format=json&accept-language=fa", { params: { lon: LonLat[0], lat: LonLat[1] } })
        const onSubmitMap = new CustomEvent("onSubmitMap", { detail: { LonLat, data: res.data } });
        document.dispatchEvent(onSubmitMap);
        onSubmit({ LonLat, data: res.data })
        setAddressToInput(LonLat, res.data)
        setLoading(false)
      } catch (err) {
        setLoading(false)
        console.log(err)
      }
    }

  }

  useEffect(() => {
    if (LonLat.length === 2) {
      onCange(LonLat)
    }
  }, [LonLat])


  const searchRequest = async (query) => {

    try {
      setLoading(true)
      const res = await axios.get("https://nominatim.openstreetmap.org/search?format=json&accept-language=fa", { params: { q: query } })
      if (res.status === 200) {
        setResultSearch(res.data)
      }

      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.log(err)
    }

  }

  const handleSearch = (e) => {
    if (enable && !loading) {
      const val = e.target.value
      clearTimeout(timeOutRef.current)
      setSearchValue(val)
      if (val && val.trim() !== "" && val.trim().length > 1) {
        timeOutRef.current = setTimeout(() => searchRequest(e.target.value.trim()), 3000)
      } else {
        setResultSearch([])
      }
    }
  }
  const submitSearch = () => {
    if (enable && !loading) {
      if (searchValue && searchValue.trim() !== "" && searchValue.trim().length > 1) {
        clearTimeout(timeOutRef.current)
        searchRequest(searchValue.trim())
      }
    }
  }
  const handleClickSearch = item => {
    if (enable && !loading) {
      setResultSearch([])
      mapTarget.getView().fit(
        [
          ...Proj.fromLonLat([Number(item.boundingbox[2]), Number(item.boundingbox[0])]),
          ...Proj.fromLonLat([Number(item.boundingbox[3]), Number(item.boundingbox[1])])
        ]
        , mapTarget.getSize(), { duration: 1000 }
      );
    }

  }

  useEffect(() => {

    var pos = Proj.fromLonLat([55.241549, 32.331514]);


    var layer = new TileLayer({
      source: new XYZ({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
      })
    });

    var map = new Map({
      layers: [layer],
      target: mapElRef.current,
      view: new View({
        center: pos,
        zoom: 5,
        showFullExtent: true,
        maxZoom: 18
      })
    });

    setMapTarget(map)

    if (enable) {
      const vectorSource = createIconSrc(pos)
      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });
      setMarkerVectorLayer(vectorLayer)
      map.addLayer(vectorLayer)

      let modify = makeInterActionModify(vectorLayer, vectorSource, map)


      map.on('click', function (evt) {

        map.removeInteraction(modify)

        vectorLayer.getSource().clear()

        const newVectorSrc = createIconSrc(evt.coordinate)

        vectorLayer.setSource(newVectorSrc)

        modify = makeInterActionModify(vectorLayer, newVectorSrc, map)
        setLonLat(Proj.toLonLat(evt.coordinate))

      });
    }

    // set icons
    const olZoomIn = map.targetElement_.querySelector(".ol-zoom-in")
    const olZoomOut = map.targetElement_.querySelector(".ol-zoom-out")
    const olRotateReset = map.targetElement_.querySelector(".ol-rotate-reset .ol-compass")

    if (mapData.rotate_icon && olRotateReset) {
      olRotateReset.innerHTML = `<img src="${mapData.rotate_icon}"/>`
    }
    if (mapData.zoom_out_icon && olZoomOut) {
      olZoomOut.innerHTML = `<img src="${mapData.zoom_out_icon}"/>`
    }
    if (mapData.zoom_in_icon && olZoomIn) {
      olZoomIn.innerHTML = `<img src="${mapData.zoom_in_icon}"/>`
    }
    if (mapData.map_color) {
      map.targetElement_.querySelectorAll(".ol-control button").forEach(control_button => {
        control_button.style.backgroundColor = mapData.map_color + "88"
      });
    }
  }, [])


  return (
    <div className={`p-4 w-full relative rounded-lg ${!enable ? "opacity-80 pointer-events-none [&_*]:!pointer-events-none" : ""}`}>
      <div className="w-full shadow p-2 relative rounded-md mb-1 flex">
        <input onChange={handleSearch} value={searchValue} type="text" placeholder={mapData.search_placeholder || "جست جو..."} className="flex-1 bg-transparent" />
        <button onClick={submitSearch} type="button" style={mapData.map_color ? { backgroundColor: mapData.map_color } : {}} className="bg-darkBlue p-1 rounded ">
          {mapData.my_location_icon ?
            <img src={mapData.search_icon} /> :
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M19.8105 18.9119L14.6468 13.8308C15.999 12.3616 16.8298 10.4187 16.8298 8.28068C16.8292 3.7071 13.0621 0 8.41471 0C3.76737 0 0.000244141 3.7071 0.000244141 8.28068C0.000244141 12.8543 3.76737 16.5614 8.41471 16.5614C10.4227 16.5614 12.2644 15.8668 13.711 14.7122L18.8947 19.8134C19.1473 20.0622 19.5573 20.0622 19.8099 19.8134C19.87 19.7547 19.9177 19.6846 19.9503 19.6072C19.983 19.5299 19.9998 19.4467 19.9998 19.3628C19.9999 19.2788 19.9832 19.1957 19.9507 19.1182C19.9181 19.0408 19.8705 18.9707 19.8105 18.9119ZM8.41471 15.2873C4.48256 15.2873 1.29493 12.1504 1.29493 8.28068C1.29493 4.41101 4.48256 1.27403 8.41471 1.27403C12.3469 1.27403 15.5345 4.41101 15.5345 8.28068C15.5345 12.1504 12.3469 15.2873 8.41471 15.2873Z" fill="#FFFFFF" />
            </svg>
          }
        </button>
        <div className={`absolute z-30 w-full p-2 top-full translate-y-1 shadow rounded-lg bg-white h-max right-0 overflow-hidden transition-all origin-top ${resultSearch.length > 0 ? "scale-y-100 visible pointer-events-auto" : "invisible pointer-events-none scale-y-0"}`}>
          <ul className="overflow-y-auto max-h-52 p-1">
            {resultSearch.map((item) => {
              return (
                <li key={item.place_id} onClick={() => handleClickSearch(item)} className="border border-gray/50 p-2 my-1 rounded-lg cursor-pointer">
                  <h6 className="text-darkBlue">{item.name}</h6>
                  <small className="text-gray">{item.display_name}</small>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
      <div ref={mapElRef} id="map" className="w-full relative [&_.ol-control]:w-max [&_.ol-control_button]:w-6 [&_.ol-control_button]:m-1 [&_.ol-control_button]:h-6 [&_.ol-control_button]:rounded-md [&_.ol-control_button]:text-white [&_.ol-control_button]:bg-darkBlue/50 rounded-xl overflow-hidden h-[35vh] cursor-pointer">
        {loading ? <div className="absolute w-full h-full z-40 top-0 right-0 flex items-center justify-center bg-white/80 rounded-xl">
          <span className="loader"></span>
        </div> : null}
        <button onClick={getUserLocatio} style={mapData.map_color ? { backgroundColor: mapData.map_color + "bb" } : {}} type="button" className="absolute flex items-center justify-center cursor-pointer w-9 h-9 left-2 bottom-2 z-20 p-1 rounded-md bg-darkBlue/80">
          {mapData.my_location_icon ?
            <img src={mapData.my_location_icon} />
            :
            <svg stroke="currentColor" fill="#fff" strokeWidth="0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path></svg>
          }

        </button>
      </div>
      <div className="my-5">
        <button disabled={LonLat.length !== 2} onClick={getAddressFromLonLat} style={mapData.submit_button_color ? { backgroundColor: mapData.submit_button_color } : {}} className={`p-2 bg-green text-white rounded-md cursor-pointer ${LonLat.length !== 2 ? "cursor-auto opacity-60" : ""}`} type="button">{mapData.submit_button_text || "تایید | تبدیل به آدرس"}</button>
      </div>
    </div>
  )
}
export default MapComponent