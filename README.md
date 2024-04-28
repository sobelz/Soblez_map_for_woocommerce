# Soblez map for woocommerce
![Algorithm schema](./public/Screenshot.png)

## Description
This is a small program to create the ability to select a location and automatically convert it to the user's exact address, which can be used easily in any way and in any larger program.

## Used packages
* [React.js](https://react.dev/) @18.2.0
* [ol (OpenLayers)](https://openlayers.org/) @8.1.0
* [axios](https://axios-http.com/) @1.6.0
* [tailwindcss](https://tailwindcss.com/) @3.3.3

We also used [openstreetmap](https://nominatim.openstreetmap.org/) api to get the selected address using geolocation and also get user search results

## How to use this
#### You can clone this repository and run the following commands
In the first step, install all the packages (requires NodeJS):
```
$ npm install
```

For preview:
```
$ npm run dev
```

Build from project and production mode:
```
$ npm run build
```

### After building the project, you need to do some things
In the dist/assets path, there is a javascript file and a css file that you need to enter in the page where you want to use this project.
Then you must have a tag with the ID: MapWrapper in your html page so that all the events in this tag take place.
``` html
<div id="MapWrapper"></div>
```

Also, a tag is needed to receive settings in json format. which must have the ID: data-map
``` html
<pre id="data-map" style="display: none;">
    {
      "my_location_icon": "https:\/\/test.sobelz.ir\/wp-content\/uploads\/2024\/01\/sobelz_map_selector_my_location-13.png",
      "rotate_icon": "https:\/\/test.sobelz.ir\/wp-content\/uploads\/2024\/02\/sobelz_map_selector_rotate.png",
      "search_icon": "https:\/\/test.sobelz.ir\/wp-content\/uploads\/2024\/01\/sobelz_map_selector_search.png",
      "selector_icon": "https:\/\/test.sobelz.ir\/wp-content\/uploads\/2024\/01\/sobelz_map_selector_selector.svg",
      "zoom_in_icon": "https:\/\/test.sobelz.ir\/wp-content\/uploads\/2024\/02\/sobelz_map_selector_zoom_in.png",
      "zoom_out_icon": "https:\/\/test.sobelz.ir\/wp-content\/uploads\/2024\/02\/sobelz_map_selector_zoom_out.png",
      "country": "#billing_country",
      "state": "#billing_state",
      "city": "#billing_city",
      "address_1": "#billing_address_1",
      "address_2": "#billing_address_2",
      "latitude": "#billing_latitude",
      "longitude": "#billing_longitude",
      "search_placeholder": "\u062c\u0633\u062a \u062c\u0648...",
      "submit_button_text": "\u062a\u0627\u06cc\u06cc\u062f | \u062a\u0628\u062f\u06cc\u0644 \u0628\u0647 \u0622\u062f\u0631\u0633",
      "map_color": "#02031d",
      "submit_button_color": "#00e099",
      "display_checkout": "1"
  }
</pre>
```
After submitting, an event is also called, which you can listen to and use its information in the following way.
```javascript
document.addEventListener("onSubmitMap",data=>{
    console.log(data.detail)
    // or your logic
})
```
