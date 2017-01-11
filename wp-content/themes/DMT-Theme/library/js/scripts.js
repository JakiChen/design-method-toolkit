/*
 * Bones Scripts File
 * Author: Eddie Machado
 *
 * This file should contain any js scripts you want to add to the site.
 * Instead of calling it in the header or throwing it inside wp_head()
 * this file will be called automatically in the footer so as not to
 * slow the page load.
 *
 * There are a lot of example functions and tools in here. If you don't
 * need any of it, just remove it. They are meant to be helpers and are
 * not required. It's your world baby, you can do whatever you want.
*/


/*
 * Get Viewport Dimensions
 * returns object with viewport dimensions to match css in width and height properties
 * ( source: http://andylangton.co.uk/blog/development/get-viewport-size-width-and-height-javascript )
*/
function updateViewportDimensions() {
	var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],x=w.innerWidth||e.clientWidth||g.clientWidth,y=w.innerHeight||e.clientHeight||g.clientHeight;
	return { width:x,height:y }
}
// setting the viewport width
var viewport = updateViewportDimensions();


/*
 * Throttle Resize-triggered Events
 * Wrap your actions in this function to throttle the frequency of firing them off, for better performance, esp. on mobile.
 * ( source: http://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed )
*/
var waitForFinalEvent = (function () {
	var timers = {};
	return function (callback, ms, uniqueId) {
		if (!uniqueId) { uniqueId = "Don't call this twice without a uniqueId"; }
		if (timers[uniqueId]) { clearTimeout (timers[uniqueId]); }
		timers[uniqueId] = setTimeout(callback, ms);
	};
})();

// how long to wait before deciding the resize has stopped, in ms. Around 50-100 should work ok.
var timeToWaitForLast = 100;


/*
 * Here's an example so you can see how we're using the above function
 *
 * This is commented out so it won't work, but you can copy it and
 * remove the comments.
 *
 *
 *
 * If we want to only do it on a certain page, we can setup checks so we do it
 * as efficient as possible.
 *
 * if( typeof is_home === "undefined" ) var is_home = $('body').hasClass('home');
 *
 * This once checks to see if you're on the home page based on the body class
 * We can then use that check to perform actions on the home page only
 *
 * When the window is resized, we perform this function
 * $(window).resize(function () {
 *
 *    // if we're on the home page, we wait the set amount (in function above) then fire the function
 *    if( is_home ) { waitForFinalEvent( function() {
 *
 *      // if we're above or equal to 768 fire this off
 *      if( viewport.width >= 768 ) {
 *        console.log('On home page and window sized to 768 width or more.');
 *      } else {
 *        // otherwise, let's do this instead
 *        console.log('Not on home page, or window sized to less than 768.');
 *      }
 *
 *    }, timeToWaitForLast, "your-function-identifier-string"); }
 * });
 *
 * Pretty cool huh? You can create functions like this to conditionally load
 * content and other stuff dependent on the viewport.
 * Remember that mobile devices and javascript aren't the best of friends.
 * Keep it light and always make sure the larger viewports are doing the heavy lifting.
 *
*/

