/*
 * ------------------------------------
 * SEARCH.JS
 * ------------------------------------
 */

require([ 'gemini', 'mnmxrange', 'gemini.popdrop', 'gemini.accordion', 'gemini.resetform' ], function( G, MnmxRange ) {
  var mnmxYear = new MnmxRange({
    rangeDisplayElementId: 'mnmx-year',
    rangeTextDisplayElementId: 'mnmx-year--text',
    minDropId: 'year_start',
    minText: 'To ',
    maxText: ' and up',
    maxDropId: 'year_end',
    reverseUnits: true,
    valueCommas: false,
    unit: ''
  });
  mnmxYear.init();

  var mnmxPrice = new MnmxRange({
    rangeDisplayElementId: 'mnmx-price',
    rangeTextDisplayElementId: 'mnmx-price--text',
    minDropId: 'price_amount_start',
    maxDropId: 'price_amount_end',
    minText: 'Up to ',
    maxText: '  and up ',
    nolimText: 'No minimum or maximum',
    moneyStyles: true
  });
  mnmxPrice.init();
  
  var mnmxMileage = new MnmxRange({
    rangeDisplayElementId: 'mnmx-mileage',
    rangeTextDisplayElementId: 'mnmx-mileage--text',
    minDropId: 'odometer_amount_start',
    maxDropId: 'odometer_amount_end',
    minText: 'Up to ',
    maxText: ' and up ',
    nolimText: 'No minimum or maximum',
    unit: 'km',
    unitPrepend: false
  });
  mnmxMileage.init();

  G( '#model_name' ).popdrop({
    url: '/_lookup/models/',
    bind: '#make_name',
    mapping: function( data ) {
      return G._.map( data.data, function( option ) {
        return {
          value: option.id,
          display: option.name + ' (' + option.amount + ')'
        };
      });
    },
    reset: true
  });
  G( '.js-accordion' ).accordion();

  G( '#js-filters-form' ).resetform();

  /**
   * SORT BY FILTER
   * -----------------
   * Update filters when Sort By Select is changed
   */
  var $sortSelect = $( '#js-sort-select' );
  var $filtersForm = $( '#js-filters-form' );

  // Grab the hidden sort and direction input to the form
  var $sortInput = $( '#js-sort-input' );
  var $directionInput = $( '#js-direction-input' );

  // Update input and submit form onChange
  $sortSelect.change( function() {
    $sortInput.val( $sortSelect.find( ':selected' ).data( 'sort' ));
    $directionInput.val( $sortSelect.find( ':selected' ).data( 'direction' ));
    $filtersForm.submit();
  });

  var compareURL = G.D.compareURL || '';

  G( '.js-add-to-compare' ).click( function( evt ) {
    var $checkbox = $( this );
    var $checked = $checkbox.is( ':checked' );
    var itemID = $checkbox.attr( 'id' );
    var itemURL = compareURL + itemID + '/';

    if ( $checked ) {
      $.ajax({
        url: itemURL,
        method: 'POST'
      }).fail( function( err ) {
        console.warn( '-- Add Failed:', err );
      });
    } else {
      $.ajax({
        url: itemURL,
        method: 'DELETE'
      }).fail( function( err ) {
        console.warn( '-- Delete Failed:', err );
      });
    }
  });
});
