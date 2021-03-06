/**
 * Created by charlie tomlinson on 3/9/14.
 * email: charlietfl@gmail.com
 */


var duplicate_flights=true;
console.error('duplicate_flights is enabled !!!');


/* main function called in joomla pages*/
function FlightTables(options){

    var $=jQuery;
    /*flightTableVars*/
    if( !options  && ! options.pathToXml){
        alert('[Flight Tables] - No path to xml set in admin');
        return;

    }

//var pathToXml='../flightTablesTestData.xml';
    var pathToXml=options.pathToXml;


    var headings={
        arrive:[ "Time","From","Flight",  "Airline",  "Status","Day"],
        depart:[ "Time","To","Flight",  "Airline",  "Status","Day"]
    };

    var col_priorities=['always','always','always','low','high','low'];
    var xmlTags=['time','airport','name','airline','remark','date'];
    var days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var flights={
        arrive:[],
        depart:[]
    }

    function initFlightTables(){
        var $flightContainers=$('.flight_table_wrap');
        /* don't do anything if no containers exist*/
        if(! $flightContainers.length){
            return;
        }
        /* events for show more button*/
        $flightContainers.on('click','.flights_show_more',function(){

            var $btn=$(this);
            var $container= $btn.closest('.flight_table_wrap').toggleClass(('show_all'));



        });
        loadFlights();

    }
    function loadFlights(){
        $.ajax({
            url:		pathToXml,
            cache: 	false,
            type:	'get',
            dataType:'xml',
            success: xmlSuccess,
            error: 	function(){}

        });

    }

    function buildTables(){
        $.each(['arrive','depart'],function(i, flightType){
            var $container=$('.flight_table_wrap.flight_'+flightType);
            var rows_limit=$container.data('row_limit');
            rows_limit = rows_limit && !isNaN(rows_limit) ? rows_limit : false;
            var html= tableHeaderHtml(flightType);
            var flightsArray=flights[flightType] ;
            //console.log('flightArr',flightsArray)
            if(flightsArray.length){
                html+=tableHtml(flightType,flightsArray, rows_limit);
            }

            html+=tablefooterHtml(flightType,flightsArray,rows_limit);
            $container.html(html);
        });
    }

    function xmlSuccess(data){
        var $xml=$(data);
        $.each(['arrive','depart'],function(i, flightType){
            var flightTag= flightType =='arrive'?  'arrflight' : 'depflight';
            $xml.find(flightTag).each(function(){
                var $flight=$(this), row=[];
                $.each(xmlTags, function(idx, propertyTag){
                    row.push($flight.find(propertyTag).text());
                });
                flights[flightType].push(row);
                /* testing behavior on live site*/
                if(duplicate_flights){
                    flights[flightType].push(row);
                }
            })
        });
        buildTables();
        //console.dir(flights);
    }

    function flightRowHtml(flightType,flightArr, hide_row){

        var row='<tr>';
        if(hide_row){
            row='<tr class="over_limit">';
        }

        $.each(flightArr,function(i,value){
            if(xmlTags[i]=='date'){
                value=dayText(value);
            }
            var cellClass=col_priorities[i]+' '+headings[flightType][i];


            row+='<td class="'+cellClass+'">'+value+'</td>';
        })
        row+='</tr>';
        return row;
    }

    function flightHeadingRowHtml(flightType){
        var row='<thead><tr>';
        $.each(headings[flightType],function(i,value){
            var cellClass=col_priorities[i]+' '+headings[flightType][i];
            row+='<th class="'+cellClass+'">'+value+'</th>';
        });
        row+='</tr></thead>';
        return row;
    }

    function tableHtml( flightType, flightsArray, rowsLimit){
        var html='<table class="flights_table  uk-table uk-table-striped uk-table-condensed">';
        html+=flightHeadingRowHtml(flightType);
        $.each(flightsArray, function( i, flightArr){
            var hide_row= rowsLimit &&  (i+1) > rowsLimit ;

            html+=flightRowHtml(flightType,flightArr, hide_row)
        });
        html+='</table>';
        return html;
    }

    function tableHeaderHtml(flightType){
        var flightsText= flightType =='arrive' ? 'Arrivals' : 'Departures';
        var html='<div class="flight_table_header">' +
            '        <span class="flight_icon"></span>' +
            '        <span class="flight_table_type">'+flightsText+'</span>' +
            '    </div>';

        return html
    }

    function tablefooterHtml(flightType, flightsArray, rowsLimit/*, flightsCount, rowLimit*/){
        var num_rows=flightsArray.length;
        var flightsText= flightType =='arrive' ? 'Arrivals' : 'Departures';
        var how_many_text= rowsLimit && num_rows > rowsLimit ? rowsLimit+' of '+num_rows : 'All'
        var show_more_button='<button data-num_rows="'+num_rows+'" class="flights_show_more">View <span class="more_text">All </span> <span class="less_text">Less </span><span class="flight_table_type">'+flightsText+'</span></button>'
        var html='<div class="flight_table_footer">';
        if(num_rows){
            html+= '<span class="flights_count"><span class="displaying">Displaying </span>  ' +
                '<span class="how_many more_text" data-text="'+how_many_text+'">'+how_many_text+'</span> ' +
                '<span class="less_text">All</span> ' +
                'Flights</span>';
        }else{
            html+= '<span class="flights_count">'+flightTableVars.no_flights_text+'</span>';
        }

        if(rowsLimit && num_rows && num_rows > rowsLimit){
            html+=show_more_button;
        }
        html+='    </div>';

        return html;

    }

    function dayText( dateString){
        var dateStr=dateString.replace(/-/g,'/');
        var d=new Date(dateStr);
        return days[ d.getDay()];
    }




    $(function(){
        initFlightTables();
    });

}