/*
 * We're going to swap out the gravatars.
 * In the functions.php file, you can see we're not loading the gravatar
 * images on mobile to save bandwidth. Once we hit an acceptable viewport
 * then we can swap out those images since they are located in a data attribute.
*/
function loadGravatars() {
  // set the viewport using the function above
  viewport = updateViewportDimensions();
  // if the viewport is tablet or larger, we load in the gravatars
  if (viewport.width >= 768) {
  jQuery('.comment img[data-gravatar]').each(function(){
    jQuery(this).attr('src',jQuery(this).attr('data-gravatar'));
  });
	}
} // end function
/*
 * Put all your regular jQuery in here.
*/
jQuery(document).ready(function($) {


  var browsingFilter = false;
  var browsingSearch = false;
  var currentSort = 'name:asc';
  var currentMobileSort = 'filter-sort-name-asc';
  var currentDesktopSort = '#sort-name-asc';
  var originalFilterArray = {
    '.define-intentions' : '.define-intentions',
    '.ideation-concept' : '.ideation-concept',
    '.know-user' : '.know-user',
    '.frame-insights' : '.frame-insights',
    '.prototype-test' : '.prototype-test'};
  //var originalFilterArray = {};
  /*var filterArray = {
    '.define-intentions' : '.define-intentions',
    '.ideation-concept' : '.ideation-concept',
    '.know-user' : '.know-user',
    '.frame-insights' : '.frame-insights',
    '.prototype-test' : '.prototype-test'};*/
  var filterArray = {};
  var changeMade = false;

/*
  $('#content').mixItUp({
  load: {
    filter: '.know-user, .define-intentions, .ideation-concept, .frame-insights, .prototype-test'
  },
  controls: {
   // toggleFilterButtons: true
  }
  });
*/

// To keep our code clean and modular, all custom functionality will be contained inside a single object literal called "buttonFilter".



var buttonFilter = {
  
  // Declare any variables we will need as properties of the object
  
  $filters: null,
  $reset: null,
  $slider: null,
  groups: [],
  outputArray: [],
  outputString: '',
  catFilters: "",
  filtersTime: [],
  
  // The "init" method will run on document ready and cache any jQuery objects we will need.
  
  init: function(){
    var self = this; // As a best practice, in each method we will asign "this" to the variable "self" so that it remains scope-agnostic. We will use it to refer to the parent "buttonFilter" object so that we can share methods and properties between all parts of the object.
    
    self.$filters = $('#filter_menu');
    self.$reset = $('#filter-unselect-all');
    self.$container = $('#content');
    self.$slider = $(".slider");
    
    self.$filters.find('section').each(function(){
      self.groups.push({
        $buttons: $(this).find('.filter'),
        active: ''
      });
    });
    
    
   self.$slider.slider({ 
        min: 0, 
        max: 6, 
        range: true, 
        values: [0, 6] 
    })
    .slider("pips", {
      rest: "label",
      labels: ["1 H", "2 H", "4 H", "1 D", "2 D", "1 W", "2 W"]
    })              
    .slider("float", {
      labels:["1 HOUR", "2 HOURS", "4 HOURS", "1 DAY", "2 DAYS", "1 WEEK", "2 WEEKS"]
    });

    

    self.bindHandlers();



  },
  
  // The "bindHandlers" method will listen for whenever a button is clicked. 
  
  bindHandlers: function(){
      
    var self = this;
    
    // Handle filter clicks
    
    self.$filters.on('click', '.filter', function(e){
      e.preventDefault();
      
      var $button = $(this);
      
      // If the button is active, remove the active class, else make active and deactivate others.
      
      $button.hasClass('active') ?
        $button.removeClass('active') :
        $button.addClass('active').siblings('.filter').removeClass('active');
      
      self.parseFilters();
    });
    
    // Handle reset click
    
    self.$reset.on('click', function(e){
      e.preventDefault();
      
      self.$filters.find('.filter').removeClass('active');
      
      self.parseFilters();
    });

    self.$slider.on("slidechange", function (event, ui) {
      var rangevalues = ui.values;
      var minValue = rangevalues[0];
      var maxValue = rangevalues[1];
      self.filtersTime = [];
      
      
      for (i = minValue; i < maxValue; i++) {
        self.filtersTime.push(".timeMin-"+i);//array of time filters minimun value
        for (j = 0; j < self.filtersTime.lenght; j++) {
          self.filtersTime[j](".timeMax-" + i);//array of time filters maximun value
        }
      }
      
      self.parseFilters();
    });
  },
  
  // The parseFilters method checks which filters are active in each group:
  
  parseFilters: function(){
    
    var self = this;
 
    // loop through each filter group and grap the active filter from each one.
    
    for(var i = 0, group; group = self.groups[i]; i++){
      group.active = group.$buttons.filter('.active').attr('data-filter') || '';
    }
    
    self.concatenate();

  },
  
  // The "concatenate" method will crawl through each group, concatenating filters as desired:

  concatenate: function(){
    
    var self = this;
    var catFilters="";
    var filterValues = [];
    
    self.outputString = ''; // Reset output string
    
    for(var i = 0, group; group = self.groups[i]; i++){
      
      console.log("total group.active "+group.active);
      catFilters += group.active;
    }
    
    

    for (i = 0; i <self.filtersTime.length; i++) {
      console.log("time: "+self.filtersTime);
      console.log(catFilters);
      filterValues.push(catFilters+self.filtersTime[i]);

          /*if(!catFilters.length){
          //(catFilters = 'all'); 
          //self.outputString = catFilters;
            filterValues.push(self.filtersTime[i]);
          } else {
          //catFilters = self.outputString;
          //console.log(catFilters); 
            filterValues.push(catFilters+self.filtersTime[i]);
            //self.filtersTime.push(".timeMax-" + i);
          }*/  
    }

    self.outputString = filterValues.join(',');
    // If time filter is empty filter just by categories
    (!filterValues.length) && (self.outputString = catFilters); 
    // If the output string is empty, show all rather than none:
    (!self.outputString.length) && (self.outputString = 'all'); 
    

    // ^ we can check the console here to take a look at the filter string that is produced
    
    // Send the output string to MixItUp via the 'filter' method:
    
    console.log(self.outputString);

    if(self.$container.mixItUp('isLoaded')){
      self.$container.mixItUp('filter', self.outputString);
    }
  }


};
  
// On document ready, initialise our code.

$(function(){
      
  // Initialize buttonFilter code
      
  buttonFilter.init();
      
  // Instantiate MixItUp
      
  $('#content').mixItUp({
    controls: {
      enable: false // we won't be needing these
    },
    callbacks: {
      onMixFail: function(){
        //alert('No items were found matching the selected filters.');
      }
    }
  });    
});
  
  $('#menu-main-menu').tinyNav({
    header: 'Menu' // Writing any title with this option triggers the header
  });


  
  /*
   * Let's fire off the gravatar function
   * You can remove this if you don't need it
  */
  //loadGravatars();
  	//Show sort menu
  $("#sort").on('click', function() {
   		$(".desktop-filter-sort-menu").fadeIn();
   		$("#filter_menu").fadeOut();
   		$("#search_menu").fadeOut();
   		//$("#content").css('padding-top','180px');
      browsingFilter = true;
	});
	//Show filter menu
	$("#filter").on('click', function() {
      $('.desktop-filter-sort-menu').fadeIn();
   		$("#search_menu").fadeOut();
   		/*var height = $('.desktop-filter-sort-menu').height() + 40;
      $("#content").css('padding-top', height+'px');*/
      browsingFilter = true;
      browsingSearch = false;
	});
	
	//Show desktop search menu
	$("#search").on('click', function() {
      browsingSearch = true;
   		$("#search_menu").fadeIn();
   		$(".desktop-filter-sort-menu").fadeOut();
   		var height = $('.search_menu').height() + 40;
      //$("#content").css('padding-top', '18em');
      browsingFilter = false;
	});

  // Close desktop filter/sort menu
	$("#close").on('click', function() {
   		$(".desktop-filter-sort-menu").fadeOut();
      hideFilterMenu();
   		$("#search_menu").fadeOut();
   		//$("#content").css('padding-top','18em');
      browsingFilter = false;
	});

  // Close desktop search menu
	$("#closeSearch").on('click', function() {
   		$(".desktop-filter-sort-menu").fadeOut();
   		$("#search_menu").fadeOut();
   		$("#content").css('padding-top','0em');
      browsingFilter = false;
      browsingSearch = false;
	});

   
  $(".desktop-sort").on('click', function() {
      if(currentDesktopSort !== ('#'+$(this).attr('id'))) {
        $(currentDesktopSort).removeClass('active');
        $(currentDesktopSort).attr('src', $(currentDesktopSort).attr('src').replace('_selected', '_unselected'));
        $(currentDesktopSort).attr('onerror', $(currentDesktopSort).attr('onerror').replace('_selected', '_unselected'));
        $(this).addClass('active');
        $(this).attr('src', $(this).attr('src').replace('_unselected', '_selected'));
        currentSort = $(this).attr('data-sort');
        currentDesktopSort = '#'+$(this).attr('id');
        updateSort();
        $('#'+currentMobileSort).removeClass('active');
        $('#'+currentMobileSort+' > img').attr('src', $('#'+currentMobileSort+' > img').attr('src').replace('_white_selected', '_unselected'));
        currentMobileSort = $(this).attr('data-mobile-sort');
        $('#'+currentMobileSort).addClass('active');
        $('#'+currentMobileSort+' > img').attr('src', $('#'+currentMobileSort+' > img').attr('src').replace('_unselected', '_white_selected'));
        $('#'+currentMobileSort+' > img').attr('onerror', $('#'+currentMobileSort+' > img').attr('onerror').replace('_unselected', '_white_selected'));
      }
    });



  function mobileSort(name) {
    $('#'+currentMobileSort).removeClass('active');
    var currentsrc = $('#'+currentMobileSort).children('img').attr('src');
    var currentnewsrc = currentsrc.replace('_white_selected', '_unselected');
    $('#'+currentMobileSort).children('img').attr('src', currentnewsrc);
    currentMobileSort = name;
    $('#'+name).addClass('active');
    var src = $('#'+name).children('img').attr('src');
    var newsrc = src.replace('_unselected', '_white_selected');
    $('#'+name).children('img').attr('src', newsrc);
    currentSort = $('#'+name).attr('data-sort');
  }
	
  function updateFilter() {
    var filters = "";
    $.each(filterArray, function(n, elem) {
      filters += elem+',';              
    });
    filters = filters.slice(0, - 1);
    console.log(filters);
    $('#content').mixItUp('forceRefresh');
    $('#content').mixItUp('filter',filters, function(state){
      console.log(state);
    });
  }

  function updateSort() {
    $('#content').mixItUp('sort', currentSort, function(state){
      console.log(state);
    });
  }

  //If a button has already been selected, toggle it (deselect)
  function deselectOthers(currentBtn) {
    var $deselectedFilter = $(".filter-sub-categories").find('.filter-mobile-image');
    $deselectedFilter.each(function( index ) {
      if($( this ).attr('id')!=currentBtn){
        $( this ).attr('src', $( this ).attr('src').replace("_activated", "_deactivated"));
        $( this ).removeClass( "active" );
      }
    });
    //$deselectedFilter.attr('src', $deselectedFilter.attr('src').replace("_activated", "_deactivated"));

    

    //console.log($deselectedFilter.id);

    //modify the other buttons
    //$deselectedFilter.removeClass('active');
    //var img_deselected = $deselectedFilter.attr('src').replace('_activated', '_deactivated');
    //var srcdeactivated;
    /*
    srcdeactivated = $("#filter_define-intentions_m").attr('src').replace('_activated', '_deactivated');
    $("#filter_define-intentions_m").attr('src', srcdeactivated);
    srcdeactivated = $("#filter_ideation-concept_m").attr('src').replace('_activated', '_deactivated');
    $("#filter_ideation-concept_m").attr('src', srcdeactivated);
    srcdeactivated = $("#filter_know-user_m").attr('src').replace('_activated', '_deactivated');
    $("#filter_know-user_m").attr('src', srcdeactivated);
    srcdeactivated = $("#filter_frame-insights_m").attr('src').replace('_activated', '_deactivated');
    $("#filter_frame-insights_m").attr('src', srcdeactivated);
    srcdeactivated = $("#filter_prototype-test_m").attr('src').replace('_activated', '_deactivated');
    $("#filter_prototype-test_m").attr('src', srcdeactivated);
    //filterArray=[];
/*
    } else if($(this).hasClass('filter_ideation-concept')) {
      alert("filter_ideation-concept");
      $('#filter_ideation-concept').toggleClass('active');
    } else if($(this).hasClass('filter_03')) {
      $('#filter_03').toggleClass('active');
    } else if($(this).hasClass('filter_04')) {
      $('#filter_04').toggleClass('active');
    } else if($(this).hasClass('filter_05')) {
      $('#filter_05').toggleClass('active');
    } 
    //$deselectedFilter.attr('src', img_deselected);
    /*
    for (var i = 0; i < $deselectedFilter.length; i++) {
      console.log($deselectedFilter[i]);
      $deselectedFilter[i].find('img').removeClass('.active');
      //deselectedFilter[i].replace('_activated', '_deactivated');
      //console.log(deselectedFilter[i].attr('src'));
    }*/
    //deselectedFilter
    
    //deselectedFilter.attr('src').

  }
  // Click listener for circle filters (desktop and mobile). Updates filters after click
  $(".filter-mobile-image").on('click', function() {
    //group.$buttons.filter('.active').attr('data-filter')

    deselectOthers($(this).attr('id'));
     filterArray={};
      if(!$(this).hasClass("active")) {
        //console.log("not active");
        filterArray[$(this).parent().attr('data-filter')] = originalFilterArray[$(this).parent().attr('data-filter')];
       
        var newsrc = $(this).attr('src').replace('_deactivated', '_activated');
        $(this).attr('src', newsrc);

        $(this).siblings('.filter-mobile-image').removeClass('active');
      } else {
        //console.log("already active");
        delete filterArray[$(this).parent().attr('data-filter')];
        var newsrc = $(this).attr('src').replace('_activated', '_deactivated');
        $(this).attr('src', newsrc);
      }
      changeMade = true;
      $(this ).toggleClass( "active" );
       console.log(filterArray);

      
  });

  

  // Footer and mobile stuff
  $('#filterFooterItem').on('click', function() {
    if(browsingFilter == false) {
       showFilterMenu();
       hideMobileSearchMenu();
     } else {
      $(".desktop-filter-sort-menu").fadeOut();
      $("#search_menu").fadeOut();
      $("#content").css('padding-top','4em');
      hideFilterMenu();
     }
  });

   $('#searchFooterItem').on('click', function() {
    if(browsingSearch == false) {
      showMobileSearchMenu();
      hideFilterMenu();
    } else {
      hideMobileSearchMenu();
    }
  });

  function showMobileSearchMenu() {
    $(".mobile-search-container").fadeIn();
    browsingSearch = true;
  }

  function hideMobileSearchMenu() {
    $(".mobile-search-container").fadeOut();
    browsingSearch = false;
  }

  $('#return-button').on('click', function() {
    hideFilterMenu();
    $(".desktop-filter-sort-menu").fadeOut();
    $("#search_menu").fadeOut();
    $("#content").fadeIn();
    //$("#content").css('padding-top','8.5em');
    updateFilter();
    updateSort();
  });

  $(".toolkit-list-item").on('click', function() {
    if($(this).hasClass('expanded')) {
      $(this).removeClass('expanded');
      $(this).css('height', '4em');
      $(this).children('.using-toolkit-line').css('height', '100%');
    } else {
      $(this).addClass('expanded');
      $(this).css('height', 'auto');
      $(this).children('.using-toolkit-line').css('height', '100%');
    }
  });

  function hideFilterMenu(){
    $('#content').show();
    $('#filter-content').hide();
    browsingFilter = false;
  }

  function showFilterMenu(){
    $('#content').hide();
    $('#filter-content').show();
    browsingFilter = true;

  }
  /*
  $("#filter_all").on('click', function() {
    hideFilterMenu();
    selectAllFilter();
  });

  $("#filter-unselect-all").on('click', function() {
    clearAllFilter();
  });
	*/

  $(".filter-sort").on('click', function (){
    alert("filter sort");
    changeMade = true;
    $(currentDesktopSort).removeClass('active');
    $(currentDesktopSort).attr('src', $(currentDesktopSort).attr('src').replace('_selected', '_unselected'));
    $(currentDesktopSort).attr('onerror', $(currentDesktopSort).attr('onerror').replace('_selected', '_unselected'));
    currentDesktopSort = '#'+$(this).attr('data-desktop-sort');
    $(currentDesktopSort).addClass('active');
    $(currentDesktopSort).attr('src', $(currentDesktopSort).attr('src').replace('_unselected', '_selected'));
    $(currentDesktopSort).attr('onerror', $(currentDesktopSort).attr('onerror').replace('_unselected', '_selected'));
    mobileSort($(this).attr('id'));
  });
	


  $( window ).resize(function() {
    var viewportWidth = $(window).width(); 
    var viewportHeight = $(window).height(); 
    if(viewportWidth <= 800) {
      if(browsingFilter == true) {
        showFilterMenu();
      } else if(browsingFilter != true) {
        hideFilterMenu();
      }
      if(browsingSearch == true) {
        $("#search_menu").hide();
        showMobileSearchMenu();
      } else if(browsingSearch != true) {
        hideMobileSearchMenu();
      }
      if(viewportHeight <= 533) {
        $("#content").css('padding-top','4em');
      } else {
        $("#content").css('padding-top','2em');//8.5em
      }
    } else if(viewportWidth > 800) {
      if(browsingFilter == true) {
        $('.desktop-filter-sort-menu').show();
        var height = $('.desktop-filter-sort-menu').height() + 200;
        $("#content").css('padding-top', height+'px');
      } else if(browsingFilter == false) {
        $('.desktop-filter-sort-menu').hide();
        //$("#content").css('padding-top','14em');
      }
      if(browsingSearch == true) {
        $("#search_menu").show();
        var height = $('.search_menu').height() + 40;
        $("#content").css('padding-top', height+'px');
      } else if(browsingSearch == false && browsingFilter == false) {
        $("#search_menu").hide();
        //$("#content").css('padding-top','14em');
      }
      if(changeMade == true) {
        updateFilter();
        updateSort();
        changeMade = false;
      }
    }
    
  });

  
    

}); /* end of as page load scripts */
