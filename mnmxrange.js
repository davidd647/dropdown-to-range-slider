define(["jquery"], function($) {
  /**
   * Note: if you want to use a Reset Filters button on
   * this minmaxRange, you need to put the class 'reset-mnmx-range'
   * onto the button!
   */

  var MnmxRange = function MnmxRange(options) {
    var defaults = {
      rangeDisplayElementId: "multi-slider",
      rangeTextDisplayElementId: "multi-slider--text",
      minDropId: "price_amount_start",
      maxDropId: "price_amount_end",
      minText: "From ",
      maxText: " and up",
      nolimText: "No minimum or maximum",

      valueCommas: true,
      debug: false,
      unit: "$",
      reverseUnits: false,
      unitPrepend: true // if false, it appends to the end of the value
    };

    this.notches = [];
    this.maxNotch = 0;
    this.minNotch = 0;
    this.settings = $.extend(defaults, options);
    this.noMax = true;

    this.numberWithCommas = (x) => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    this.displayPricesRange = function() {
      var plugin = this;

      $textDisplay = $("#" + plugin.settings.rangeTextDisplayElementId);
      // Patch up the 'To 0', '2014 to 0' problem
      if (plugin.notches[plugin.maxNotch] === 0) {
        plugin.noMax = true;
      }

      var tmpStr = "";
      var tmpMinStr = "";
      var tmpMaxStr = "";

      // plugin.noMax is a boolean to trigger terminal string... it's used
      // because the "No Maximum" option is the first option in the dropdown
      tmpMinStr = plugin.notches[plugin.minNotch];
      tmpMaxStr = plugin.notches[plugin.maxNotch];

      // console.log(plugin.settings.valueCommas);
      if (plugin.settings.valueCommas) {
        tmpMinStr = this.numberWithCommas(tmpMinStr);
        tmpMaxStr = this.numberWithCommas(tmpMaxStr);
      }

      if (plugin.settings.unitPrepend) {
        tmpMinStr = plugin.settings.unit + tmpMinStr;
        tmpMaxStr = plugin.settings.unit + tmpMaxStr;
      } else {
        tmpMinStr = tmpMinStr + plugin.settings.unit;
        tmpMaxStr = tmpMaxStr + plugin.settings.unit;
      }

      // max isn't changed, min isn't either
      if (plugin.noMax && plugin.minNotch === 0) {
        tmpStr = plugin.settings.nolimText;
        // max isn't changed, min is
      } else if (plugin.noMax && plugin.minNotch !== 0) {
        tmpStr = tmpMinStr + plugin.settings.maxText;
        // max is changed, min isn't
      } else if (!plugin.noMax && plugin.minNotch === 0) {
        tmpStr = plugin.settings.minText + tmpMaxStr;
      } else {
        tmpStr = tmpMinStr + " to " + tmpMaxStr;
      }

      $textDisplay.text(tmpStr);
    };

    this.updateSliderLine = function() {
      var plugin = this;

      // these need to be tmp because sometimes they swap class names...
      var lineLeft = $(
        "#" + plugin.settings.rangeDisplayElementId + " .slider-min"
      ).css('left');
      var lineRight = $(
        "#" + plugin.settings.rangeDisplayElementId + " .slider-max"
      ).css('left');

      widthLtoR = parseInt( lineRight.replace('px','') - lineLeft.replace('px','') );
      if (widthLtoR < 10) {
        widthLtoR = parseInt( lineLeft.replace('px','') - lineRight.replace('px','') );
      }
      $("#" + plugin.settings.rangeDisplayElementId + " .slider-line").css({
        left: lineLeft,
        width: widthLtoR + "px"
      });
    }

    this.calcCurrentNotch = function(x, sliderLeft, sliderWidth) {
      // Find position of the mouse inside the slider as a percentage
      var currentSliderProgress = (x - sliderLeft) / sliderWidth;
      // Find currentSliderProgress's % progress through mnmxRange.notches
      var currentNotch = Math.floor(
        this.notches.length * currentSliderProgress
      );

      return currentNotch;
    };

    this.updateFromSelects = function() {
      var plugin = this;
      var minIndex = $("#" + plugin.settings.minDropId + " :selected").index();
      var maxIndex = $("#" + plugin.settings.maxDropId + " :selected").index();
      if (plugin.settings.reverseUnits) {
        minIndex = plugin.notches.length - minIndex;
        maxIndex = plugin.notches.length - maxIndex;
        if (minIndex === plugin.notches.length) minIndex = 0;
        if (maxIndex === plugin.notches.length) maxIndex = 0;
      }
      this.minNotch = minIndex;
      if (maxIndex !== 0) {
        this.noMax = false;
      }
      this.maxNotch = maxIndex;
      this.displayPricesRange();

      // Add the left values to the minNotch and maxNotch
      var minLeft = (minIndex / plugin.notches.length) * 100;
      var maxLeft = (maxIndex / plugin.notches.length) * 100;
      $("#" + plugin.settings.rangeDisplayElementId + " .slider-min").css(
        "left",
        minLeft + "%"
      );
      $("#" + plugin.settings.rangeDisplayElementId + " .slider-max").css(
        "left",
        maxLeft + "%"
      );
      this.updateSliderLine();
      if (maxLeft === 0) {
        $("#" + plugin.settings.rangeDisplayElementId + " .slider-max").css(
          "left",
          "calc(100% - 1rem)"
        );
      }
    };

    this.init = function() {
      // Calculate maxNotch
      var plugin = this;
      plugin.settings.mouseIsDown = false;
      plugin.settings.currentSliderDot;
      $options = $("#" + plugin.settings.minDropId + " option");

      if (plugin.settings.reverseUnits) {
        $options = $($options.get().reverse());
      }

      $options.each(function(i, priceNotch) {
        priceNotch = parseInt($(priceNotch).val());
        if (isNaN(priceNotch)) {
          priceNotch = 0;
        }
        plugin.notches.push(priceNotch);
      });
      plugin.maxNotch = plugin.notches.length - 1;

      if (plugin.debug) {
        // Test to make sure the selects hold the same values:
        var test = [];
        $("#" + plugin.settings.maxDropId + " option").each(function(
          i,
          priceNotch
        ) {
          priceNotch = parseInt($(priceNotch).val());
          if (isNaN(priceNotch)) {
            priceNotch = 0;
          }
          test.push(priceNotch);
        });

        if (JSON.stringify(plugin.notches) !== JSON.stringify(test)) {
          console.warn(
            "❌ The min values and max values from the selects do not match. mnmxRange may act unpredictably."
          );
          console.warn(JSON.stringify(plugin.notches));
          console.warn(JSON.stringify(test));
        } else {
          console.log(
            "💯 The min values and max values match. mnmxRange should act predictably."
          );
        }
      }

      this.displayPricesRange();
      this.updateFromSelects();
      this.addEventListeners();
      this.updateSliderLine();
    };

    this.addEventListeners = function() {
      var plugin = this;

      // Sense if mouse is clicked on a .slider-dot
      $("#" + plugin.settings.rangeDisplayElementId + " .slider-dot").on(
        "mousedown",
        function() {
          plugin.settings.currentSliderDot = $(this);
          plugin.mouseIsDown = true;
        }
      );

      $("body").on("mouseup", function() {
        if (plugin.mouseIsDown) {
          // Update dropdowns
          if (plugin.settings.reverseUnits) {
            $(
              "#" +
                plugin.settings.minDropId +
                " :nth-child(" +
                // Using ternary operator because the only units that are
                // reversed are the numerical values (not the 'no limit' values)
                parseInt(
                  plugin.minNotch === 0
                    ? 1
                    : plugin.notches.length - plugin.minNotch
                ) +
                ")"
            ).prop("selected", true);
          } else {
            $(
              "#" +
                plugin.settings.minDropId +
                " :nth-child(" +
                (plugin.minNotch + 1) +
                ")"
            ).prop("selected", true);
          }

          // 'No Maximum' is the 1st option in the select (not the last), so this looks kinda weird, but...
          // When the maxNotch is as far to the right as possible...
          if (plugin.maxNotch >= plugin.notches.length - 1) {
            // Just choose the 'No Maximum' option
            $("#" + plugin.settings.maxDropId + " :nth-child(1)").prop(
              "selected",
              true
            );
          } else {
            // Otherwise do what we did for the minNotch
            if (plugin.noMax) {
              $("#" + plugin.settings.maxDropId + " :nth-child(1)").prop(
                "selected",
                true
              );
            } else {
              if (plugin.settings.reverseUnits) {
                $(
                  "#" +
                    plugin.settings.maxDropId +
                    " :nth-child(" +
                    parseInt(plugin.notches.length - plugin.maxNotch) +
                    ")"
                ).prop("selected", true);
              } else {
                $(
                  "#" +
                    plugin.settings.maxDropId +
                    " :nth-child(" +
                    (plugin.maxNotch + 1) +
                    ")"
                ).prop("selected", true);
              }
            }
          }
        }
        plugin.mouseIsDown = false;
        plugin.updateSliderLine();
      });

      $("body").on("mousemove", function(e) {
        if (plugin.mouseIsDown) {
          // If the slider-min is further right than the slider-max, swap 'em
          // Swapping shouldn't occur for no-max value (which is 0)
          if (plugin.minNotch > plugin.maxNotch && plugin.maxNotch !== 0) {
            // Swap the classes of their elements refresh
            $tmpMin = $(
              "#" + plugin.settings.rangeDisplayElementId + " .slider-min"
            );
            $tmpMax = $(
              "#" + plugin.settings.rangeDisplayElementId + " .slider-max"
            );
            $tmpMin.addClass("slider-max").removeClass("slider-min");
            $tmpMax.addClass("slider-min").removeClass("slider-max");
            // Swap the values of plugin.minNotch and maxNotch
            var tmp = plugin.minNotch;
            plugin.minNotch = plugin.maxNotch;
            plugin.maxNotch = tmp;
            // Display on screen again
            plugin.displayPricesRange();
          }
          // How far is the selected slider from the left?
          var sliderLeft = plugin.settings.currentSliderDot.parent().offset()
            .left;
          var sliderWidth = plugin.settings.currentSliderDot.parent().width();
          var sliderDotWidth = plugin.settings.currentSliderDot.width();
          var mouseX = e.pageX;

          // Restrict slider dots from leaving bounds of slider
          if (mouseX < sliderLeft) {
            mouseX = sliderLeft;
          } else if (mouseX > sliderLeft + sliderWidth - sliderDotWidth) {
            mouseX = sliderLeft + sliderWidth - sliderDotWidth;
            // On the far right, 'No Maximum' should be applied to the dropdown
            plugin.noMax = true;
          } else {
            if (!plugin.settings.currentSliderDot.hasClass("slider-min")) {
              plugin.noMax = false;
            }
          }

          // Make the slider-dot follow the mouse
          plugin.settings.currentSliderDot.css(
            "left",
            mouseX - sliderLeft + "px"
          );

          var currentNotch = plugin.calcCurrentNotch(
            mouseX,
            sliderLeft,
            sliderWidth
          );

          if (plugin.settings.currentSliderDot.hasClass("slider-min")) {
            plugin.minNotch = currentNotch;
          } else {
            plugin.maxNotch = currentNotch;
          }

          // Display the limit value on the screen
          plugin.displayPricesRange();

          plugin.updateSliderLine();
        }
      });

      $("a.reset-mnmx-range").on("click", function() {
        plugin.noMax = true;
        plugin.updateFromSelects();
        plugin.updateSliderLine();
      });
    };
  };

  return MnmxRange;
});
