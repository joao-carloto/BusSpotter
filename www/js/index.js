// URL of the Google API, wich retreives data from a Google sheet document
// Replace with your own API URL and take in consideration your specific data format
// In the example, the request only reads data cells A2 to D11
var testApiUrl = "https://sheets.googleapis.com/v4/spreadsheets/1f7ju8z0Fl2p9xPTiGKQTVjo5mPo3HZiF5IxVxnj-68c/values/A2:G11?key=AIzaSyDjKzelPsSzQ7PnkiehtYb3auMw2wAMi4A";

var busAllocation;

$(document).ready(function () {
    document.addEventListener("deviceready", onDeviceReady, false);
});

function onDeviceReady() {
    // Will read out loud whatever text is on screen,
    // if we do a tap and hold for over 0.75 secs, anywhere on the app window
    $(document).bind("taphold", sayWhatIsOnScreen);

    // Get bus data from the test web API and store it as a cache file
    // TO DO request update on other ocasions, not only startup
    $.getJSON(testApiUrl)
        .done(function (json) {
            console.log("Bus allocation successfully retrieved from web API: " + JSON.stringify(json));
            busAllocation = json;
            // Cache file is created with data from web API, for future offline usage
            window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function (dir) {
                dir.getFile("bus_allocation_cache.js", { create: true, exclusive: false }, function (file) {
                    file.createWriter(function (fileWriter) {
                        fileWriter.write(busAllocation);
                    }, function (e) { console.error(e); });
                });
            });
        })
        // If it fails (e.g. no internet connectivity) read the existing cache file and use that data
        // TO DO make some cache data validation, namely if it covers the current date
        .fail(function (jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log("Bus allocation request failed: " + err);

            window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function (dir) {
                dir.getFile("bus_allocation_cache.js", { create: false },
                    function (file) {
                        readCacheFile(file);
                    },
                    // If it fails reading the cache file (e.g. first usage) use the hard coded values
                    // Only makes sense for testing purposes
                    // On a real scenario it would be voicing some error warning
                    function (e) {
                        console.log("Opening the cache file failed: " + e);
                        console.log("Using the hard coded data: " + hardCodedBusAllocation);
                        busAllocation = hardCodedBusAllocation;
                    });
            });
        });

    // Warning that the app is up and running
    var startString = "A detectar autocarros.";
    $('#output').html(startString);
    TTS.speak({
        text: startString,
        locale: 'pt-PT'
    });
    findBuses();
}

function sayWhatIsOnScreen(event) {
    TTS.speak({
        text: $('#output').html().replace(/<(?:.|\n)*?>/gm, ''),
        locale: 'pt-PT'
    });
}

function findBuses() {
    WifiWizard2.scan()
        .then(
        function (scanResult) {
            scanResult.sort(WiFiLevelSort);
            // console.log(scanResult);
            identifyBuses(scanResult, busAllocation.values);
        })
        .catch(function (e) {
            console.log(e);
        });
}

function identifyBuses(scanResult, busAllocation) {
    var nearBuses = [];

    scanResult.forEach(function (network) {
        busAllocation.forEach(function (bus) {
            // We identify the approaching veicle using the WiFi access point MAC address 
            // We confirm if it is bus operating on specific line within a given time frame
            if (network.BSSID === bus[1] && nowIsInsideTimeFrame(bus[4], bus[5])) {
                nearBuses.push(bus[2] + " " + bus[3]);
            }
            // We cannot identify the BUS but we check if it's from a known bus operator
            // and advertise it if it's the case
            // This should be the first valiation on real scenario so to make the code more efficient
            // It's only in this way so we can use any sort of acccess point for testing purposes
            else if (JSON.stringify(network.SSID).indexOf("STCP | PortoDigital") >= 0) {
                nearBuses.push("dos S T C P");
            }
            else if (JSON.stringify(network.SSID).indexOf("Coimbra +") >= 0) {
                nearBuses.push("dos S M T U C");
            }
        });
    });

    // Build the text that will advertise the relevant information
    var alertString;
    if (nearBuses.length === 0) {
        alertString = "Nenhum autocarro identificado. <br>Continuamos a procurar.";
    } else {
        alertString = "Autocarro: " + nearBuses[0].replace(/\.|\-/gm, '') + ". ";
        for (var i = 1; i < nearBuses.length; i++) {
            alertString += "<br><br>Mais distante: " + nearBuses[i].replace(/\.|\-/gm, '') + ". ";
        }
    }

    // Only voice the information if it's different forom what's already on screen
    if (alertString != $('#output').html()) {
        // Vibration wil only work if we already did some tap on the app window
        // This is an Android limitation
        navigator.vibrate(500);
        $('#output').html(alertString);
        TTS.speak({
            text: alertString.replace(/<(?:.|\n)*?>/gm, ''),
            locale: 'pt-PT'
        });
    }
    // Loops on forever
    findBuses();
}

// Networks are sorted according to signal strength
// We assume that all buses have installed the same model of WiFi device
// We asume that there are no relevant obstacles to the signal (may not be true)
// We assume that the only factor afecting signal strenght is distance
function WiFiLevelSort(a, b) {
    return (b.level - a.level);
}

// Checks if the current date and time is inside the validity time frame of the bus information 
function nowIsInsideTimeFrame(validFromStr, validToStr) {
    var currentDateTime = new Date();
    var validFromdate = new Date(validFromStr);
    var validTodate = new Date(validToStr);

    if (currentDateTime < validFromdate || currentDateTime > validTodate) {
        return false;
    }
    else {
        return true;
    }
}

function readCacheFile(fileEntry) {
    fileEntry.file(function (file) {
        var reader = new FileReader();
        reader.onloadend = function () {
            console.log("Successful cache file read: " + this.result);
            busAllocation = JSON.parse(this.result);
        };
        reader.readAsText(file);
    }, function (e) {
        console.log("Read cache file fail: " + e);
    });
}