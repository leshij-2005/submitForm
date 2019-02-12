/*
 ! Submit Form v2.2 | (c) 2013 - 2018 Ershov Alexey
*/

(function($) {
  
  var FIELDS = ['INPUT', 'SELECT', 'TEXTAREA'];
  var STATE = {
    processing: 'processing',
    error: 'error',
    success: 'success',
  };

  var SPECIAL_KEYS = [37, 39, 8, 46, 13, 10, 36, 35, 9];

  var fields = [];
  
  var validators = {
    required: function(item) {
      var value = item.type === 'radio' || item.type === 'checkbox' ? item.checked : $(item).val().trim();
      
      if (!value) {
        $(item).addClass('invalid');
      }

      return !!value;
    },
    phone: function(item) {
      var value = $(item).val();
      var valid = true;

      if (!(/^[0-9()\-+\s]+$/).test(value) || value.length < 6) {
        $(item).addClass('invalid');
        valid = false;
      }

      return valid;
    },
    email: function(item) {
      var value = $(item).val();
      var valid = true;

      if (value && !(/^[а-яА-Яa-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[а-яА-Яa-zA-Z0-9-]+(?:\.[а-яА-Яa-zA-Z0-9-]+)*$/i).test(value)) {
        $(item).addClass('invalid');
        valid = false;
      }

      return valid;
    },
    date: function(item) {
      var value = $(item).val();
      var valid = true;

      if (value) {
        var dateArr = value.split('.');
        var date = new Date(dateArr[2], dateArr[1] - 1, dateArr[0], 0, 0, 0, 0);
        
        valid = !isNaN(date.getTime()) && (parseInt(dateArr[1]) === (date.getMonth() + 1));

        if (!valid) {
          $(item).addClass('invalid');
        }
      }

      return valid;
    },      
    minlength: function(item){
      var minlength = $(item).attr('minlength');
      var value = $(item).val();
      var valid = true;

      if (value.length < minlength) {
        valid = false;
        $(item).addClass('invalid');
      }

      return valid;
    },
    number: function(item) {
      var value = $(item).val();
      var valid = true;

      if (value && !(/^\d+$/).test(value)) {
        $(item).addClass('invalid');
        valid = false;
      }

      return valid;
    },
    name: function(item) {
      var value = $(item).val();
      var valid = true;

      if (value && (/[\d/\|:@%&*()^~`"'+$#№]/).test(value)) {
        $(item).addClass('invalid');
        valid = false;
      }

      return valid;
    },
  };

  function searchField(node) {
    $(node.children).each(function(index, item){
      if ($.inArray(item.nodeName, FIELDS) !== -1 && !item.disabled) {
        fields.push(item);
      }

      if (item.childElementCount) {
        searchField(item);
      }
    });

    return fields;
  }

  function validateField(field) {
    var validAttr = $(field).attr('data-validate');
    $(field).removeClass('invalid');
    $(field).removeClass('valid');
      
    if (validAttr) {
      var valids = validAttr.split(', ');
      for (var j = 0; validator = valids[j]; j++) {
        var f = validators[validator];

        $(field).removeClass('invalid');
        valid = f(field);
        if(!valid) {
          $(field).focus();
          $(this).addClass('invalid-' + validator);
          
          return false;
        }
      }

      if (!valid) {
        if (this.options.invalidHandler !== undefined) {
          this.options.invalidHandler(item);
        }

        return false;
      }
    }

    $(field).addClass('valid');
    
    return true;
  }

  function validate() {
    var that = this;

    fields = [];
    this.fields = searchField(this);
    
    $.each(validators, function (key, item) {
      $(that).removeClass('invalid-' + key);
    });

    var valid = false;
    for (var i = 0; i < fields.length ; i++) {
      var item = this.fields[i];
      valid = validateField.call(that, item);

      if (!valid) {
        break;
      }
    }

    return valid;
  }

  function submit() {
    $.each(this.state, function (idx, state) {
      $(this).removeClass(state);
    });
     
    if (validate.call(this)) {
      var data = {};
      $(this.fields).each(function (index, item) {
        var name = item.name || item.id;
        var value;
        
        if ((item.type === 'radio' || item.type === 'checkbox') && item.checked) {
            value = $(item).val();
        }
        
        if (/text|hidden|password|tel/.test(item.type) || item.nodeName === 'SELECT' || item.nodeName === 'TEXTAREA') {
          value = $(item).val();
        }
          
        if (value !== undefined) {
          if (data[name]) {
            if (typeof data[name] !== 'object') {
              data[name] = [data[name]];
            }

            data[name].push(value);
          } else {
            data[name] = value;
          }
        }
      });
      
      data = this.options.prepare(data);

      if (this.options.ajax) {
        if (this.options.ajaxObject) {
          this.options.ajaxObject.data = data;
        } else {
          this.options.ajaxObject = {
            url:  this.options.source,
            type: this.options.method,
            data:  data,
            beforeSend: this.options.onBeforeSend,
            success: this.options.onSuccess,
            error: this.options.onError
          };
        }

        if (this.options.beforeSend(data)) {
          $.ajax(this.options.ajaxObject);
        }

        return false;
      } else {
        this.options.onBeforeSend();
        
        return true;
      }
    } else {
      return false;
    }    
  }

  var methods = {
    init: function (params) {

      return this.each(function (idx, item) {
   
        var $this = $(item);          

        var defaults = {
          ajaxObject: null,
          source: $this.attr('action') || '/',
          method: $this.attr('method') || 'POST',
          ajax: true,
          responseElement: $(this),
          onBeforeSend: function (obj) {
            $this.addClass(item.state.processing);
          },
          onSuccess: function (response, status, obj) {
            $this.removeClass(item.state.processing);
            $this.addClass(item.state.success);
            
            var s = item.options.success && item.options.success(response);
            if (s || s === undefined) {
              item.options.responseElement.html(response);
            }
          },
          onError: function (obj, status, error) {
            $this.removeClass(item.state.processing);
            $this.addClass(item.state.error);
            
            var s = item.options.error ? item.options.error(status, error) : undefined;
            if (s) {
              item.options.responseElement.html(error);
            }
          },
          success: function(response) {},
          prepare: function(data) { return data; },
          beforeSend: function(data) { return true; }
        };          

        var options = $.extend({}, defaults, params);
        item.options = options;

        $this.submit(submit);

        item.fields = searchField(item);

        item.state = params && params.state ? $.extend(STATE, params.state) : STATE;

        var that = item;

        $.each(item.fields, function (idx, field) {
          $(field).keyup(function (event) {
            $(field).removeClass('valid');
            
            if (SPECIAL_KEYS.indexOf(event.keyCode) == -1 && that.options.validateOnEnter) {
              validateField.call(that, field);
            }
          });

          $(field).change(function (event) {
            if (that.options.validateOnEnter) {
              validateField.call(that, field);
            }
          });
        });
      });     
    },
    loadData: function (data) {
      this.fields = searchField(this);

      $.each(this.fields, function (idx, field) {
        if (data[field.name]) {
          $(field).val(data[field.name]);
        }
      });
    },
    validate: function () {
      validate.call(this);
    }
  };

  $.fn.submitForm = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else {
      if (typeof method === 'object' || !method) {
        return methods.init.apply(this, arguments);
      } else {
        $.error('Method "' +  method + '" not found!');
      }
    }
  };
})($);