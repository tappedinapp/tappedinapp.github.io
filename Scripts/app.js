toastr.options = {

    'tapToDismiss': true
}

var hash = window.location.hash.slice(1); // get the hash, and strip out the "#"
if (hash && hash === 'venue-request') {
    $('a[href=#' + hash + ']').trigger('click');
    //('#venue-request').modal({ show: false}).modal('show');
}



function scrollToElement(ele) {
    $(window).scrollTop(ele.offset().top).scrollLeft(ele.offset().left);
}

// MAP

var map = new google.maps.Map(document.getElementById('map-container')),
    infowindow = new google.maps.InfoWindow(),
    marker;

$.get('https://tappedin.azurewebsites.net/tappedin/GetVenuesForMap', function (venues) {

    var bounds = new google.maps.LatLngBounds();
    $.each(venues, function (i, venue) {

        marker = new google.maps.Marker({
            position: new google.maps.LatLng(venue.latitude, venue.longitude),
            map: map
        });
        bounds.extend(marker.getPosition());

        google.maps.event.addListener(marker, 'click', (function (marker) {
            return function () {

                infowindow.setContent('<div style="white-space: nowrap;">' + venue.name + '</div>' + '<div style="white-space: nowrap;">' + venue.city + ', ' + venue.state + '</div>');
                infowindow.open(map, marker);
            }
        })(marker));
    });

    map.fitBounds(bounds);
});



var top10SeenBody = '';
$.get('https://tappedin.azurewebsites.net/tappedin/GetTopBeerCounts?takeCount=10', function (beers) {

    $.each(beers, function (i, b) {

        top10SeenBody += '<tr><td>' + (i + 1) + '</td><td>' + b.breweryName + '</td><td>' + b.name + '</td><td>' + b.Count + '</td></tr>';
    });

    $('#top10-seen-tbl tbody').html(top10SeenBody);
});

var top10VenueBeerCountBody = '';
$.get('https://tappedin.azurewebsites.net/tappedin/GetTopVenueBeerCounts?takeCount=10', function (vbcs) {

    $.each(vbcs, function (i, vbc) {

        top10VenueBeerCountBody += '<tr><td>' + (i + 1) + '</td><td>' + vbc.name + '</td><td>' + vbc.city + ', ' + vbc.state + '</td><td>' + vbc.beerCount + '</td></tr>';
    });

    $('#top10-venuebeer-count-tbl tbody').html(top10VenueBeerCountBody);
});


var venueCountByState = '';
$.get('https://tappedin.azurewebsites.net/tappedin/GetVenueCountByState', function (vbcs) {

    $.each(vbcs.slice(0, 10), function (i, vbc) {

        var stateName = '';
        var state = getStateFromAbbreviation(vbc.state)[0];
        if (state)
        {
            stateName = state.name;
        }
        else
        {
            stateName = vbc.State;
        }

        venueCountByState += '<tr><td>' + (i + 1) + '</td><td>' + stateName + '</td><td>' + vbc.count + '</td></tr>';
    });

    $('#venue-count-by-state-tbl tbody').html(venueCountByState);
});



// submit venue request

var submitVenueReq = false;
$('#venue-req-form').on('submit', function (e) {

    if (!submitVenueReq) {

        submitVenueReq = true;
        e.preventDefault();
        var parms = {
            name: $('#venue-req-name').val(),
            city: $('#venue-req-city').val(),
            state: $('#venue-req-state').val(),
            postalCode: $('#venue-req-postalcode').val()
        }

        // quick hit val
        if ($.trim(parms.state) === '' || $.trim(parms.name) === '') {
            submitVenueReq = false;
            alert('Name and State are required fields.');
            return;
        }

        $.ajax({
            url: "https://tappedin.azurewebsites.net/tappedin/savevenuerequest",
            type: "POST",
            data: JSON.stringify(parms),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function () {

                submitVenueReq = false;
                $('#venue-request').modal('hide');
                alert('Success! Thank you for your request!');
            }
        });
    }
});

$('#venue-request').on('hidden.bs.modal', function () {

    // clear out inputs on hide
    $('#venue-req-name').val('');
    $('#venue-req-city').val('');
    $('#venue-req-state').val('');
    $('#venue-req-postalcode').val('');
});

// iOS check...ugly but necessary
if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    $('.modal').on('show.bs.modal', function () {
        // Position modal absolute and bump it down to the scrollPosition
        $(this)
            .css({
                position: 'absolute',
                marginTop: $(window).scrollTop() + 'px',
                bottom: 'auto'
            });
        // Position backdrop absolute and make it span the entire page
        //
        // Also dirty, but we need to tap into the backdrop after Boostrap 
        // positions it but before transitions finish.
        //
        setTimeout(function () {
            $('.modal-backdrop').css({
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: Math.max(
                    document.body.scrollHeight, document.documentElement.scrollHeight,
                    document.body.offsetHeight, document.documentElement.offsetHeight,
                    document.body.clientHeight, document.documentElement.clientHeight
                ) + 'px'
            });
        }, 0);
    });
}
