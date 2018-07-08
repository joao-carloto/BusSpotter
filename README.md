# BusSpotter
Mobile app for bus identification based on the onboard Wi-Fi hotspot MAC Address (proof of concept) 


WHAT IS BUS SPOTTER?

Identifying an approaching bus and knowing which route it's operating on, is one of the daily challenges of visually impaired people.
Frequently, a blind person will have to stand up, making himself visible to the bus driver and make the bus stop, only to get informed that it's not the bus operating on the route that he needs.
On rainy days, it will also mean that he will have to stand in a position away from shelter.

The dissemination of Wi-Fi hotspots, inside public transportation, offers an opportunity for the identification of an approaching vehicle, without having visual information and using an infrastructure that is already in place.
A Wi-Fi network will publicize 2 pieces of information that can be translated in a useful manner, without the need of actually connection to the network.
- Name of the network (SSID): translates to the bus company to which the vehicle belongs to.
- MAC address of the Wi-Fi device (BSSID): translates to a specific vehicle.

The only piece of missing information is the specific bus route that the vehicle is operating on the current day and hour. We imagine that such information might be available, since some BUS companies already have a real-time GPS bus location system. Such systems feed existing mobile apps that will tell the user the wait time for a specific bus on a given bus stop. The necessary changes, on the server side, would be to add the information that correlates a specific MAC address/vehicle to the bus route that it's currently serving.

So why not just use the GPS tracking system that is already in place?
On the GPS tracking system, the info is periodically transmitted from the BUS to the server. The server will then update some web service that will provide info to the mobile apps upon request. All of this implies some lag time, however short it might be, it might be relevant to someone that needs the confirmation of the actual physical presence of the vehicle.
MAC address info relies upon direct information transmission from the vehicle to the user cell phone. Also, this does not imply that the user has internet connectivity on the street, since the relevant MAC Address and Bus route mapping might have been previously downloaded, before the user left his work place or home.
Ideally the 2 systems would work together on a single mobile app, relying on the same web service. This would bring both the benefits of anticipation and direct physical detection.

The current version of the app is just a proof of concept, but has been tested on the city of Porto (Portugal). It was configured to detect the SSID of the main public transport provider (STCP). 
The results indicate that buses can be detected at a reasonable distance. Sometimes at distance where it was not yet possible visually identify the number of the route. 
The limitations found are related to the Wi-Fi signal being blocked by buildings or other obstacles. This is an issue that also affects people trying to visually identify the vehicle, leaving blind people and regular users on a similar situation.


HOW TO USE BUS SPOTTER?

Turn on the app and immediately it will start trying to identify buses based on the surrounding Wi-Fi networks.
All new relevant information will be advertised by audio.
If the user wants the information repeated, he just has to do a long tap on the app window (more than 0.75 seconds)
On new information, the cell phone will also vibrate, but this will only happen if the user has already tapped once on the app window (limitation enforced by the Android system).
If more than 1 bus is detected, they will be advertised by the decreasing order of the Wi-Fi signal strength. This assumes that the nearest bus is the one with the strongest signal, which might not be always true, since other factors might be relevant.

<a href="https://imgur.com/HydcqWc"><img src="http://i.imgur.com/HydcqWc.png" title="source: imgur.com" /></a>


IMPLEMENTATION NOTES

This proof of concept is implemented using the <a href="https://cordova.apache.org/">Cordova</a> framework. This means the code you'll find here is just a few lines of JavaScript and html. The most relevant code is at www\js\index.js, you an check the comments to get an idea on how this works.

For now, the app is only available in a version for the Android operating system. iOS (iPhone) has limitations on the API that gives access to the WiFi information, those limitations would imply some additional coding in Objective C. For more information on this you may check the link <a href="https://developer.apple.com/library/archive/qa/qa1942/_index.html">here</a>.

When the app is turned on, it will retrieve bus route and MAC Address information from the internet, using the google sheets API. This info is being read from a specific Google sheets document. The document in the code example has only read permissions for the general public, so you might want to create your own document and update the API URL acordingly.

<a href="https://imgur.com/rJTijJj"><img src="https://i.imgur.com/rJTijJj.png" title="source: imgur.com" /></a>

<blockquote class="imgur-embed-pub" lang="en" data-id="a/k4zeKPk"><a href="//imgur.com/k4zeKPk"></a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

The bus route information is stored as cache file, so the user can download the info at home or work place and use the app on the street without network connectivity.
Alternatively, if the app can't read from the web service and has no cached info, it will use some hard coded values at the bus_allocation.js file. You might want to edit those too.

The app will also advertise the presence of buses from specific bus companies, based on the network name (SSID). This configuration is not coming from the internet but hard coded at index.js.

